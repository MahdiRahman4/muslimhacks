import type { Env } from "../env";

export const DEFAULT_FROM = "sponsors@muslimhacksoutreach.ca";
export const DEFAULT_FROM_NAME = "MuslimHacks";
export const DEFAULT_REPLY_TO = "info@muslimhacks.ca";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function firstName(fullName: string): string {
  return fullName.split(" ")[0] || "there";
}

/** Left-aligned wrapper so Gmail doesn't center short emails. */
export function wrapEmailHtml(inner: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#ffffff;text-align:left;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="left" style="width:100%;text-align:left;">
    <tr>
      <td align="left" style="font-family:Georgia,serif;color:#1a1a2e;line-height:1.6;font-size:16px;text-align:left;padding:16px 8px;">
        ${inner}
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface ResendAttachment {
  filename: string;
  content: string;
  content_id?: string;
  content_type?: string;
}

/** Resolves to whether Resend accepted the message. Never throws. */
export async function sendResendEmail(
  env: Env,
  options: {
    to: string;
    subject: string;
    text: string;
    html: string;
    logLabel: string;
    attachments?: ResendAttachment[];
  },
): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    console.warn(`[email] RESEND_API_KEY missing — skip ${options.logLabel}`);
    return false;
  }

  const fromAddress = env.EMAIL_FROM || DEFAULT_FROM;
  const replyTo = env.EMAIL_REPLY_TO || DEFAULT_REPLY_TO;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${DEFAULT_FROM_NAME} <${fromAddress}>`,
        to: [options.to],
        reply_to: replyTo,
        subject: options.subject,
        html: options.html,
        text: options.text,
        ...(options.attachments?.length ? { attachments: options.attachments } : {}),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[email] Resend error (${options.logLabel})`, response.status, body);
      return false;
    }

    console.log(`[email] ${options.logLabel} sent to`, options.to);
    return true;
  } catch (error) {
    console.error(`[email] failed to send ${options.logLabel}`, error);
    return false;
  }
}
