"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
class EmailService {
    constructor() {
        this.config = this.getEmailConfig();
        this.initialize();
    }
    getEmailConfig() {
        const provider = (process.env.EMAIL_PROVIDER || 'none');
        return {
            provider: provider === 'none' ? 'smtp' : provider,
            from: process.env.EMAIL_FROM || 'noreply@taskmanager.com',
            fromName: process.env.EMAIL_FROM_NAME || 'Task Manager'
        };
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if any email configuration exists
                const hasEmailConfig = this.hasEmailConfiguration();
                if (!hasEmailConfig) {
                    console.log('📧 Email service initialized in DEVELOPMENT mode (no email config)');
                    return;
                }
                switch (this.config.provider) {
                    case 'sendgrid':
                        yield this.initializeSendGrid();
                        break;
                    case 'gmail':
                        yield this.initializeGmail();
                        break;
                    case 'smtp':
                    default:
                        yield this.initializeSMTP();
                        break;
                }
                console.log(`📧 Email service initialized with ${this.config.provider.toUpperCase()}`);
            }
            catch (error) {
                console.log('⚠️ Email service initialization failed, running in development mode');
                console.log('💡 To enable emails, configure EMAIL_PROVIDER and related variables in .env');
            }
        });
    }
    hasEmailConfiguration() {
        // Check if any email provider is configured
        if (process.env.SENDGRID_API_KEY)
            return true;
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
            return true;
        if (process.env.EMAIL_PROVIDER && process.env.EMAIL_PROVIDER !== 'none')
            return true;
        return false;
    }
    initializeSendGrid() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!process.env.SENDGRID_API_KEY) {
                throw new Error('SENDGRID_API_KEY is required for SendGrid provider');
            }
            mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
            console.log('✅ SendGrid initialized');
        });
    }
    initializeGmail() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
                throw new Error('EMAIL_USER and EMAIL_PASSWORD are required for Gmail provider');
            }
            this.transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
            console.log('✅ Gmail SMTP initialized');
        });
    }
    initializeSMTP() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!process.env.SMTP_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
                throw new Error('SMTP_HOST, EMAIL_USER, and EMAIL_PASSWORD are required for SMTP provider');
            }
            this.transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
            console.log('✅ SMTP initialized');
        });
    }
    sendEmail(template) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`📧 Sending email to ${template.to} via ${this.config.provider.toUpperCase()}`);
                switch (this.config.provider) {
                    case 'sendgrid':
                        return yield this.sendWithSendGrid(template);
                    case 'gmail':
                    case 'smtp':
                    default:
                        return yield this.sendWithSMTP(template);
                }
            }
            catch (error) {
                console.error('❌ Failed to send email:', error);
                return false;
            }
        });
    }
    sendWithSendGrid(template) {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield mail_1.default.send(msg);
                console.log('✅ Email sent successfully via SendGrid');
                return true;
            }
            catch (error) {
                console.error('❌ SendGrid error:', error);
                return false;
            }
        });
    }
    sendWithSMTP(template) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.transporter) {
                console.error('❌ SMTP transporter not initialized');
                return false;
            }
            try {
                const info = yield this.transporter.sendMail({
                    from: `"${this.config.fromName}" <${this.config.from}>`,
                    to: template.to,
                    subject: template.subject,
                    html: template.html,
                    text: template.text || this.stripHtml(template.html)
                });
                console.log('✅ Email sent successfully via SMTP:', info.messageId);
                return true;
            }
            catch (error) {
                console.error('❌ SMTP error:', error);
                return false;
            }
        });
    }
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '');
    }
    // Template methods for common emails
    sendPasswordResetEmail(to, resetUrl, userName) {
        return __awaiter(this, void 0, void 0, function* () {
            const template = {
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
            return yield this.sendEmail(template);
        });
    }
    sendWelcomeEmail(to, userName) {
        return __awaiter(this, void 0, void 0, function* () {
            const template = {
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
            return yield this.sendEmail(template);
        });
    }
    // Health check method
    testConnection() {
        return __awaiter(this, void 0, void 0, function* () {
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
                            yield this.transporter.verify();
                            return true;
                        }
                        return false;
                    default:
                        return false;
                }
            }
            catch (error) {
                console.error('❌ Email service test failed:', error);
                return false;
            }
        });
    }
}
// Export singleton instance
exports.emailService = new EmailService();
exports.default = exports.emailService;
