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

export interface ResendAttachment {
  filename: string;
  content: string;
  content_id?: string;
  content_type?: string;
}

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
): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.warn(`[email] RESEND_API_KEY missing — skip ${options.logLabel}`);
    return;
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
      return;
    }

    console.log(`[email] ${options.logLabel} sent to`, options.to);
  } catch (error) {
    console.error(`[email] failed to send ${options.logLabel}`, error);
  }
}
