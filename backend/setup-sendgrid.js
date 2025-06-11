#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupSendGrid() {
  console.log('🚀 Configurador de SendGrid para Producción\n');
  
  try {
    // Get current .env content
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    console.log('📧 Vamos a configurar el email service para tu aplicación.\n');
    
    // Get SendGrid API Key
    const apiKey = await question('1. Ingresa tu SendGrid API Key (SG.xxx...): ');
    if (!apiKey.startsWith('SG.')) {
      console.log('❌ Error: La API Key debe empezar con "SG."');
      process.exit(1);
    }

    // Get domain info
    const fromEmail = await question('2. Email desde donde enviar (ej: noreply@tudominio.com): ');
    const fromName = await question('3. Nombre que aparece en el email (ej: Task Manager): ') || 'Task Manager';

    // Update or create .env
    const newEnvVars = {
      'EMAIL_PROVIDER': 'sendgrid',
      'EMAIL_FROM': fromEmail,
      'EMAIL_FROM_NAME': fromName,
      'SENDGRID_API_KEY': apiKey
    };

    // Parse existing .env and update
    let envLines = envContent.split('\n');
    
    Object.entries(newEnvVars).forEach(([key, value]) => {
      const existingIndex = envLines.findIndex(line => line.startsWith(`${key}=`));
      const newLine = `${key}=${value}`;
      
      if (existingIndex !== -1) {
        envLines[existingIndex] = newLine;
      } else {
        envLines.push(newLine);
      }
    });

    // Add email configuration section if not exists
    if (!envContent.includes('# Email Service Configuration')) {
      envLines.push('');
      envLines.push('# Email Service Configuration');
    }

    // Write updated .env
    fs.writeFileSync(envPath, envLines.join('\n'));

    console.log('\n✅ Configuración completada!');
    console.log('\n📄 Archivo .env actualizado con:');
    console.log(`   EMAIL_PROVIDER=sendgrid`);
    console.log(`   EMAIL_FROM=${fromEmail}`);
    console.log(`   EMAIL_FROM_NAME=${fromName}`);
    console.log(`   SENDGRID_API_KEY=${apiKey.substring(0, 10)}...`);

    console.log('\n🧪 Para probar la configuración:');
    console.log('   1. Reinicia tu servidor: npm run dev');
    console.log('   2. Intenta restablecer una contraseña');
    console.log('   3. Revisa los logs del servidor');

    console.log('\n📚 Documentación completa en: PRODUCTION-EMAIL-SETUP.md');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Validation helper
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (require.main === module) {
  setupSendGrid();
}

module.exports = { setupSendGrid }; 