// ============================================
// FILE: server/src/services/email.service.js
// ============================================
const transporter = require('../config/email');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.from = process.env.EMAIL_FROM || 'noreply@chatapp.com';
  }

  async sendOTP(email, otp) {
    try {
      const mailOptions = {
        from: this.from,
        to: email,
        subject: 'Your OTP Code - Chat Platform',
        html: this.getOTPEmailTemplate(otp),
        text: `Your OTP code is: ${otp}. This code will expire in 5 minutes.`,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`OTP email sent to ${email}: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Failed to send OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  getOTPEmailTemplate(otp) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; border: 2px dashed #667eea; border-radius: 10px; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verification Code</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You requested to sign in to your account. Please use the following One-Time Password (OTP):</p>
              <div class="otp-box">${otp}</div>
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This code will expire in <strong>5 minutes</strong></li>
                  <li>Never share this code with anyone</li>
                  <li>If you didn't request this code, please ignore this email</li>
                </ul>
              </div>
              <p>For security reasons, this code can only be used once.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Chat Platform. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async sendWelcomeEmail(email, displayName) {
    try {
      const mailOptions = {
        from: this.from,
        to: email,
        subject: 'Welcome to Chat Platform!',
        html: this.getWelcomeEmailTemplate(displayName),
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${email}: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      return false;
    }
  }

  getWelcomeEmailTemplate(displayName) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Chat Platform!</h1>
            </div>
            <div class="content">
              <p>Hi ${displayName},</p>
              <p>Thank you for joining Chat Platform! We're excited to have you on board.</p>
              <p>Here's what you can do:</p>
              <ul>
                <li>✨ Connect with friends and family</li>
                <li>📱 Share photos, videos, and files</li>
                <li>🎥 Make voice and video calls</li>
                <li>📖 Post statuses and stories</li>
              </ul>
              <p>Get started by adding your first contact!</p>
              <p style="text-align: center;">
                <a href="${process.env.CLIENT_URL}" class="button">Open Chat Platform</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    try {
      const mailOptions = {
        from: this.from,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <p>You requested a password reset.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();