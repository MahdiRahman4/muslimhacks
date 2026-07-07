import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkinByCode, getEventOpsErrorMessage, EventOpsApiError } from "@/lib/event-ops-api";
import type { ParticipantSummary } from "@/types/event-ops";

interface CheckinCardProps {
  onSuccess: (participant: ParticipantSummary) => void;
}

export function CheckinCard({ onSuccess }: CheckinCardProps) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<ParticipantSummary | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || !code.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setInfo(null);

    try {
      const data = await checkinByCode(code);
      setSuccess(data.participant);
      if (data.message) {
        setInfo(data.message);
      }
      onSuccess(data.participant);
      setCode("");
    } catch (err) {
      if (err instanceof EventOpsApiError && err.code === "already_checked_in") {
        setInfo(err.message);
        setError(null);
      } else {
        setError(getEventOpsErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Manual check-in</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="checkin-code">Public check-in code</Label>
            <Input
              id="checkin-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SM53H769"
              className="font-mono"
              disabled={submitting}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting || !code.trim()}>
            {submitting ? "Checking in…" : "Check in"}
          </Button>
        </form>

        {success && (
          <Alert className="mt-4">
            <AlertDescription>
              <strong>{success.full_name}</strong> — {success.checkin_status.replace("_", " ")}
            </AlertDescription>
          </Alert>
        )}

        {info && (
          <Alert className="mt-4">
            <AlertDescription>{info}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
