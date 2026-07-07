import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ParticipantSummary } from "@/types/event-ops";

interface ParticipantsTableProps {
  participants: ParticipantSummary[];
  total: number;
  offset: number;
  limit: number;
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (participant: ParticipantSummary) => void;
  onPageChange: (offset: number) => void;
}

function formatTime(ms: number | null) {
  if (!ms) return "—";
  return new Date(ms).toLocaleString();
}

export function ParticipantsTable({
  participants,
  total,
  offset,
  limit,
  loading,
  error,
  selectedId,
  onSelect,
  onPageChange,
}: ParticipantsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Participants ({total})</CardTitle>
        {loading && <span className="text-sm text-muted-foreground">Loading…</span>}
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && participants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No participants match these filters.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Checked in</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((p) => (
                <TableRow
                  key={p.id}
                  className={`cursor-pointer ${selectedId === p.id ? "bg-muted/60" : ""}`}
                  onClick={() => onSelect(p)}
                >
                  <TableCell className="font-medium">{p.full_name}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.gender || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{p.public_checkin_code}</TableCell>
                  <TableCell>
                    <Badge variant={p.checkin_status === "checked_in" ? "default" : "secondary"}>
                      {p.checkin_status === "checked_in" ? "Checked in" : "Not checked in"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatTime(p.checked_in_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {total === 0
              ? "Showing 0"
              : `Showing ${offset + 1}–${Math.min(offset + participants.length, total)} of ${total}`}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loading || offset === 0}
              onClick={() => onPageChange(Math.max(0, offset - limit))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || offset + limit >= total}
              onClick={() => onPageChange(offset + limit)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
