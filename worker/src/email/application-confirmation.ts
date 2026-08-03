import type { Env } from "../env";
import {
  DEFAULT_REPLY_TO,
  escapeHtml,
  firstName,
  sendResendEmail,
} from "./shared";

/**
 * Sends application confirmation via Resend.
 * Never throws — failures are logged so email can't block registration.
 */
export async function sendApplicationConfirmationEmail(
  env: Env,
  to: string,
  fullName: string,
): Promise<void> {
  const name = firstName(fullName);
  const subject = "MuslimHacks 2026 — Application received";
  const text = [
    `Assalamu alaikum ${name},`,
    "",
    "Thank you for applying to MuslimHacks 2026. We've received your application.",
    "",
    "Our team will review every submission carefully, in shaa Allah. We'll email you with a decision in the coming weeks.",
    "",
    "You can view your application anytime from your dashboard:",
    "https://muslimhacks.ca/dashboard",
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
  <p>Thank you for applying to <strong>MuslimHacks 2026</strong>. We've received your application.</p>
  <p>Our team will review every submission carefully, in shaa Allah. We'll email you with a decision in the coming weeks.</p>
  <p>
    <a href="https://muslimhacks.ca/dashboard" style="color: #b8860b; font-weight: bold;">
      View your dashboard
    </a>
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
    logLabel: "application confirmation",
  });
}
