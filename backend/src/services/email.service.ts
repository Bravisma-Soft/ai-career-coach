import sgMail from '@sendgrid/mail';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

/**
 * Email Service using SendGrid
 *
 * Provides methods for sending various types of emails:
 * - Password reset emails
 * - Welcome emails
 * - Notification emails
 *
 * @example
 * await emailService.sendPasswordResetEmail('user@example.com', 'reset-token-123');
 */
export class EmailService {
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize SendGrid with API key
   */
  private initialize(): void {
    if (env.SENDGRID_API_KEY) {
      sgMail.setApiKey(env.SENDGRID_API_KEY);
      this.isConfigured = true;
      logger.info('SendGrid email service initialized');
    } else {
      logger.warn('SendGrid API key not configured - emails will not be sent');
    }
  }

  /**
   * Check if email service is properly configured
   */
  isReady(): boolean {
    return this.isConfigured && !!env.SENDGRID_FROM_EMAIL;
  }

  /**
   * Send password reset email
   *
   * @param email - User's email address
   * @param resetToken - Password reset token (unhashed)
   * @param userName - User's name for personalization
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName?: string
  ): Promise<void> {
    if (!this.isReady()) {
      logger.warn(`Email service not configured - would send password reset to ${email}`);

      // In development, log the reset URL
      if (env.NODE_ENV === 'development') {
        const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        logger.info(`Password reset URL (development only): ${resetUrl}`);
      }
      return;
    }

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const displayName = userName || 'there';

    const msg = {
      to: email,
      from: {
        email: env.SENDGRID_FROM_EMAIL!,
        name: env.SENDGRID_FROM_NAME,
      },
      subject: 'Reset Your Password - AI Career Coach',
      text: this.getPasswordResetTextContent(displayName, resetUrl),
      html: this.getPasswordResetHtmlContent(displayName, resetUrl),
    };

    try {
      await sgMail.send(msg);
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}:`, error);
      // Don't throw error - we don't want to fail the request if email fails
      // The token is still valid, user just won't get the email
    }
  }

  /**
   * Send welcome email to new users
   *
   * @param email - User's email address
   * @param userName - User's first name
   */
  async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    if (!this.isReady()) {
      logger.warn(`Email service not configured - would send welcome email to ${email}`);
      return;
    }

    const msg = {
      to: email,
      from: {
        email: env.SENDGRID_FROM_EMAIL!,
        name: env.SENDGRID_FROM_NAME,
      },
      subject: 'Welcome to AI Career Coach!',
      text: this.getWelcomeTextContent(userName),
      html: this.getWelcomeHtmlContent(userName),
    };

