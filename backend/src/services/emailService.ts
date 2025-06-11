import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

export interface EmailConfig {
  provider: 'sendgrid' | 'smtp' | 'gmail' | 'none';
  from: string;
  fromName: string;
}

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private config: EmailConfig;
  private transporter?: nodemailer.Transporter;

  constructor() {
    this.config = this.getEmailConfig();
    this.initialize();
  }

  private getEmailConfig(): EmailConfig {
    const provider = (process.env.EMAIL_PROVIDER || 'none') as EmailConfig['provider'] | 'none';
    
    return {
      provider: provider === 'none' ? 'smtp' : provider,
      from: process.env.EMAIL_FROM || 'noreply@taskmanager.com',
      fromName: process.env.EMAIL_FROM_NAME || 'Task Manager'
    };
  }

  private async initialize() {
    try {
      // Check if any email configuration exists
      const hasEmailConfig = this.hasEmailConfiguration();
      
      if (!hasEmailConfig) {
        console.log('📧 Email service initialized in DEVELOPMENT mode (no email config)');
        return;
      }

      switch (this.config.provider) {
        case 'sendgrid':
          await this.initializeSendGrid();
          break;
        case 'gmail':
          await this.initializeGmail();
          break;
        case 'smtp':
        default:
          await this.initializeSMTP();
          break;
      }
      
      console.log(`📧 Email service initialized with ${this.config.provider.toUpperCase()}`);
    } catch (error) {
      console.log('⚠️ Email service initialization failed, running in development mode');
      console.log('💡 To enable emails, configure EMAIL_PROVIDER and related variables in .env');
    }
  }

  private hasEmailConfiguration(): boolean {
    // Check if any email provider is configured
    if (process.env.SENDGRID_API_KEY) return true;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) return true;
    if (process.env.EMAIL_PROVIDER && process.env.EMAIL_PROVIDER !== 'none') return true;
    
    return false;
  }

  private async initializeSendGrid() {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is required for SendGrid provider');
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid initialized');
  }

  private async initializeGmail() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('EMAIL_USER and EMAIL_PASSWORD are required for Gmail provider');
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    console.log('✅ Gmail SMTP initialized');
  }

  private async initializeSMTP() {
    if (!process.env.SMTP_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('SMTP_HOST, EMAIL_USER, and EMAIL_PASSWORD are required for SMTP provider');
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    console.log('✅ SMTP initialized');
  }

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      console.log(`📧 Sending email to ${template.to} via ${this.config.provider.toUpperCase()}`);

      switch (this.config.provider) {
        case 'sendgrid':
          return await this.sendWithSendGrid(template);
        case 'gmail':
        case 'smtp':
        default:
          return await this.sendWithSMTP(template);
      }
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  private async sendWithSendGrid(template: EmailTemplate): Promise<boolean> {
    try {
      const msg = {
        to: template.to,
        from: {
          email: this.config.from,
          name: this.config.fromName
        },
        subject: template.subject,
        html: template.html,
        text: template.text || this.stripHtml(template.html)
      };

      await sgMail.send(msg);
      console.log('✅ Email sent successfully via SendGrid');
      return true;
    } catch (error) {
      console.error('❌ SendGrid error:', error);
      return false;
    }
  }

  private async sendWithSMTP(template: EmailTemplate): Promise<boolean> {
    if (!this.transporter) {
      console.error('❌ SMTP transporter not initialized');
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.from}>`,
        to: template.to,
        subject: template.subject,
        html: template.html,
        text: template.text || this.stripHtml(template.html)
      });

      console.log('✅ Email sent successfully via SMTP:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ SMTP error:', error);
      return false;
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  // Template methods for common emails
  async sendPasswordResetEmail(to: string, resetUrl: string, userName?: string): Promise<boolean> {
    const template: EmailTemplate = {
      to,
      subject: 'Restablecer contraseña - Task Manager',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Restablecer Contraseña</h1>
            </div>
            <div class="content">
              <h2>Hola${userName ? ` ${userName}` : ''}!</h2>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Task Manager</strong>.</p>
              <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
              <p><small>Este enlace expirará en 10 minutos por seguridad.</small></p>
              <p>Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo válida.</p>
              <hr>
              <p><strong>¿Tienes problemas con el botón?</strong><br>
              Copia y pega este enlace en tu navegador:<br>
              <small>${resetUrl}</small></p>
            </div>
            <div class="footer">
              <p>© 2024 Task Manager | Sistema de gestión de tareas</p>
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return await this.sendEmail(template);
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
    const template: EmailTemplate = {
      to,
      subject: '¡Bienvenido a Task Manager! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ¡Bienvenido!</h1>
            </div>
            <div class="content">
              <h2>¡Hola ${userName}!</h2>
              <p>¡Te damos la bienvenida a <strong>Task Manager</strong>! 🚀</p>
              <p>Tu cuenta ha sido creada exitosamente. Ahora puedes:</p>
              <ul>
                <li>✅ Crear y organizar tus tareas</li>
                <li>📝 Establecer prioridades</li>
                <li>⏰ Hacer seguimiento de tu progreso</li>
                <li>🎯 Aumentar tu productividad</li>
              </ul>
              <p>¡Esperamos que disfrutes usando nuestra aplicación!</p>
            </div>
            <div class="footer">
              <p>© 2024 Task Manager | Sistema de gestión de tareas</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return await this.sendEmail(template);
  }

  // Health check method
  async testConnection(): Promise<boolean> {
    try {
      // First check if we have any email configuration
      if (!this.hasEmailConfiguration()) {
        return false;
      }

      switch (this.config.provider) {
        case 'sendgrid':
          // SendGrid doesn't have a direct test method, but we can check API key
          return !!process.env.SENDGRID_API_KEY;
        case 'gmail':
        case 'smtp':
          if (this.transporter) {
            await this.transporter.verify();
            return true;
          }
          return false;
        default:
          return false;
      }
    } catch (error) {
      console.error('❌ Email service test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService; 