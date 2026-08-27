import type { Env } from "../env";
import {
  DEFAULT_REPLY_TO,
  escapeHtml,
  firstName,
  sendResendEmail,
  wrapEmailHtml,
} from "./shared";

/**
 * Sends application confirmation via Resend. Resolves to whether it was
 * accepted. Never throws — failures are logged so email can't block
 * registration.
 */
export async function sendApplicationConfirmationEmail(
  env: Env,
  to: string,
  fullName: string,
): Promise<boolean> {
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

  const html = wrapEmailHtml(`
    <p style="margin:0 0 16px 0;text-align:left;">Assalamu alaikum <strong>${escapeHtml(name)}</strong>,</p>
    <p style="margin:0 0 16px 0;text-align:left;">Thank you for applying to <strong>MuslimHacks 2026</strong>. We've received your application.</p>
    <p style="margin:0 0 16px 0;text-align:left;">Our team will review every submission carefully, in shaa Allah. We'll email you with a decision in the coming weeks.</p>
    <p style="margin:0 0 16px 0;text-align:left;">
      <a href="https://muslimhacks.ca/dashboard" style="color:#b8860b;font-weight:bold;">
        View your dashboard
      </a>
    </p>
    <p style="margin:0 0 16px 0;color:#666;font-size:14px;text-align:left;">
      Questions? Reply to this email or contact
      <a href="mailto:${escapeHtml(DEFAULT_REPLY_TO)}" style="color:#b8860b;">${escapeHtml(DEFAULT_REPLY_TO)}</a>
    </p>
    <p style="margin:0;text-align:left;">Jazakum Allahu khayran,<br><strong>The MuslimHacks Team</strong></p>
  `);

  return sendResendEmail(env, {
    to,
    subject,
    text,
    html,
    logLabel: "application confirmation",
  });
}