    try {
      await sgMail.send(msg);
      logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send welcome email to ${email}:`, error);
    }
  }

  /**
   * Send resume parsing completion notification
   *
   * @param email - User's email address
   * @param resumeName - Name of the parsed resume
   */
  async sendResumeParseCompleteEmail(
    email: string,
    resumeName: string
  ): Promise<void> {
    if (!this.isReady()) {
      logger.warn(`Email service not configured - would send resume notification to ${email}`);
      return;
    }

    const msg = {
      to: email,
      from: {
        email: env.SENDGRID_FROM_EMAIL!,
        name: env.SENDGRID_FROM_NAME,
      },
      subject: 'Your Resume Has Been Processed',
      text: this.getResumeParseTextContent(resumeName),
      html: this.getResumeParseHtmlContent(resumeName),
    };

    try {
      await sgMail.send(msg);
      logger.info(`Resume parse notification sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send resume notification to ${email}:`, error);
    }
  }

  // =================================
  // EMAIL TEMPLATE METHODS
  // =================================

  /**
   * Password reset email - Plain text version
   */
  private getPasswordResetTextContent(userName: string, resetUrl: string): string {
    return `
Hi ${userName},

We received a request to reset your password for your AI Career Coach account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
The AI Career Coach Team
    `.trim();
  }

  /**
   * Password reset email - HTML version
   */
  private getPasswordResetHtmlContent(userName: string, resetUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #7c3aed;
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      background: #7c3aed;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      background: #6d28d9;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
    .warning {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 AI Career Coach</h1>
    </div>

    <div class="content">
      <h2>Reset Your Password</h2>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your password for your AI Career Coach account.</p>
      <p>Click the button below to reset your password:</p>

      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>

      <div class="warning">
        <strong>⏰ This link will expire in 1 hour.</strong>
      </div>

      <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>

    <div class="footer">
      <p>Best regards,<br>The AI Career Coach Team</p>
      <p style="font-size: 12px; color: #9ca3af;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${resetUrl}" style="color: #7c3aed; word-break: break-all;">${resetUrl}</a>
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Welcome email - Plain text version
   */
  private getWelcomeTextContent(userName: string): string {
    return `
Hi ${userName},

Welcome to AI Career Coach! We're excited to have you on board.

Here's what you can do with AI Career Coach:
- Upload and manage your resumes
- Track job applications with our Kanban board
- Get AI-powered resume tailoring for specific jobs
- Generate personalized cover letters
- Practice with mock interviews

Get started by uploading your resume and adding your first job application!

Best regards,
The AI Career Coach Team
    `.trim();
  }

  /**
   * Welcome email - HTML version
   */
  private getWelcomeHtmlContent(userName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AI Career Coach</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #7c3aed;
      margin: 0;
      font-size: 28px;
    }
    .feature {
      margin: 15px 0;
      padding-left: 25px;
    }
    .button {
      display: inline-block;
      background: #7c3aed;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Welcome to AI Career Coach!</h1>
    </div>

    <div class="content">
      <p>Hi ${userName},</p>
      <p>We're excited to have you on board! AI Career Coach is here to help you land your dream job.</p>

      <h3>Here's what you can do:</h3>
      <div class="feature">✅ Upload and manage your resumes</div>
      <div class="feature">📊 Track job applications with our Kanban board</div>
      <div class="feature">🎯 Get AI-powered resume tailoring for specific jobs</div>
      <div class="feature">✍️ Generate personalized cover letters</div>
      <div class="feature">🎤 Practice with mock interviews</div>

      <div style="text-align: center;">
        <a href="${env.FRONTEND_URL}" class="button">Get Started</a>
      </div>
    </div>

    <div class="footer">
      <p>Best regards,<br>The AI Career Coach Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Resume parse complete - Plain text version
   */
  private getResumeParseTextContent(resumeName: string): string {
    return `
Your resume "${resumeName}" has been successfully processed!

We've extracted all the key information from your resume, including your work experience, education, and skills.

You can now:
- View your parsed resume data
- Use it to tailor resumes for specific jobs
- Generate customized cover letters

Log in to your account to get started!

Best regards,
The AI Career Coach Team
    `.trim();
  }

  /**
   * Resume parse complete - HTML version
   */
  private getResumeParseHtmlContent(resumeName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume Processed Successfully</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .success {
      background: #d1fae5;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .button {
      display: inline-block;
      background: #7c3aed;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success">
      <strong>✅ Resume Processed Successfully!</strong>
    </div>

    <p>Your resume <strong>"${resumeName}"</strong> has been successfully processed!</p>

    <p>We've extracted all the key information from your resume, including your work experience, education, and skills.</p>

    <h3>What's next?</h3>
    <ul>
      <li>View your parsed resume data</li>
      <li>Use it to tailor resumes for specific jobs</li>
      <li>Generate customized cover letters</li>
    </ul>

    <div style="text-align: center;">
      <a href="${env.FRONTEND_URL}/resumes" class="button">View Your Resume</a>
    </div>

    <div class="footer">
      <p>Best regards,<br>The AI Career Coach Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

// Export singleton instance
export const emailService = new EmailService();
