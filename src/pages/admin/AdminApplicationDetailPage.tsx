import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ApiError,
  fetchAdminApplication,
  submitApplicationReview,
} from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Application, ApplicationReview } from "@/types/application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { logout } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [reviews, setReviews] = useState<ApplicationReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminApplication(id);
      setApplication(data.application);
      setReviews(data.reviews);
      setStatus(
        data.application.status === "approved" || data.application.status === "rejected"
          ? data.application.status
          : "pending",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const handleReviewSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;

    setReviewError(null);
    setReviewSuccess(null);
    setSubmitting(true);

    try {
      const payload: {
        status: "pending" | "approved" | "rejected";
        notes?: string;
        score?: number;
      } = { status, notes: notes.trim() || undefined };

      if (score.trim()) {
        const parsedScore = Number(score);
        if (!Number.isFinite(parsedScore)) {
          setReviewError("Score must be a number");
          setSubmitting(false);
          return;
        }
        payload.score = parsedScore;
      }

      const data = await submitApplicationReview(id, payload);
      setApplication(data.application);
      setReviews((current) => [data.review, ...current]);
      setReviewSuccess("Review saved.");
      setNotes("");
      setScore("");
    } catch (err) {
      setReviewError(err instanceof ApiError ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading application...</div>;
  }

  if (error || !application) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription>{error || "Application not found"}</AlertDescription>
        </Alert>
        <Link to="/admin/applications" className="mt-4 inline-block underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <div>
            <Link to="/admin/applications" className="text-sm underline">
              ← Back to applications
            </Link>
            <h1 className="text-xl font-semibold">{application.full_name}</h1>
            <p className="text-sm text-muted-foreground">{application.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 p-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Application details</CardTitle>
              <Badge variant="secondary">{application.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DetailRow label="Phone" value={application.phone} />
            <DetailRow label="School" value={application.school} />
            <DetailRow label="Program" value={application.program} />
            <DetailRow label="Graduation year" value={application.graduation_year?.toString()} />
            <DetailRow label="Gender" value={application.gender} />
            <DetailRow label="GitHub" value={application.github_url} link />
            <DetailRow label="LinkedIn" value={application.linkedin_url} link />
            <DetailRow label="Portfolio" value={application.portfolio_url} link />
            <DetailRow label="Resume" value={application.resume_url} link />
            <DetailRow label="Why join" value={application.why_join} multiline />
            <DetailRow label="Project idea" value={application.project_idea} multiline />
            <DetailRow label="Dietary restrictions" value={application.dietary_restrictions} />
            <DetailRow
              label="Needs travel support"
              value={application.needs_travel_support ? "Yes" : "No"}
            />
            <DetailRow
              label="Submitted"
              value={new Date(application.created_at).toLocaleString()}
            />
            <DetailRow
              label="Last updated"
              value={new Date(application.updated_at).toLocaleString()}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit review</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(value as "pending" | "approved" | "rejected")
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="score">Score</Label>
                  <Input
                    id="score"
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="Optional numeric score"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Review notes"
                  />
                </div>

                {reviewError && (
                  <Alert variant="destructive">
                    <AlertDescription>{reviewError}</AlertDescription>
                  </Alert>
                )}

                {reviewSuccess && (
                  <Alert>
                    <AlertDescription>{reviewSuccess}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save review"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="rounded-md border p-3 text-sm">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <Badge variant="secondary">{review.status}</Badge>
                      <span className="text-muted-foreground">
                        {new Date(review.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      {review.reviewer_email || review.reviewed_by}
                      {review.score != null ? ` · Score: ${review.score}` : ""}
                    </p>
                    {review.notes && <p className="mt-2 whitespace-pre-wrap">{review.notes}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

function DetailRow({
  label,
  value,
  link,
  multiline,
}: {
  label: string;
  value: string | null | undefined;
  link?: boolean;
  multiline?: boolean;
}) {
  if (!value) {
    return (
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground">—</p>
      </div>
    );
  }

  return (
    <div>
      <p className="font-medium">{label}</p>
      {link ? (
        <a href={value} target="_blank" rel="noreferrer" className="underline break-all">
          {value}
        </a>
      ) : multiline ? (
        <p className="whitespace-pre-wrap">{value}</p>
      ) : (
        <p>{value}</p>
      )}
    </div>
  );
}

export default AdminApplicationDetailPage;
