import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

export class EmailService {
  private static getResendClient(): Resend | null {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      return null;
    }
    return new Resend(apiKey);
  }

  /**
   * Send a 6-digit OTP email to user
   */
  public static async sendOTPEmail(email: string, otpCode: string, purpose = 'login'): Promise<{ success: boolean; messageId?: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const resend = this.getResendClient();

    const fromAddress = process.env.RESEND_FROM_EMAIL?.trim() || 'ReadyForms <onboarding@resend.dev>';
    const subject = `Your ReadyForms Verification Code: ${otpCode}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ReadyForms Verification Code</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5; padding:40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width:500px; width:100%; background-color:#ffffff; border-radius:16px; border:1px solid #e4e4e7; box-shadow:0 10px 25px -5px rgba(0, 0, 0, 0.05); overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px 32px; text-align:center; border-bottom:1px solid #f4f4f5;">
              <div style="display:inline-block; width:48px; height:48px; background-color:#09090b; border-radius:12px; line-height:48px; text-align:center; color:#ffffff; font-size:20px; font-weight:bold; margin-bottom:12px;">
                ✓
              </div>
              <h1 style="margin:0; font-size:24px; font-weight:800; color:#09090b; letter-spacing:-0.5px;">ReadyForms</h1>
              <p style="margin:6px 0 0 0; font-size:14px; color:#71717a;">Authentication & Verification Code</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 20px 0; font-size:15px; color:#3f3f46; line-height:1.5;">
                Hello,
              </p>
              <p style="margin:0 0 24px 0; font-size:15px; color:#3f3f46; line-height:1.5;">
                Use the following 6-digit verification code to complete your ${purpose === 'login' ? 'sign-in' : purpose} request for <strong>${normalizedEmail}</strong>:
              </p>

              <!-- OTP Code Display Box -->
              <div style="background-color:#fafafa; border:1px solid #e4e4e7; border-radius:12px; padding:24px; text-align:center; margin-bottom:24px;">
                <div style="font-family:'SF Mono', Monaco, Consolas, 'Courier New', monospace; font-size:36px; font-weight:800; letter-spacing:8px; color:#09090b; margin:0;">
                  ${otpCode}
                </div>
                <div style="font-size:12px; color:#a1a1aa; margin-top:8px; font-weight:500;">
                  Valid for 10 minutes
                </div>
              </div>

              <p style="margin:0 0 12px 0; font-size:13px; color:#71717a; line-height:1.5;">
                If you did not request this verification code, please ignore this email or contact support if you have security concerns.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px; background-color:#fafafa; border-top:1px solid #f4f4f5; text-align:center; font-size:12px; color:#a1a1aa;">
              &copy; ${new Date().getFullYear()} ReadyForms Platform. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    if (!resend) {
      console.log(`[EMAIL SERVICE] RESEND_API_KEY not configured. Console fallback OTP for ${normalizedEmail}: ${otpCode}`);
      return { success: true };
    }

    try {
      const response = await resend.emails.send({
        from: fromAddress,
        to: [normalizedEmail],
        subject,
        html: htmlContent,
      });

      console.log(`[EMAIL SERVICE] OTP email successfully sent to ${normalizedEmail} via Resend. Message ID: ${response.data?.id}`);
      return { success: true, messageId: response.data?.id };
    } catch (error: any) {
      console.error(`[EMAIL SERVICE] Failed to send OTP email to ${normalizedEmail} via Resend:`, error?.message || error);
      return { success: false };
    }
  }
}
