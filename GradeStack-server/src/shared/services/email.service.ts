import { emailTransporter } from '../config/email.config';
import { EmailType, EmailTemplate } from '../types/email.types';
import { generateRandomCode } from '../../shared/utils/common.util';

export class EmailService {
  private static async sendEmail(to: string, subject: string, html: string) {
    try {
      await emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'GradeStack <noreply@gradestack.com>',
        to,
        subject,
        html
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  private static getTemplate(type: EmailType, data: any = {}): EmailTemplate {
    switch (type) {
      case EmailType.VERIFICATION:
        return {
          subject: 'Verify Your Email - GradeStack',
          html: `
            <h1>Welcome to GradeStack!</h1>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${data.verificationLink}" style="
              padding: 10px 20px;
              background-color: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 5px;
            ">Verify Email</a>
            <p>If you didn't create an account, please ignore this email.</p>
          `
        };

      case EmailType.VERIFICATION_CODE:
        return {
          subject: 'Your Verification Code - GradeStack',
          html: `
            <h1>Verification Code</h1>
            <p>Your verification code is:</p>
            <h2 style="
              padding: 20px;
              background-color: #f5f5f5;
              font-size: 24px;
              text-align: center;
              letter-spacing: 5px;
            ">${data.code}</h2>
            <p>This code will expire in 10 minutes.</p>
          `
        };

      case EmailType.WELCOME:
        return {
          subject: 'Welcome to GradeStack! 🎉',
          html: `
            <h1>Welcome to GradeStack!</h1>
            <p>Hi ${data.email},</p>
            <p>Thank you for joining GradeStack. We're excited to have you on board!</p>
            <h2>Getting Started</h2>
            <ul>
              <li>Complete your profile</li>
              <li>Explore our features</li>
              <li>Connect with others</li>
            </ul>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Best regards,<br>The GradeStack Team</p>
          `
        };

      case EmailType.PASSWORD_RESET:
        return {
          subject: 'Reset Your Password - GradeStack',
          html: `
            <h1>Reset Your Password</h1>
            <p>You requested to reset your password.</p>
            <a href="${data.resetLink}" style="
              padding: 10px 20px;
              background-color: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 5px;
            ">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
          `
        };

      case EmailType.NOTIFICATION:
        return {
          subject: data.subject || 'Notification from GradeStack',
          html: `
            <h1>${data.title}</h1>
            <p>${data.message}</p>
            ${data.actionLink ? `
              <a href="${data.actionLink}" style="
                padding: 10px 20px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 5px;
              ">${data.actionText || 'Learn More'}</a>
            ` : ''}
          `
        };

      default:
        throw new Error('Invalid email type');
    }
  }

  static async sendVerificationLink(email: string, token: string) {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const template = this.getTemplate(EmailType.VERIFICATION, { verificationLink });
    await this.sendEmail(email, template.subject, template.html);
  }

  static async sendVerificationCode(email: string) {
    const code = generateRandomCode(6);
    const template = this.getTemplate(EmailType.VERIFICATION_CODE, { code });
    await this.sendEmail(email, template.subject, template.html);
    return code; // Return code to save in database
  }

  static async sendWelcomeEmail(email: string) {
    const template = this.getTemplate(EmailType.WELCOME, { email });
    await this.sendEmail(email, template.subject, template.html);
  }

  static async sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const template = this.getTemplate(EmailType.PASSWORD_RESET, { resetLink });
    await this.sendEmail(email, template.subject, template.html);
  }

  static async sendNotification(email: string, data: {
    subject?: string;
    title: string;
    message: string;
    actionLink?: string;
    actionText?: string;
  }) {
    const template = this.getTemplate(EmailType.NOTIFICATION, data);
    await this.sendEmail(email, template.subject, template.html);
  }
} 