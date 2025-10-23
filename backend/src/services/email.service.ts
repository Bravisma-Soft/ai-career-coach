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

Best Regards,
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
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 30px -10px rgba(10, 14, 39, 0.1); overflow: hidden; max-width: 100%;">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🚀 AI Career Coach
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #0a0e27; font-size: 22px; font-weight: 600;">Reset Your Password</h2>

              <p style="margin: 0 0 16px 0; color: #0a0e27; font-size: 16px; line-height: 1.6;">Hi ${userName},</p>

              <p style="margin: 0 0 16px 0; color: #0a0e27; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your AI Career Coach account.
              </p>

              <p style="margin: 0 0 24px 0; color: #0a0e27; font-size: 16px; line-height: 1.6;">
                Click the button below to reset your password:
              </p>

              <!-- CTA Button with gradient -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #1e40af 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Warning box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px;">
                    <p style="margin: 0; color: #78350f; font-size: 14px; font-weight: 600;">
                      ⏰ This link will expire in 1 hour for security.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb; background: #f9fafb;">
              <p style="margin: 0 0 16px 0; color: #0a0e27; font-size: 14px; font-weight: 500;">
                Best Regards,<br>The AI Career Coach Team
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #7c3aed; word-break: break-all; text-decoration: underline;">${resetUrl}</a>
              </p>
            </td>
          </tr>
        </table>

        <!-- Email footer -->
        <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 24px; max-width: 100%;">
          <tr>
            <td style="text-align: center; padding: 0 20px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                AI Career Coach - Your AI-powered job search assistant
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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

Best Regards,
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
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 30px -10px rgba(10, 14, 39, 0.1); overflow: hidden; max-width: 100%;">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🚀 Welcome to AI Career Coach!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 16px 0; color: #0a0e27; font-size: 16px; line-height: 1.6;">Hi ${userName},</p>

              <p style="margin: 0 0 24px 0; color: #0a0e27; font-size: 16px; line-height: 1.6;">
                We're excited to have you on board! AI Career Coach is here to help you land your dream job with the power of AI.
              </p>

              <h3 style="margin: 24px 0 16px 0; color: #0a0e27; font-size: 18px; font-weight: 600;">Here's what you can do:</h3>

              <!-- Features list -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; color: #0a0e27; font-size: 15px; line-height: 1.5;">
                      <span style="display: inline-block; width: 24px;">✅</span> Upload and manage your resumes
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; color: #0a0e27; font-size: 15px; line-height: 1.5;">
                      <span style="display: inline-block; width: 24px;">📊</span> Track job applications with our Kanban board
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; color: #0a0e27; font-size: 15px; line-height: 1.5;">
                      <span style="display: inline-block; width: 24px;">🎯</span> Get AI-powered resume tailoring for specific jobs
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; color: #0a0e27; font-size: 15px; line-height: 1.5;">
                      <span style="display: inline-block; width: 24px;">✍️</span> Generate personalized cover letters
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; color: #0a0e27; font-size: 15px; line-height: 1.5;">
                      <span style="display: inline-block; width: 24px;">🎤</span> Practice with mock interviews
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button with gradient -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${env.FRONTEND_URL}/login" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #1e40af 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                      Get Started
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                Ready to accelerate your job search? Start by uploading your first resume!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb; background: #f9fafb;">
              <p style="margin: 0; color: #0a0e27; font-size: 14px; font-weight: 500;">
                Best Regards,<br>The AI Career Coach Team
              </p>
            </td>
          </tr>
        </table>

        <!-- Email footer -->
        <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 24px; max-width: 100%;">
          <tr>
            <td style="text-align: center; padding: 0 20px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                AI Career Coach - Your AI-powered job search assistant
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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

Best Regards,
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
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 30px -10px rgba(10, 14, 39, 0.1); overflow: hidden; max-width: 100%;">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🚀 AI Career Coach
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <!-- Success banner -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; border-radius: 6px;">
                    <p style="margin: 0; color: #065f46; font-size: 16px; font-weight: 600;">
                      ✅ Resume Processed Successfully!
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; color: #0a0e27; font-size: 16px; line-height: 1.6;">
                Great news! Your resume <strong>"${resumeName}"</strong> has been successfully processed and analyzed.
              </p>

              <p style="margin: 0 0 24px 0; color: #0a0e27; font-size: 16px; line-height: 1.6;">
                We've extracted all the key information from your resume, including your work experience, education, skills, and more.
              </p>

              <h3 style="margin: 24px 0 16px 0; color: #0a0e27; font-size: 18px; font-weight: 600;">What's next?</h3>

              <!-- Next steps list -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; color: #0a0e27; font-size: 15px; line-height: 1.5;">
                      <span style="display: inline-block; width: 24px;">📄</span> View your parsed resume data
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; color: #0a0e27; font-size: 15px; line-height: 1.5;">
                      <span style="display: inline-block; width: 24px;">🎯</span> Tailor your resume for specific job postings
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; color: #0a0e27; font-size: 15px; line-height: 1.5;">
                      <span style="display: inline-block; width: 24px;">✍️</span> Generate customized cover letters
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; color: #0a0e27; font-size: 15px; line-height: 1.5;">
                      <span style="display: inline-block; width: 24px;">📊</span> Track your job applications
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button with gradient -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${env.FRONTEND_URL}/resumes" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #1e40af 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                      View Your Resume
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                Your resume is ready to help you land your dream job!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb; background: #f9fafb;">
              <p style="margin: 0; color: #0a0e27; font-size: 14px; font-weight: 500;">
                Best Regards,<br>The AI Career Coach Team
              </p>
            </td>
          </tr>
        </table>

        <!-- Email footer -->
        <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 24px; max-width: 100%;">
          <tr>
            <td style="text-align: center; padding: 0 20px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                AI Career Coach - Your AI-powered job search assistant
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}

// Export singleton instance
export const emailService = new EmailService();
