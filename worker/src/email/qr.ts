import QRCode from "qrcode";

/** PNG data URL for embedding in approval emails. */
export async function checkinQrDataUrl(code: string): Promise<string> {
  return QRCode.toDataURL(code.trim().toUpperCase(), {
    width: 240,
    margin: 2,
    color: { dark: "#0C1F3F", light: "#FFFFFF" },
  });
}
