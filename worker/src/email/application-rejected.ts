import type { Env } from "../env";
import {
  DEFAULT_REPLY_TO,
  escapeHtml,
  firstName,
  sendResendEmail,
} from "./shared";

/**
 * Sent when an admin rejects an application.
 * Never throws — failures are logged so email can't block the review.
 */
export async function sendApplicationRejectedEmail(
  env: Env,
  to: string,
  fullName: string,
): Promise<void> {
  const name = firstName(fullName);
  const subject = "MuslimHacks 2026 — Application update";
  const text = [
    `Assalamu alaikum ${name},`,
    "",
    "Thank you for applying to MuslimHacks 2026. We read every application carefully.",
    "",
    "Unfortunately, we weren't able to offer you a spot this year. We had many strong applications and limited capacity.",
    "",
    "We genuinely hope you'll apply again next time, in shaa Allah.",
    "",
    `Questions? Contact us at ${DEFAULT_REPLY_TO}`,
    "",
    "Jazakum Allahu khayran,",
    "The MuslimHacks Team",
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Georgia, serif; color: #1a1a2e; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px;">
  <p>Assalamu alaikum <strong>${escapeHtml(name)}</strong>,</p>
  <p>Thank you for applying to <strong>MuslimHacks 2026</strong>. We read every application carefully.</p>
  <p>Unfortunately, we weren't able to offer you a spot this year. We had many strong applications and limited capacity.</p>
  <p>We genuinely hope you'll apply again next time, in shaa Allah.</p>
  <p style="color: #666; font-size: 14px;">
    Questions? Contact
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
    logLabel: "application rejected",
  });
}
