import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  buildParticipantExportQuery,
  downloadCsvExport,
  getEventOpsErrorMessage,
} from "@/lib/event-ops-api";
import type { ParticipantListParams } from "@/types/event-ops";

interface ExportsSectionProps {
  currentFilters: ParticipantListParams;
}

export function ExportsSection({ currentFilters }: ExportsSectionProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runExport = async (key: string, path: string) => {
    setLoading(key);
    setError(null);
    try {
      await downloadCsvExport(path);
    } catch (err) {
      setError(getEventOpsErrorMessage(err));
    } finally {
      setLoading(null);
    }
  };

  const filteredQuery = buildParticipantExportQuery(currentFilters);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">CSV exports</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Downloads open directly from the Worker export endpoints.
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={loading !== null}
            onClick={() => void runExport("all", "/api/admin/participants/export")}
          >
            {loading === "all" ? "Exporting…" : "All participants"}
          </Button>
          <Button
            variant="outline"
            disabled={loading !== null}
            onClick={() =>
              void runExport("filtered", `/api/admin/participants/export${filteredQuery}`)
            }
          >
            {loading === "filtered" ? "Exporting…" : "Filtered participants"}
          </Button>
          <Button
            variant="outline"
            disabled={loading !== null}
            onClick={() => void runExport("checkins", "/api/admin/reports/checkins/export")}
          >
            {loading === "checkins" ? "Exporting…" : "Check-ins"}
          </Button>
          <Button
            variant="outline"
            disabled={loading !== null}
            onClick={() => void runExport("meals", "/api/admin/reports/meals/export")}
          >
            {loading === "meals" ? "Exporting…" : "Meal claims"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
