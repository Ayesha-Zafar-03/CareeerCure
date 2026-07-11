import smtplib
import logging
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send an email via Gmail SMTP."""
    try:
        # Check if Gmail credentials are configured
        if not settings.GMAIL_USER or not settings.GMAIL_APP_PASSWORD:
            logger.warning("Gmail credentials not configured. Email not sent.")
            return False
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = settings.GMAIL_USER
        msg['To'] = to_email
        
        # Attach HTML content
        html_part = MIMEText(html_body, 'html')
        msg.attach(html_part)
        
        # Send via Gmail SMTP
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD.replace(' ', ''))
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


def send_verification_email(to_email: str, full_name: str, otp: str) -> bool:
    subject = "Verify your CareerCure account"
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background: #f9fafb; padding: 40px 0;">
      <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px;
                  padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="background: #2563eb; display: inline-block; padding: 12px 16px;
                      border-radius: 10px; margin-bottom: 16px;">
            <span style="color: white; font-size: 20px; font-weight: bold;">💼 CareerCure</span>
          </div>
          <h1 style="color: #111827; font-size: 22px; margin: 0;">Verify your email</h1>
        </div>

        <p style="color: #6b7280; font-size: 15px;">Hi <strong>{full_name}</strong>,</p>
        <p style="color: #6b7280; font-size: 15px;">
          Thanks for signing up! Use the verification code below to activate your account.
          This code expires in <strong>10 minutes</strong>.
        </p>

        <div style="background: #eff6ff; border: 2px dashed #2563eb; border-radius: 10px;
                    padding: 24px; text-align: center; margin: 28px 0;">
          <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">Your verification code</p>
          <p style="color: #1d4ed8; font-size: 40px; font-weight: bold; letter-spacing: 10px;
                    margin: 0; font-family: monospace;">{otp}</p>
        </div>

        <p style="color: #9ca3af; font-size: 13px; text-align: center;">
          If you didn't create a CareerCure account, you can safely ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;">
        <p style="color: #d1d5db; font-size: 12px; text-align: center; margin: 0;">
          CareerCure — AI-Powered Career Development Platform
        </p>
      </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, html)


def send_password_reset_email(to_email: str, full_name: str, otp: str) -> bool:
    subject = "Reset your CareerCure password"
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background: #f9fafb; padding: 40px 0;">
      <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px;
                  padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="background: #2563eb; display: inline-block; padding: 12px 16px;
                      border-radius: 10px; margin-bottom: 16px;">
            <span style="color: white; font-size: 20px; font-weight: bold;">💼 CareerCure</span>
          </div>
          <h1 style="color: #111827; font-size: 22px; margin: 0;">Password Reset</h1>
        </div>

        <p style="color: #6b7280; font-size: 15px;">Hi <strong>{full_name}</strong>,</p>
        <p style="color: #6b7280; font-size: 15px;">
          We received a request to reset your password. Use the code below.
          This code expires in <strong>10 minutes</strong>.
        </p>

        <div style="background: #fff7ed; border: 2px dashed #ea580c; border-radius: 10px;
                    padding: 24px; text-align: center; margin: 28px 0;">
          <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">Your reset code</p>
          <p style="color: #c2410c; font-size: 40px; font-weight: bold; letter-spacing: 10px;
                    margin: 0; font-family: monospace;">{otp}</p>
        </div>

        <p style="color: #9ca3af; font-size: 13px; text-align: center;">
          If you didn't request a password reset, you can safely ignore this email.
          Your password will not be changed.
        </p>

        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;">
        <p style="color: #d1d5db; font-size: 12px; text-align: center; margin: 0;">
          CareerCure — AI-Powered Career Development Platform
        </p>
      </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, html)
