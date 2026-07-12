import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { downloadApplicationsCsv, fetchAdminApplications } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { AdminApplicationSummary } from "@/types/application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const PAGE_SIZE = 20;

const AdminApplicationsPage = () => {
  const { logout } = useAuth();
  const [applications, setApplications] = useState<AdminApplicationSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async (nextOffset = offset) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminApplications({
        status: status || undefined,
        gender: gender || undefined,
        search: search || undefined,
        limit: PAGE_SIZE,
        offset: nextOffset,
      });
      setApplications(data.applications);
      setTotal(data.pagination.total);
      setOffset(nextOffset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadApplications(0);
  }, []);

  const handleFilterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void loadApplications(0);
  };

  const handleExportCsv = async () => {
    setExporting(true);
    setError(null);
    try {
      await downloadApplicationsCsv({
        status: status || undefined,
        gender: gender || undefined,
        search: search || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-semibold">Admin Applications</h1>
            <p className="text-sm text-muted-foreground">Review hackathon registrations</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void handleExportCsv()}
              disabled={exporting}
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
            <Link to="/admin/event-ops" className="text-sm underline">
              Event Ops
            </Link>
            <Link to="/apply" className="text-sm underline">
              Applicant view
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFilterSubmit} className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status || "all"} onValueChange={(value) => setStatus(value === "all" ? "" : value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  placeholder="Exact match"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name or email"
                />
              </div>
              <div className="md:col-span-4">
                <Button type="submit" disabled={loading}>
                  Apply filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              Applications ({total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : applications.length === 0 ? (
              <p className="text-muted-foreground">No applications found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <Link
                          to={`/admin/applications/${application.id}`}
                          className="underline"
                        >
                          {application.full_name}
                        </Link>
                      </TableCell>
                      <TableCell>{application.email}</TableCell>
                      <TableCell>{application.program || "—"}</TableCell>
                      <TableCell>{application.gender || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{application.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(application.updated_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {applications.length ? offset + 1 : 0}–{offset + applications.length} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading || offset === 0}
                  onClick={() => void loadApplications(Math.max(0, offset - PAGE_SIZE))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading || offset + PAGE_SIZE >= total}
                  onClick={() => void loadApplications(offset + PAGE_SIZE)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminApplicationsPage;
