import type { Env } from "../env";
import {
  DEFAULT_REPLY_TO,
  escapeHtml,
  firstName,
  sendResendEmail,
  wrapEmailHtml,
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

  const html = wrapEmailHtml(`
    <p style="margin:0 0 16px 0;text-align:left;">Assalamu alaikum <strong>${escapeHtml(name)}</strong>,</p>
    <p style="margin:0 0 16px 0;text-align:left;">Thank you for applying to <strong>MuslimHacks 2026</strong>. We read every application carefully.</p>
    <p style="margin:0 0 16px 0;text-align:left;">Unfortunately, we weren't able to offer you a spot this year. We had many strong applications and limited capacity.</p>
    <p style="margin:0 0 16px 0;text-align:left;">We genuinely hope you'll apply again next time, in shaa Allah.</p>
    <p style="margin:0 0 16px 0;color:#666;font-size:14px;text-align:left;">
      Questions? Contact
      <a href="mailto:${escapeHtml(DEFAULT_REPLY_TO)}" style="color:#b8860b;">${escapeHtml(DEFAULT_REPLY_TO)}</a>
    </p>
    <p style="margin:0;text-align:left;">Jazakum Allahu khayran,<br><strong>The MuslimHacks Team</strong></p>
  `);

  await sendResendEmail(env, {
    to,
    subject,
    text,
    html,
    logLabel: "application rejected",
  });
}
