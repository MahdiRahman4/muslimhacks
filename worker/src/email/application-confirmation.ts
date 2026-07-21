import type { Env } from "../env";

const DEFAULT_FROM = "sponsors@muslimhacksoutreach.ca";
const DEFAULT_FROM_NAME = "MuslimHacks";
const DEFAULT_REPLY_TO = "info@muslimhacks.ca";

/**
 * Sends application confirmation via Resend.
 * Never throws — failures are logged so email can't block registration.
 */
export async function sendApplicationConfirmationEmail(
  env: Env,
  to: string,
  fullName: string,
): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY missing — skip confirmation");
    return;
  }

  const fromAddress = env.EMAIL_FROM || DEFAULT_FROM;
  const replyTo = env.EMAIL_REPLY_TO || DEFAULT_REPLY_TO;
  const firstName = fullName.split(" ")[0] || "there";

  const subject = "MuslimHacks 2026 — Application received";
  const text = [
    `Assalamu alaikum ${firstName},`,
    "",
    "Thank you for applying to MuslimHacks 2026. We've received your application.",
    "",
    "Our team will review every submission carefully, in shaa Allah. We'll email you with a decision in the coming weeks.",
    "",
    "You can view your application anytime from your dashboard:",
    "https://muslimhacks.ca/dashboard",
    "",
    `Questions? Reply to this email or contact us at ${replyTo}`,
    "",
    "Jazakum Allahu khayran,",
    "The MuslimHacks Team",
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Georgia, serif; color: #1a1a2e; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px;">
  <p>Assalamu alaikum <strong>${escapeHtml(firstName)}</strong>,</p>
  <p>Thank you for applying to <strong>MuslimHacks 2026</strong>. We've received your application.</p>
  <p>Our team will review every submission carefully, in shaa Allah. We'll email you with a decision in the coming weeks.</p>
  <p>
    <a href="https://muslimhacks.ca/dashboard" style="color: #b8860b; font-weight: bold;">
      View your dashboard
    </a>
  </p>
  <p style="color: #666; font-size: 14px;">
    Questions? Reply to this email or contact
    <a href="mailto:${escapeHtml(replyTo)}" style="color: #b8860b;">${escapeHtml(replyTo)}</a>
  </p>
  <p>Jazakum Allahu khayran,<br><strong>The MuslimHacks Team</strong></p>
</body>
</html>`.trim();

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${DEFAULT_FROM_NAME} <${fromAddress}>`,
        to: [to],
        reply_to: replyTo,
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[email] Resend error", response.status, body);
      return;
    }

    console.log("[email] application confirmation sent to", to);
  } catch (error) {
    console.error("[email] failed to send application confirmation", error);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
