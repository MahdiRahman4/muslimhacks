import type { Env } from "../env";

const DEFAULT_FROM = "info@muslimhacks.ca";
const DEFAULT_FROM_NAME = "MuslimHacks";

/**
 * Sends application confirmation. Never throws — failures are logged so
 * a bad email provider can't block registration.
 */
export async function sendApplicationConfirmationEmail(
  env: Env,
  to: string,
  fullName: string,
): Promise<void> {
  if (!env.EMAIL) {
    console.warn(
      "[email] EMAIL binding missing — skip confirmation (add [[send_email]] to wrangler.toml)",
    );
    return;
  }

  const fromAddress = env.EMAIL_FROM || DEFAULT_FROM;
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
    "Questions? Reply to this email or contact us at info@muslimhacks.ca",
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
    <a href="mailto:info@muslimhacks.ca" style="color: #b8860b;">info@muslimhacks.ca</a>
  </p>
  <p>Jazakum Allahu khayran,<br><strong>The MuslimHacks Team</strong></p>
</body>
</html>`.trim();

  try {
    await env.EMAIL.send({
      to,
      from: { email: fromAddress, name: DEFAULT_FROM_NAME },
      replyTo: fromAddress,
      subject,
      html,
      text,
    });
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
