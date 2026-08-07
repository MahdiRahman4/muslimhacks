import type { Env } from "../env";
import {
  DEFAULT_REPLY_TO,
  escapeHtml,
  firstName,
  sendResendEmail,
} from "./shared";

const DASHBOARD_URL = "https://muslimhacks.ca/dashboard";

/**
 * Sent when an admin approves an application. Points to dashboard for QR check-in.
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

  const subject = "MuslimHacks 2026: You're in!";
  const text = [
    `Assalamu alaikum ${name},`,
    "",
    "Alhamdulillah, you've been accepted to MuslimHacks 2026!",
    "",
    "Event details:",
    "• September 2026",
    "• Concordia University, Downtown Campus, Montréal, Quebec",
    "• In person, free to attend",
    "",
    "For check-in, open your dashboard to get your QR code:",
    DASHBOARD_URL,
    "",
    "Backup check-in code (if needed):",
    code,
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
  <p>Alhamdulillah, you've been accepted to <strong>MuslimHacks 2026</strong>!</p>
  <p><strong>Event details</strong></p>
  <ul>
    <li>September 2026</li>
    <li>Concordia University, Downtown Campus, Montréal, Quebec</li>
    <li>In person, free to attend</li>
  </ul>
  <p><strong>Check-in</strong></p>
  <p>Open your dashboard to get your QR code. Show it at registration for a fast check-in:</p>
  <p style="margin: 20px 0;">
    <a href="${DASHBOARD_URL}" style="display: inline-block; padding: 14px 24px; background: #b8860b; color: #ffffff; font-weight: bold; text-decoration: none; border-radius: 999px;">
      Open my dashboard
    </a>
  </p>
  <p><strong>Backup code</strong> (if you can't open the dashboard):</p>
  <p style="font-family: monospace; font-size: 22px; letter-spacing: 0.12em; font-weight: bold; color: #b8860b;">
    ${escapeHtml(code)}
  </p>
  <p style="color: #666; font-size: 14px;">Save this code on your phone just in case.</p>
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
  });
}
