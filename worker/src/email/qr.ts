import QRCode from "qrcode";

const QR_OPTIONS = {
  width: 240,
  margin: 2,
  color: { dark: "#0C1F3F", light: "#FFFFFF" },
} as const;

/** Base64 PNG (no data: prefix) for Resend inline attachments. */
export async function checkinQrPngBase64(code: string): Promise<string> {
  const dataUrl = await QRCode.toDataURL(code.trim().toUpperCase(), QR_OPTIONS);
  const prefix = "data:image/png;base64,";
  if (!dataUrl.startsWith(prefix)) {
    throw new Error("Unexpected QR data URL format");
  }
  return dataUrl.slice(prefix.length);
}
