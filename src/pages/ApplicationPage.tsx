import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ApiError,
  fetchMyApplication,
  mapApiErrorToFieldErrors,
  saveApplication,
  toFormValues,
} from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Application, ApplicationFormValues } from "@/types/application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const optionalUrl = z
  .string()
  .refine((value) => value === "" || z.string().url().safeParse(value).success, {
    message: "Must be a valid URL",
  });

const applicationSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(200),
  phone: z.string().max(50),
  school: z.string().max(200),
  program: z.string().max(200),
  graduation_year: z
    .string()
    .refine(
      (value) => !value || (/^\d{4}$/.test(value) && Number(value) >= 1950 && Number(value) <= 2040),
      "Graduation year must be between 1950 and 2040",
    ),
  github_url: optionalUrl,
  linkedin_url: optionalUrl,
  portfolio_url: optionalUrl,
  resume_url: optionalUrl,
  why_join: z.string().max(5000),
  project_idea: z.string().max(5000),
  dietary_restrictions: z.string().max(500),
  needs_travel_support: z.boolean(),
  gender: z.string().max(50),
});

const defaultValues: ApplicationFormValues = {
  full_name: "",
  phone: "",
  school: "",
  program: "",
  graduation_year: "",
  github_url: "",
  linkedin_url: "",
  portfolio_url: "",
  resume_url: "",
  why_join: "",
  project_idea: "",
  dietary_restrictions: "",
  needs_travel_support: false,
  gender: "",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

const ApplicationPage = () => {
  const { user, logout, isAdmin } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const readOnly =
    application?.status === "approved" || application?.status === "rejected";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setFormError(null);
      try {
        const data = await fetchMyApplication();
        setApplication(data.application);
        reset(toFormValues(data.application));
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setApplication(null);
          reset(defaultValues);
        } else {
          setFormError(error instanceof ApiError ? error.message : "Failed to load application");
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [reset]);

  const onSubmit = async (values: ApplicationFormValues) => {
    setFormError(null);
    setSuccessMessage(null);

    try {
      const data = await saveApplication(values);
      setApplication(data.application);
      reset(toFormValues(data.application));
      setSuccessMessage("Application saved successfully.");
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = mapApiErrorToFieldErrors(error.message);
        const entries = Object.entries(fieldErrors);
        if (entries.length > 0) {
          entries.forEach(([field, message]) => {
            setError(field as keyof ApplicationFormValues, { message });
          });
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError("Failed to save application");
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading application...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-semibold">MuslimHacks Application</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link to="/admin/applications" className="text-sm underline">
                Admin
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Application form</CardTitle>
                <CardDescription>
                  Save your details below. You can come back and update them until a decision is made.
                </CardDescription>
              </div>
              {application && <Badge variant="secondary">{application.status}</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {readOnly && (
              <Alert className="mb-4">
                <AlertDescription>
                  Your application is {application?.status} and can no longer be edited.
                </AlertDescription>
              </Alert>
            )}

            {formError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="mb-4">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name *</Label>
                <Input id="full_name" disabled={readOnly} {...register("full_name")} />
                <FieldError message={errors.full_name?.message} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" disabled={readOnly} {...register("phone")} />
                  <FieldError message={errors.phone?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    disabled={readOnly}
                    value={watch("gender") || undefined}
                    onValueChange={(value) => setValue("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.gender?.message} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Input id="school" disabled={readOnly} {...register("school")} />
                  <FieldError message={errors.school?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program">Program</Label>
                  <Input id="program" disabled={readOnly} {...register("program")} />
                  <FieldError message={errors.program?.message} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="graduation_year">Graduation year</Label>
                <Input
                  id="graduation_year"
                  type="number"
                  disabled={readOnly}
                  {...register("graduation_year")}
                />
                <FieldError message={errors.graduation_year?.message} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="github_url">GitHub URL</Label>
                  <Input id="github_url" disabled={readOnly} {...register("github_url")} />
                  <FieldError message={errors.github_url?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input id="linkedin_url" disabled={readOnly} {...register("linkedin_url")} />
                  <FieldError message={errors.linkedin_url?.message} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="portfolio_url">Portfolio URL</Label>
                  <Input id="portfolio_url" disabled={readOnly} {...register("portfolio_url")} />
                  <FieldError message={errors.portfolio_url?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resume_url">Resume URL</Label>
                  <Input id="resume_url" disabled={readOnly} {...register("resume_url")} />
                  <FieldError message={errors.resume_url?.message} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="why_join">Why do you want to join?</Label>
                <Textarea id="why_join" disabled={readOnly} rows={4} {...register("why_join")} />
                <FieldError message={errors.why_join?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_idea">Project idea</Label>
                <Textarea
                  id="project_idea"
                  disabled={readOnly}
                  rows={4}
                  {...register("project_idea")}
                />
                <FieldError message={errors.project_idea?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietary_restrictions">Dietary restrictions</Label>
                <Input
                  id="dietary_restrictions"
                  disabled={readOnly}
                  {...register("dietary_restrictions")}
                />
                <FieldError message={errors.dietary_restrictions?.message} />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="needs_travel_support"
                  disabled={readOnly}
                  checked={watch("needs_travel_support")}
                  onCheckedChange={(checked) =>
                    setValue("needs_travel_support", checked === true)
                  }
                />
                <Label htmlFor="needs_travel_support">I need travel support</Label>
              </div>
              <FieldError message={errors.needs_travel_support?.message} />

              {!readOnly && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : application ? "Update application" : "Submit application"}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ApplicationPage;
