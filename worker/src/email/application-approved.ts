import type { Env } from "../env";
import {
  DEFAULT_REPLY_TO,
  escapeHtml,
  firstName,
  sendResendEmail,
  wrapEmailHtml,
} from "./shared";

const DASHBOARD_URL = "https://muslimhacks.ca/dashboard";
const DISCORD_RSVP_URL = "https://discord.gg/EXZv33vmV";

function linkButton(href: string, label: string, background: string): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:12px 0 16px 0;">
  <tr>
    <td align="left">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="left" bgcolor="${background}" style="background:${background};border-radius:6px;">
            <a href="${href}" style="display:inline-block;padding:12px 18px;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;text-decoration:none;border-radius:6px;">
              ${label}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
}

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
    "Please RSVP by joining our Discord server. If you join, that means you're coming:",
    DISCORD_RSVP_URL,
    "",
    "For check-in, open your dashboard to get your QR code:",
    DASHBOARD_URL,
    "",
    "Backup check-in code (if needed):",
    code,
    "",
    "Event details:",
    "• September 5-6, 2026",
    "• Concordia University, Downtown Campus, Montréal, Quebec",
    "• In person, free to attend",
    "",
    `Questions? Reply to this email or contact us at ${DEFAULT_REPLY_TO}`,
    "",
    "Jazakum Allahu khayran,",
    "The MuslimHacks Team",
  ].join("\n");

  const html = wrapEmailHtml(`
    <p style="margin:0 0 16px 0;text-align:left;">Assalamu alaikum <strong>${escapeHtml(name)}</strong>,</p>
    <p style="margin:0 0 16px 0;text-align:left;">Alhamdulillah, you've been accepted to <strong>MuslimHacks 2026</strong>!</p>
    <p style="margin:0 0 8px 0;text-align:left;"><strong>RSVP</strong></p>
    <p style="margin:0 0 8px 0;text-align:left;">Please join our Discord server to RSVP. Joining the server means you're coming.</p>
    ${linkButton(DISCORD_RSVP_URL, "Join Discord to RSVP", "#5865F2")}
    <p style="margin:0 0 24px 0;color:#666;font-size:14px;text-align:left;">
      Or open this link: <a href="${DISCORD_RSVP_URL}" style="color:#b8860b;">${DISCORD_RSVP_URL}</a>
    </p>
    <p style="margin:0 0 8px 0;text-align:left;"><strong>Check-in</strong></p>
    <p style="margin:0 0 8px 0;text-align:left;">Open your dashboard to get your QR code. Show it at registration for a fast check-in:</p>
    ${linkButton(DASHBOARD_URL, "Open my dashboard", "#b8860b")}
    <p style="margin:0 0 8px 0;text-align:left;"><strong>Backup code</strong> (if you can't open the dashboard):</p>
    <p style="margin:0 0 8px 0;font-family:Arial,monospace;font-size:22px;letter-spacing:0.12em;font-weight:bold;color:#b8860b;text-align:left;">
      ${escapeHtml(code)}
    </p>
    <p style="margin:0 0 24px 0;color:#666;font-size:14px;text-align:left;">Save this code on your phone just in case.</p>
    <p style="margin:0 0 16px 0;text-align:left;">
      <strong>Event details</strong><br>
      • September 5-6, 2026<br>
      • Concordia University, Downtown Campus, Montréal, Quebec<br>
      • In person, free to attend
    </p>
    <p style="margin:0 0 16px 0;color:#666;font-size:14px;text-align:left;">
      Questions? Reply to this email or contact
      <a href="mailto:${escapeHtml(DEFAULT_REPLY_TO)}" style="color:#b8860b;">${escapeHtml(DEFAULT_REPLY_TO)}</a>
    </p>
    <p style="margin:0;text-align:left;">Jazakum Allahu khayran,<br><strong>The MuslimHacks Team</strong></p>
  `);

  await sendResendEmail(env, {
    to,
    subject,
    text,
    html,
    logLabel: "application approved",
  });
}
