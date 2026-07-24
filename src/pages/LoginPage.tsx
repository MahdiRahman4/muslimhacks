import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LoginPage = () => {
  const { login, register, getErrorMessage, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: string } | null)?.from ||
    (user?.role === "admin" ? "/admin/applications" : "/apply");

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const authUser =
        mode === "login"
          ? await login(email, password)
          : await register(email, password);

      navigate(authUser.role === "admin" ? "/admin/applications" : "/apply", {
        replace: true,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === "login" ? "Sign in" : "Create account"}</CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Sign in to submit or manage your MuslimHacks application."
              : "Create an applicant account to apply for MuslimHacks."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Please wait..." : mode === "login" ? "Sign in" : "Register"}
            </Button>
          </form>

          <div className="mt-4 text-sm text-muted-foreground">
            {mode === "login" ? "Need an account?" : "Already registered?"}{" "}
            <button
              type="button"
              className="underline"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
            >
              {mode === "login" ? "Register" : "Sign in"}
            </button>
          </div>

          <div className="mt-4">
            <Link to="/" className="text-sm text-muted-foreground underline">
              Back to homepage
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
