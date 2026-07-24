import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { EventOpsSummary, MealKey } from "@/types/event-ops";
import { MEAL_KEYS } from "@/types/event-ops";

interface SummaryStripProps {
  summary: EventOpsSummary | null;
  loading: boolean;
  error: string | null;
}

function formatMealLabel(key: MealKey): string {
  return key.replace(/_/g, " ");
}

export function SummaryStrip({ summary, loading, error }: SummaryStripProps) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading || !summary) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Loading…</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-muted-foreground">—</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.participants.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Checked in</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">{summary.participants.checked_in}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Not checked in
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-700">
              {summary.participants.not_checked_in}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {MEAL_KEYS.map((key) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground capitalize">
                {formatMealLabel(key)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.meals_claimed_by_key[key] ?? 0}</p>
              <p className="text-xs text-muted-foreground">meals claimed</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
