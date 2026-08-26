import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { BRAND } from "@/components/Shared";
import { checkinByCode, getEventOpsErrorMessage, EventOpsApiError } from "@/lib/event-ops-api";
import type { ParticipantSummary } from "@/types/event-ops";

const SCANNER_ID = "admin-qr-checkin-scanner";

function normalizeScannedCode(raw: string): string {
  const trimmed = raw.trim().toUpperCase();
  // Allow plain codes or URLs that end with the code token.
  const parts = trimmed.split(/[/?#=&\s]+/).filter(Boolean);
  return (parts[parts.length - 1] || trimmed).toUpperCase();
}

interface QrCheckinScannerProps {
  onSuccess: (participant: ParticipantSummary) => void;
  disabled?: boolean;
}

/** Admin-only camera scanner — lives under /admin/event-ops. */
export function QrCheckinScanner({ onSuccess, disabled }: QrCheckinScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const busyRef = useRef(false);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [success, setSuccess] = useState<ParticipantSummary | null>(null);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      // Camera may already be released.
    }
    setActive(false);
  }, []);

  const handleScan = useCallback(
    async (raw: string) => {
      if (busyRef.current || disabled) return;
      busyRef.current = true;
      setError(null);
      setInfo(null);
      setSuccess(null);

      const code = normalizeScannedCode(raw);
      if (!code) {
        busyRef.current = false;
        return;
      }

      try {
        const data = await checkinByCode(code);
        setSuccess(data.participant);
        if (data.message) setInfo(data.message);
        onSuccess(data.participant);
      } catch (err) {
        if (err instanceof EventOpsApiError && err.code === "already_checked_in" && err.participant) {
          setSuccess(err.participant);
          setInfo(err.message);
          onSuccess(err.participant);
        } else if (err instanceof EventOpsApiError && err.code === "already_checked_in") {
          setInfo(err.message);
        } else {
          setError(getEventOpsErrorMessage(err));
        }
      } finally {
        busyRef.current = false;
      }
    },
    [disabled, onSuccess],
  );

  const startScanner = useCallback(async () => {
    setError(null);
    setInfo(null);
    setSuccess(null);

    try {
      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          void handleScan(decoded);
        },
        () => {
          // Ignore per-frame decode misses.
        },
      );
      setActive(true);
    } catch (err) {
      scannerRef.current = null;
      setError(
        err instanceof Error
          ? err.message
          : "Could not start camera. Check browser permissions.",
      );
    }
  }, [handleScan]);

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  return (
    <div className="flex flex-col gap-3">
      <div
        id={SCANNER_ID}
        className="overflow-hidden rounded-xl min-h-[240px]"
        style={{ background: "rgba(6,15,32,0.6)", border: "1px solid rgba(221,168,83,0.15)" }}
      />

      {!active ? (
        <button
          type="button"
          onClick={() => void startScanner()}
          disabled={disabled}
          className="w-full py-3 rounded-full font-sans text-sm font-semibold uppercase tracking-[0.16em] transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60"
          style={{
            background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
            color: BRAND.navyDeep,
            boxShadow: "0 0 18px rgba(221,168,83,0.25), 0 4px 12px rgba(221,168,83,0.15)",
          }}
        >
          Start camera
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void stopScanner()}
          className="w-full py-2.5 rounded-full font-sans text-xs font-medium transition-all duration-200 hover:opacity-80 focus-visible:ring-2"
          style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.18)", color: BRAND.cream }}
        >
          Stop camera
        </button>
      )}

      {success && (
        <div
          className="rounded-lg px-3.5 py-2.5 font-sans text-sm"
          style={{ background: "rgba(95,168,119,0.1)", border: "1px solid rgba(95,168,119,0.3)", color: "#5FA877" }}
        >
          <strong style={{ color: BRAND.cream }}>{success.full_name}</strong> checked in.
        </div>
      )}

      {info && (
        <div
          className="rounded-lg px-3.5 py-2.5 font-sans text-sm"
          style={{ background: "rgba(221,168,83,0.08)", border: "1px solid rgba(221,168,83,0.25)", color: BRAND.goldSoft }}
        >
          {info}
        </div>
      )}

      {error && (
        <div
          className="rounded-lg px-3.5 py-2.5 font-sans text-sm"
          style={{ background: "rgba(196,112,112,0.1)", border: "1px solid rgba(196,112,112,0.3)", color: "#C47070" }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
