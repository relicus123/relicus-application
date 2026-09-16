export interface MegaTestEmailPayload {
  recipients: string[];
  testName: string;
  examName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  isProctored?: boolean;
}

export interface EmailDispatchResult {
  success: boolean;
  message?: string;
  error?: string;
  recipientCount?: number;
}

export function generateMegaTestEmailHtml(payload: MegaTestEmailPayload): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scheduled Mega Test Announcement</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header with Relicus brand color -->
          <tr>
            <td style="background: linear-gradient(135deg, #1C4966 0%, #102d40 100%); padding: 32px 28px; text-align: left;">
              <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">
                ⚡ Official Exam Announcement
              </span>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 6px 0; line-height: 1.25;">
                Scheduled Mega Test
              </h1>
              <p style="color: #93c5fd; font-size: 14px; margin: 0; font-weight: 500;">
                Course: ${payload.examName}
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
                Dear Student,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Your scheduled Mega Test <strong>"${payload.testName}"</strong> for <strong>${payload.examName}</strong> is ready. Please review the official schedule details below:
              </p>

              <!-- Exam Info Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600;" width="35%">📅 Exam Date:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${payload.date}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">⏰ Time Window:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${payload.startTime} – ${payload.endTime}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">⏱️ Duration:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${payload.duration}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">🛡️ Proctoring:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #059669; font-weight: 700;">Active Anti-Cheat Proctoring</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Warning Box: Strict 1 Attempt -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #991b1b; font-weight: 600;">
                      ⚠️ CRITICAL EXAM RULES:
                    </p>
                    <ul style="margin: 8px 0 0 0; padding-left: 18px; font-size: 12px; line-height: 1.6; color: #b91c1c;">
                      <li>This is a Mega Test and can strictly be attempted <strong>ONCE ONLY</strong>.</li>
                      <li>Leaving or switching tabs/apps during the test will trigger proctoring strikes.</li>
                      <li>Please ensure a stable internet connection before tapping "Start Test".</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Please log into the <strong>Relicus Mobile App</strong> and navigate to <em>Entrance Coaching &rarr; ${payload.examName} &rarr; Tests</em> to access your test at the scheduled time.
              </p>

              <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0;">
                Best wishes for your preparation,<br>
                <strong style="color: #1C4966;">Relicus Entrance Coaching Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Relicus Learning Platform • Official Notification Service<br>
                This automated email was dispatched to enrolled students of ${payload.examName}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function sendAutomatedMegaTestEmail(payload: MegaTestEmailPayload): Promise<EmailDispatchResult> {
  const validRecipients = (payload.recipients || [])
    .map(r => r.trim())
    .filter(r => r && r.includes('@'));

  if (validRecipients.length === 0) {
    return {
      success: false,
      error: 'No enrolled student email addresses found to send to.'
    };
  }

  const subject = `[Relicus] Scheduled Mega Test: ${payload.testName} (${payload.examName})`;
  const htmlContent = generateMegaTestEmailHtml(payload);
  const textContent = `
Dear Student,

Your scheduled Mega Test "${payload.testName}" for ${payload.examName} is coming up!

📅 Date: ${payload.date}
⏰ Time Window: ${payload.startTime} – ${payload.endTime}
⏱️ Duration: ${payload.duration}
🛡️ Mode: Proctored Exam (Strict Anti-Cheat Monitoring)

IMPORTANT RULES:
- This is a Mega Test and can ONLY be attempted ONCE.
- Leaving the exam screen or switching apps will trigger proctoring strikes.
- Ensure a stable internet connection.

Open the Relicus App to attend during the scheduled window.

Good luck with your preparation!
Relicus Entrance Coaching Team
  `.trim();

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipients: validRecipients,
        subject,
        html: htmlContent,
        text: textContent
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return {
      success: true,
      recipientCount: validRecipients.length,
      message: `Automated email successfully sent to ${validRecipients.length} enrolled student(s)!`
    };
  } catch (err: any) {
    console.error('Error in sendAutomatedMegaTestEmail:', err);
    return {
      success: false,
      error: err.message || 'Failed to dispatch email automatically'
    };
  }
}
