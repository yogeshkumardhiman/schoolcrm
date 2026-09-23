import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendFacultyCredentialsDto {
  to: string;
  name: string;
  loginId?: string;
  password: string;
  designation?: string;
  role?: string;
  schoolName?: string;
  loginUrl?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<number>('SMTP_PORT')) || 587;
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const rawSecure = this.configService.get('SMTP_SECURE');
    const secure = typeof rawSecure === 'boolean' ? rawSecure : String(rawSecure).toLowerCase() === 'true';

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
        });
        this.logger.log(`📧 SMTP Transporter initialized successfully for ${host}:${port} (secure: ${secure})`);
      } catch (err) {
        this.logger.error('Failed to initialize SMTP transporter:', err);
      }
    } else {
      this.logger.warn(
        '⚠️ SMTP credentials not fully configured in environment (SMTP_HOST, SMTP_USER, SMTP_PASS). MailService will log emails to console.',
      );
    }
  }

  /**
   * Dispatch faculty welcome credentials upon account provisioning
   */
  async sendFacultyCredentials(data: SendFacultyCredentialsDto): Promise<boolean> {
    const schoolName = data.schoolName || 'School Management Portal';
    const loginUrl =
      data.loginUrl ||
      this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000/login');
    const smtpUser = this.configService.get<string>('SMTP_USER', 'no-reply@school.com');
    const fromAddress =
      this.configService.get<string>('SMTP_FROM') ||
      `"${schoolName} Portal" <${smtpUser}>`;

    const subject = `Welcome to ${schoolName} - Your Portal Login Credentials`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
          .header { background: #0f172a; padding: 32px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
          .header p { margin: 6px 0 0 0; font-size: 11px; color: #818cf8; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; }
          .content { padding: 32px; }
          .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
          .info-text { font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
          .credential-box { background: #f1f5f9; border-radius: 12px; padding: 20px; border: 1px solid #cbd5e1; margin-bottom: 24px; }
          .cred-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .cred-row:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
          .cred-label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
          .cred-value { font-family: monospace; font-size: 14px; font-weight: 700; color: #0f172a; word-break: break-all; }
          .btn-container { text-align: center; margin: 32px 0 16px 0; }
          .btn { background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
          .footer { background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${schoolName}</h1>
            <p>Faculty & Staff Governance Portal</p>
          </div>
          <div class="content">
            <div class="greeting">Dear ${data.name},</div>
            <p class="info-text">
              Your official faculty account has been registered on the <strong>${schoolName}</strong> administrative platform. You can now log in to view your classes, manage attendance, submit timetable records, and access institutional resources.
            </p>

            <div class="credential-box">
              ${data.loginId ? `
              <div class="cred-row">
                <span class="cred-label">System Login ID:</span>
                <span class="cred-value" style="color: #4f46e5; font-size: 15px; font-weight: 800;">${data.loginId}</span>
              </div>` : ''}
              <div class="cred-row">
                <span class="cred-label">Registered Email:</span>
                <span class="cred-value">${data.to}</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Temporary Password:</span>
                <span class="cred-value">${data.password}</span>
              </div>
              ${data.role ? `
              <div class="cred-row">
                <span class="cred-label">Assigned Role:</span>
                <span class="cred-value">${data.role}</span>
              </div>` : ''}
            </div>

            <div class="btn-container">
              <a href="${loginUrl}" class="btn" target="_blank">Access Portal Terminal &rarr;</a>
            </div>

            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 16px;">
              For security, please change your password after logging in for the first time.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ${schoolName}. All rights reserved.<br>
            This is an automated system dispatch. Please do not reply directly to this email.
          </div>
        </div>
      </body>
      </html>
    `;

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: fromAddress,
          to: data.to,
          subject,
          html: htmlContent,
        });
        const previewUrl = nodemailer.getTestMessageUrl(info);
        this.logger.log(`✅ Welcome credentials email sent successfully to: ${data.to}`);
        if (previewUrl) {
          this.logger.log(`🔗 [Ethereal Preview URL]: ${previewUrl}`);
        }
        return true;
      } catch (err) {
        this.logger.error(`❌ Failed to send credentials email to ${data.to}:`, err);
        return false;
      }
    } else {
      // Local development simulation
      this.logger.log(
        `📬 [SIMULATED EMAIL DISPATCH]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To:       ${data.to}
Subject:  ${subject}
Name:     ${data.name}
Role:     ${data.role || 'TEACHER'}
Username: ${data.to}
Password: ${data.password}
Login URL:${loginUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      );
      return true;
    }
  }
}
