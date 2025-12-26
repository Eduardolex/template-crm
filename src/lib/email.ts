import { Resend } from 'resend';

// Initialize Resend client (singleton pattern)
const resend = new Resend(process.env.RESEND_API_KEY);

// Default from email (can be overridden with EMAIL_FROM env variable)
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';

/**
 * Build HTML email from plain text message
 * Preserves line breaks and adds basic styling
 */
function buildHtmlEmail(message: string, subject: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
  <div style="white-space: pre-wrap; color: #333;">${message}</div>
  <hr style="margin-top: 30px; border: none; border-top: 1px solid #e0e0e0;">
  <p style="color: #666; font-size: 12px; margin-top: 20px;">
    This is an automated message from your CRM system.
  </p>
</body>
</html>`;
}

/**
 * Generic email sending function
 */
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; data?: any; error?: any }> {
  // Check if API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY not configured. Email not sent.');
    return { success: false, error: 'API key not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return { success: false, error };
    }

    console.log('✅ Email sent successfully:', { to, subject, id: data?.id });
    return { success: true, data };
  } catch (error) {
    console.error('❌ Email send failed:', error);
    return { success: false, error };
  }
}

/**
 * Send task automation email
 */
export async function sendTaskAutomationEmail({
  to,
  templateName,
  message,
}: {
  to: string;
  templateName: string;
  message: string;
}): Promise<{ success: boolean; data?: any; error?: any }> {
  const subject = `Task Completed: ${templateName}`;
  const html = buildHtmlEmail(message, subject);

  return sendEmail({ to, subject, html });
}

/**
 * Send deal automation email
 */
export async function sendDealAutomationEmail({
  to,
  templateName,
  message,
  dealTitle,
}: {
  to: string;
  templateName: string;
  message: string;
  dealTitle: string;
}): Promise<{ success: boolean; data?: any; error?: any }> {
  const subject = `Deal Update: ${dealTitle}`;
  const html = buildHtmlEmail(message, subject);

  return sendEmail({ to, subject, html });
}
