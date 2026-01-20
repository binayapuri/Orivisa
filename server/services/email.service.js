// File: server/services/email.service.js

const nodemailer = require('nodemailer');
const aws = require('@aws-sdk/client-ses');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      SES: new aws.SESClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      })
    });
  }

  async sendVerificationEmail(email, verificationUrl) {
    const mailOptions = {
      from: process.env.AWS_SES_EMAIL,
      to: email,
      subject: 'Verify Your Email - Nexus Platform',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #007bff; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to Nexus Platform!</h2>
            <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p>${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Nexus Platform - Connecting Students, Agents, and Colleges<br>
              Australia
            </p>
          </div>
        </body>
        </html>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email, resetUrl) {
    const mailOptions = {
      from: process.env.AWS_SES_EMAIL,
      to: email,
      subject: 'Password Reset Request - Nexus Platform',
      html: `
        <!DOCTYPE html>
        <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
            </p>
            <p>Or copy and paste this link:</p>
            <p>${resetUrl}</p>
            <p>This link will expire in 30 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </body>
        </html>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendForm956SignedNotification(agent, student, form956) {
    // Notify agent when student signs Form 956
  }

  async sendApplicationStatusUpdate(student, application, newStatus) {
    // Notify student of application status changes
  }

  async sendCommissionNotification(agent, commission) {
    // Notify agent of new commission earned
  }
}

module.exports = new EmailService();
