import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
        if (err instanceof EventOpsApiError && err.code === "already_checked_in") {
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
    <div className="space-y-3">
      <div
        id={SCANNER_ID}
        className="overflow-hidden rounded-lg border bg-black/40 min-h-[240px]"
      />

      <div className="flex gap-2">
        {!active ? (
          <Button type="button" className="flex-1" onClick={() => void startScanner()} disabled={disabled}>
            Start camera
          </Button>
        ) : (
          <Button type="button" variant="outline" className="flex-1" onClick={() => void stopScanner()}>
            Stop camera
          </Button>
        )}
      </div>

      {success && (
        <Alert>
          <AlertDescription>
            <strong>{success.full_name}</strong> checked in.
          </AlertDescription>
        </Alert>
      )}

      {info && (
        <Alert>
          <AlertDescription>{info}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
