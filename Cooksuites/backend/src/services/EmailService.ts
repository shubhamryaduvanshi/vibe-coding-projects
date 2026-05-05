import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly brandColor = '#10b981'; // Emerald 500
  private readonly brandName = 'Cooksuites';

  private async getTransporter() {
    if (this.transporter) return this.transporter;

    if (!process.env.SMTP_USER) {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  private getBaseTemplate(title: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: ${this.brandColor}; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
          .content { font-size: 16px; color: #4b5563; }
          .footer { margin-top: 40px; text-align: center; font-size: 14px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 20px; }
          .btn { display: inline-block; padding: 12px 24px; background-color: ${this.brandColor}; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div style="padding: 40px 20px;">
          <div class="container">
            <div class="header">
              <h1>${this.brandName}</h1>
            </div>
            <div class="content">
              <h2 style="color: #111827; margin-top: 0;">${title}</h2>
              ${content}
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${this.brandName}. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      const transporter = await this.getTransporter();
      const info = await transporter.sendMail({
        from: `"${this.brandName} Support" <support@cooksuites.com>`,
        to,
        subject,
        html,
      });

      console.log('Email sent [%s]: %s', subject, info.messageId);

      if (!process.env.SMTP_USER) {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
      return true;
    } catch (error) {
      console.error('EmailService Error:', error);
      // We don't throw here to prevent blocking the main API response
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const content = `
      <p>We received a request to reset your password for your ${this.brandName} account.</p>
      <p>Click the button below to set up a new password. This link will expire in 15 minutes.</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </div>
      <p style="margin-top: 30px; font-size: 14px;">If you did not request a password reset, please ignore this email.</p>
    `;

    return this.sendEmail(
      email,
      'Password Reset Request',
      this.getBaseTemplate('Reset your password', content)
    );
  }

  async sendWelcomeEmail(email: string) {
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
    const content = `
      <p>Welcome to <strong>${this.brandName}</strong>! We're thrilled to have you join our community.</p>
      <p>Your culinary journey starts here. Explore professional-grade recipes, organize your meal plans, and build your ultimate cookbook collection.</p>
      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="btn">Go to Dashboard</a>
      </div>
    `;

    return this.sendEmail(
      email,
      `Welcome to ${this.brandName}!`,
      this.getBaseTemplate('Welcome Aboard', content)
    );
  }

  async sendLoginAlert(email: string, ip: string, userAgent: string) {
    const time = new Date().toLocaleString();
    const content = `
      <p>We noticed a new login to your ${this.brandName} account.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <ul style="list-style-type: none; padding: 0; margin: 0; font-size: 14px;">
          <li style="margin-bottom: 8px;"><strong>Time:</strong> ${time}</li>
          <li style="margin-bottom: 8px;"><strong>IP Address:</strong> ${ip}</li>
          <li><strong>Device/Browser:</strong> ${userAgent}</li>
        </ul>
      </div>
      <p style="font-size: 14px; color: #6b7280;">If this was you, you can safely ignore this email. If you don't recognize this activity, please reset your password immediately.</p>
    `;

    return this.sendEmail(
      email,
      'New Login Alert',
      this.getBaseTemplate('Security Alert: New Login', content)
    );
  }

  async sendRecipeCreatedEmail(email: string, recipeTitle: string, recipeId: string) {
    const recipeUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/recipes/${recipeId}`;
    const content = `
      <p>Congratulations! Your recipe <strong>"${recipeTitle}"</strong> has been successfully published to your cookbook.</p>
      <p>It's now safely stored and ready for your next culinary adventure.</p>
      <div style="text-align: center;">
        <a href="${recipeUrl}" class="btn">View Your Recipe</a>
      </div>
    `;

    return this.sendEmail(
      email,
      'Recipe Successfully Created',
      this.getBaseTemplate('Recipe Published', content)
    );
  }
}

export const emailService = new EmailService();
