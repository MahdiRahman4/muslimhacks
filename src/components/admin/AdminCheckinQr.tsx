import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface AdminCheckinQrProps {
  code: string;
  size?: number;
}

/** Admin-only QR badge for printing at registration. Encodes the plain check-in code. */
export function AdminCheckinQr({ code, size = 180 }: AdminCheckinQrProps) {
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
      aria-label={`Check-in QR for ${code}`}
    />
  );
}
