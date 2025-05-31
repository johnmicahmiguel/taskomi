interface EmailParams {
  to: string;
  from: string;
  subject: string;
  htmlContent: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.BREVO_API_KEY) {
    console.error("BREVO_API_KEY environment variable is not set");
    return false;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "ConnectPro",
          email: params.from
        },
        to: [{
          email: params.to
        }],
        subject: params.subject,
        htmlContent: params.htmlContent
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo email error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPEmailTemplate(otp: string, firstName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Verify Your Account</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af; margin: 0; font-size: 28px;">ConnectPro</h1>
        </div>
        
        <h2 style="color: #1f2937; margin-bottom: 20px;">Verify Your Account</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          Hi ${firstName},
        </p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
          Thank you for signing up! To complete your account verification, please use the following 6-digit code:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background-color: #f3f4f6; padding: 20px 30px; border-radius: 8px; letter-spacing: 4px; font-size: 32px; font-weight: bold; color: #1e40af;">
            ${otp}
          </div>
        </div>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          This code will expire in 10 minutes for security reasons.
        </p>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-top: 30px;">
          If you didn't request this verification, please ignore this email.
        </p>
        
        <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © 2025 ConnectPro. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}