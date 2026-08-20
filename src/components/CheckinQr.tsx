import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { useTranslation } from "react-i18next";

interface CheckinQrProps {
  code: string;
  size?: number;
}

/** QR badge encoding the plain check-in code for fast door check-in. */
export function CheckinQr({ code, size = 180 }: CheckinQrProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !code) return;

    void QRCode.toCanvas(canvas, code.trim().toUpperCase(), {
      width: size,
      margin: 2,
      color: { dark: "#0C1F3F", light: "#FFFFFF" },
    });
  }, [code, size]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg border bg-white p-2"
      style={{ borderColor: "rgba(221,168,83,0.25)" }}
      aria-label={t("checkin.qrAriaLabel", { code })}
    />
  );
}

/** @deprecated Use CheckinQr */
export const AdminCheckinQr = CheckinQr;
