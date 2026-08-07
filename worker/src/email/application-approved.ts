import type { Env } from "../env";
import {
  DEFAULT_REPLY_TO,
  escapeHtml,
  firstName,
  sendResendEmail,
  type ResendAttachment,
} from "./shared";
import { checkinQrPngBase64 } from "./qr";

/**
 * Sent when an admin approves an application. Includes check-in code + QR.
 * Never throws — failures are logged so email can't block the review.
 */
export async function sendApplicationApprovedEmail(
  env: Env,
  to: string,
  fullName: string,
  checkinCode: string,
): Promise<void> {
  const name = firstName(fullName);
  const code = checkinCode.trim().toUpperCase();
  let qrImgHtml = "";
  let attachments: ResendAttachment[] | undefined;

  try {
    const qrBase64 = await checkinQrPngBase64(code);
    qrImgHtml = `<p style="margin: 16px 0;"><img src="cid:checkin-qr" alt="Check-in QR code" width="240" height="240" style="display: block; border-radius: 8px;" /></p>`;
    attachments = [
      {
        filename: "checkin-qr.png",
        content: qrBase64,
        content_id: "checkin-qr",
        content_type: "image/png",
      },
    ];
  } catch (error) {
    console.error("Failed to generate check-in QR for email:", error);
  }

  const subject = "MuslimHacks 2026 — You're in!";
  const text = [
    `Assalamu alaikum ${name},`,
    "",
    "Alhamdulillah — you've been accepted to MuslimHacks 2026!",
    "",
    "Event details:",
    "• September 2026",
    "• Concordia University, Downtown Campus, Montréal, Quebec",
    "• In person — free to attend",
    "",
    "Your check-in code (show this at registration):",
    code,
    "",
    "Your approval email also includes a QR code — scan it at the door for fast check-in.",
    "You can also open your dashboard anytime: https://muslimhacks.ca/dashboard",
    "",
    `Questions? Reply to this email or contact us at ${DEFAULT_REPLY_TO}`,
    "",
    "Jazakum Allahu khayran,",
    "The MuslimHacks Team",
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Georgia, serif; color: #1a1a2e; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px;">
  <p>Assalamu alaikum <strong>${escapeHtml(name)}</strong>,</p>
  <p>Alhamdulillah — you've been accepted to <strong>MuslimHacks 2026</strong>!</p>
  <p><strong>Event details</strong></p>
  <ul>
    <li>September 2026</li>
    <li>Concordia University, Downtown Campus, Montréal, Quebec</li>
    <li>In person — free to attend</li>
  </ul>
  <p><strong>Your check-in QR code</strong> — show this at registration for a fast check-in:</p>
  ${qrImgHtml}
  <p><strong>Or use this code:</strong></p>
  <p style="font-family: monospace; font-size: 22px; letter-spacing: 0.12em; font-weight: bold; color: #b8860b;">
    ${escapeHtml(code)}
  </p>
  <p style="color: #666; font-size: 14px;">Save this QR or code on your phone. You'll need it when you arrive.</p>
  <p>
    <a href="https://muslimhacks.ca/dashboard" style="color: #b8860b; font-weight: bold;">
      View your dashboard
    </a>
    — your QR is always there too.
  </p>
  <p style="color: #666; font-size: 14px;">
    Questions? Reply to this email or contact
    <a href="mailto:${escapeHtml(DEFAULT_REPLY_TO)}" style="color: #b8860b;">${escapeHtml(DEFAULT_REPLY_TO)}</a>
  </p>
  <p>Jazakum Allahu khayran,<br><strong>The MuslimHacks Team</strong></p>
</body>
</html>`.trim();

  await sendResendEmail(env, {
    to,
    subject,
    text,
    html,
    logLabel: "application approved",
    attachments,
  });
}
