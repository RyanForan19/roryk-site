const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_SECURE,
      SMTP_USER,
      SMTP_PASS,
      EMAIL_FROM,
      NODE_ENV
    } = process.env;

    // Check if SMTP is configured
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      this.transporter = nodemailer.createTransporter({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT) || 587,
        secure: SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: NODE_ENV === 'production'
        }
      });
      this.isConfigured = true;
      console.log('✅ Email service configured with SMTP');
    } else {
      console.log('⚠️  Email service not configured - SMTP credentials missing');
      console.log('   Add SMTP_HOST, SMTP_USER, SMTP_PASS to environment variables');
      this.isConfigured = false;
    }

    this.fromEmail = EMAIL_FROM || SMTP_USER || 'noreply@roryk.com';
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    if (!this.isConfigured) {
      console.log('📧 Email would be sent (SMTP not configured):');
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Content: ${textContent || htmlContent}`);
      return { success: false, error: 'SMTP not configured' };
    }

    try {
      const mailOptions = {
        from: `"RoryK Vehicle Checks" <${this.fromEmail}>`,
        to,
        subject,
        html: htmlContent,
        text: textContent || this.stripHtml(htmlContent)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(email, resetToken, userName = '') {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const subject = 'Reset Your RoryK Password';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 RoryK Vehicle Checks</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello${userName ? ` ${userName}` : ''},</p>
            <p>We received a request to reset your password for your RoryK account. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 3px;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Important Security Information:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
                <li>We will never ask for your password via email</li>
              </ul>
            </div>
            
            <p>If you're having trouble with the button above, you can also reset your password by logging into your account and using the "Forgot Password" option.</p>
          </div>
          <div class="footer">
            <p>This email was sent from RoryK Vehicle Checking Service</p>
            <p>If you have any questions, please contact our support team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
RoryK Vehicle Checks - Password Reset

Hello${userName ? ` ${userName}` : ''},

We received a request to reset your password for your RoryK account.

To reset your password, visit this link:
${resetUrl}

IMPORTANT:
- This link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- Never share this link with anyone

If you're having trouble, you can also reset your password by logging into your account and using the "Forgot Password" option.

---
RoryK Vehicle Checking Service
    `;

    return await this.sendEmail(email, subject, htmlContent, textContent);
  }

  async sendPasswordChangeConfirmation(email, userName = '') {
    const subject = 'Password Changed Successfully';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .alert { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 RoryK Vehicle Checks</h1>
          </div>
          <div class="content">
            <h2>✅ Password Changed Successfully</h2>
            <p>Hello${userName ? ` ${userName}` : ''},</p>
            <p>Your password has been successfully changed for your RoryK account.</p>
            
            <div class="alert">
              <strong>🔒 Security Notice:</strong>
              <p>If you didn't make this change, please contact our support team immediately and consider the following:</p>
              <ul>
                <li>Change your password again immediately</li>
                <li>Review your account activity</li>
                <li>Enable two-factor authentication if available</li>
              </ul>
            </div>
            
            <p>For your security, we recommend:</p>
            <ul>
              <li>Using a strong, unique password</li>
              <li>Not sharing your login credentials</li>
              <li>Logging out from shared devices</li>
            </ul>
          </div>
          <div class="footer">
            <p>This email was sent from RoryK Vehicle Checking Service</p>
            <p>Time: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
RoryK Vehicle Checks - Password Changed

Hello${userName ? ` ${userName}` : ''},

Your password has been successfully changed for your RoryK account.

SECURITY NOTICE:
If you didn't make this change, please contact our support team immediately.

For your security, we recommend:
- Using a strong, unique password
- Not sharing your login credentials  
- Logging out from shared devices

Time: ${new Date().toLocaleString()}

---
RoryK Vehicle Checking Service
    `;

    return await this.sendEmail(email, subject, htmlContent, textContent);
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  async testConnection() {
    if (!this.isConfigured) {
      return { success: false, error: 'SMTP not configured' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'SMTP connection successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();