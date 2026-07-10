import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import NotFound from "../../pages/NotFound";
import { BRAND, StarPattern, GoldText, Eyebrow, GLOBAL_CSS } from "../Shared";
import muslimHacksLogo from "../../assets/muslimhacks-gradient.svg";
import Footer from "../ui/footer";
import { ApiError, fetchMyApplication, submitApplicationForm } from "@/lib/api";
import type { ApplicationStatus } from "@/types/application";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  fullName: string;
  email: string;
  institution: string;
  github: string;
  linkedin: string;
  resumeFile: File | null;
  dietary: string;
  accessibility: string;
  firstHackathon: boolean | null;
  csCareer: boolean | null;
  motivation: string;
  pastProject: string;
  interests: string;
  community: string;
}

interface Errors {
  [key: string]: string;
}

const EMPTY_FORM: FormData = {
  fullName: "",
  email: "",
  institution: "",
  github: "",
  linkedin: "",
  resumeFile: null,
  dietary: "",
  accessibility: "",
  firstHackathon: null,
  csCareer: null,
  motivation: "",
  pastProject: "",
  interests: "",
  community: "",
};

// Required fields for progress calculation
const REQUIRED_FIELDS: (keyof FormData)[] = [
  "fullName",
  "email",
  "github",
  "linkedin",
  "resumeFile",
  "dietary",
  "firstHackathon",
  "csCareer",
  "motivation",
  "pastProject",
  "interests",
];

function calcProgress(form: FormData): number {
  const filled = REQUIRED_FIELDS.filter((k) => {
    const v = form[k];
    if (v === null || v === undefined) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (v instanceof File) return true;
    if (typeof v === "boolean") return true;
    return false;
  });
  return Math.round((filled.length / REQUIRED_FIELDS.length) * 100);
}

function validate(form: FormData): Errors {
  const e: Errors = {};
  if (!form.fullName.trim()) e.fullName = "Please enter your full name.";
  if (!form.email.trim()) e.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    e.email = "Please enter a valid email address.";
  if (!form.github.trim()) e.github = "Please enter your GitHub profile.";
  if (!form.linkedin.trim()) e.linkedin = "Please enter your LinkedIn profile.";
  if (!form.resumeFile) e.resumeFile = "Please upload your resume or CV.";
  if (!form.dietary.trim())
    e.dietary = "Please let us know about dietary needs.";
  if (form.firstHackathon === null)
    e.firstHackathon = "Please select yes or no.";
  if (form.csCareer === null) e.csCareer = "Please select yes or no.";
  if (!form.motivation.trim()) e.motivation = "Please share your motivation.";
  if (!form.pastProject.trim())
    e.pastProject = "Please describe a past project.";
  if (!form.interests.trim()) e.interests = "Please share your interests.";
  return e;
}

// ─── Reusable field components ────────────────────────────────────────────────
function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-intimate text-base leading-snug"
      style={{ fontStyle: "italic", color: BRAND.cream }}
    >
      {children}
      {required && (
        <span
          className="ml-1 font-sans not-italic text-xs"
          style={{ color: BRAND.gold }}
        >
          *
        </span>
      )}
    </label>
  );
}

function HelperText({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-sans text-xs leading-relaxed"
      style={{ color: BRAND.sand }}
    >
      {children}
    </p>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="font-sans text-xs flex items-center gap-1"
      style={{ color: "#C45B5B" }}
    >
      <AlertCircle size={12} />
      {message}
    </p>
  );
}

const inputBase = {
  background: "rgba(245,238,227,0.06)",
  border: `1px solid rgba(221,168,83,0.25)`,
  color: BRAND.cream,
  borderRadius: "6px",
  outline: "none",
  transition: "border-color 0.2s",
} as React.CSSProperties;

const inputError = {
  ...inputBase,
  border: `1px solid rgba(196,91,91,0.6)`,
} as React.CSSProperties;

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  readOnly,
  error,
}: {
  id: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  error?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 font-sans text-sm focus-visible:ring-2 focus-visible:ring-offset-1"
      style={
        readOnly
          ? { ...inputBase, opacity: 0.6, cursor: "default" }
          : error
          ? inputError
          : inputBase
      }
    />
  );
}

function Textarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 font-sans text-sm resize-y focus-visible:ring-2 focus-visible:ring-offset-1"
      style={error ? inputError : inputBase}
    />
  );
}

// ─── Yes/No toggle ────────────────────────────────────────────────────────────
function YesNoToggle({
  id,
  value,
  onChange,
  error,
}: {
  id: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  error?: string;
}) {
  return (
    <div id={id} className="flex gap-3" role="group" aria-labelledby={`${id}-label`}>
      {([true, false] as const).map((opt) => (
        <button
          key={String(opt)}
          type="button"
          onClick={() => onChange(opt)}
          className="px-6 py-2.5 rounded-full font-sans text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-pressed={value === opt}
          style={
            value === opt
              ? {
                  background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
                  color: BRAND.navyDeep,
                  border: "none",
                  boxShadow: "0 4px 16px rgba(221,168,83,0.22)",
                }
              : {
                  background: "rgba(245,238,227,0.07)",
                  border: error
                    ? `1px solid rgba(196,91,91,0.5)`
                    : `1px solid rgba(221,168,83,0.2)`,
                  color: BRAND.creamMuted,
                }
          }
        >
          {opt ? "Yes" : "No"}
        </button>
      ))}
    </div>
  );
}

// ─── File upload ──────────────────────────────────────────────────────────────
function ResumeUpload({
  id,
  value,
  onChange,
  error,
}: {
  id?: string;
  value: File | null;
  onChange: (f: File | null) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) return;
    onChange(file);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  if (value) {
    return (
      <div
        id={id}
        className="flex items-center justify-between px-4 py-3 rounded-lg"
        style={{
          background: "rgba(221,168,83,0.08)",
          border: `1px solid rgba(221,168,83,0.3)`,
        }}
      >
        <div className="flex flex-col gap-0.5">
          <span
            className="font-sans text-sm font-medium"
            style={{ color: BRAND.cream }}
          >
            {value.name}
          </span>
          <span className="font-sans text-xs" style={{ color: BRAND.sand }}>
            {formatSize(value.size)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="p-1 rounded hover:opacity-70 transition-opacity focus-visible:ring-2"
          aria-label="Remove file"
          style={{ color: BRAND.gold }}
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        id={id}
        className="relative flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-lg cursor-pointer transition-all duration-200"
        style={{
          background: dragging
            ? "rgba(221,168,83,0.08)"
            : "rgba(245,238,227,0.04)",
          border: error
            ? `1px dashed rgba(196,91,91,0.5)`
            : dragging
            ? `1px dashed ${BRAND.gold}`
            : `1px dashed rgba(221,168,83,0.28)`,
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label="Upload resume — click or drag and drop"
      >
        <Upload size={24} style={{ color: BRAND.gold }} />
        <div className="text-center flex flex-col gap-1">
          <p
            className="font-sans text-sm font-medium"
            style={{ color: BRAND.cream }}
          >
            Drag & drop or{" "}
            <span
              style={{
                color: BRAND.gold,
                textDecoration: "underline",
              }}
            >
              browse
            </span>
          </p>
          <p className="font-sans text-xs" style={{ color: BRAND.sand }}>
            PDF preferred · max 10 MB
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </>
  );
}

// ─── Form section wrapper ─────────────────────────────────────────────────────
function FormSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-baseline gap-4">
        <span
          className="font-display text-4xl font-bold tabular-nums"
          style={{
            background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {number}
        </span>
        <h2
          className="font-display font-bold"
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            color: BRAND.cream,
          }}
        >
          {title}
        </h2>
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

// ─── Apply page ───────────────────────────────────────────────────────────────
export default function ApplicationSection() {
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [existingStatus, setExistingStatus] = useState<ApplicationStatus | null>(null);

  useEffect(() => {
    const email = clerkUser?.primaryEmailAddress?.emailAddress;
    if (email) {
      setForm((current) => (current.email ? current : { ...current, email }));
    }
  }, [clerkUser?.primaryEmailAddress?.emailAddress]);

  useEffect(() => {
    let cancelled = false;

    async function loadExisting() {
      setLoadingExisting(true);
      try {
        const data = await fetchMyApplication();
        if (cancelled) return;

        const status = data.application.status;
        setExistingStatus(status);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          if (!cancelled) setExistingStatus(null);
          return;
        }
        if (!cancelled) {
          setSubmitError(
            error instanceof ApiError ? error.message : "Failed to load application status",
          );
        }
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    }

    void loadExisting();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const progress = calcProgress(form);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (submitAttempted && errors[key as string]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key as string];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    setSubmitError(null);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0];
      requestAnimationFrame(() => {
        document.getElementById(firstKey)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
      return;
    }

    const formData = new FormData();
    formData.append("fullName", form.fullName);
    formData.append("institution", form.institution);
    formData.append("github", form.github);
    formData.append("linkedin", form.linkedin);
    if (form.resumeFile) formData.append("resumeFile", form.resumeFile);
    formData.append("dietary", form.dietary);
    formData.append("accessibility", form.accessibility);
    formData.append("firstHackathon", String(form.firstHackathon));
    formData.append("csCareer", String(form.csCareer));
    formData.append("motivation", form.motivation);
    formData.append("pastProject", form.pastProject);
    formData.append("interests", form.interests);
    formData.append("community", form.community);

    setSubmitting(true);
    try {
      await submitApplicationForm(formData);
      navigate("/apply/submitted");
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : "Failed to submit application",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const divider = (
    <div
      className="border-t my-2"
      style={{ borderColor: "rgba(221,168,83,0.12)" }}
    />
  );

  if (loadingExisting) {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-sans"
        style={{ background: BRAND.navyDeep, color: BRAND.cream }}
      >
        Loading application...
      </div>
    );
  }

  if (existingStatus === "approved" || existingStatus === "rejected") {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-sans px-6"
        style={{ background: BRAND.navyDeep, color: BRAND.cream }}
      >
        <div className="max-w-lg text-center space-y-4">
          <AlertCircle size={32} className="mx-auto" style={{ color: BRAND.gold }} />
          <h1 className="font-display text-3xl">Application already submitted</h1>
          <p className="font-sans text-sm" style={{ color: BRAND.sand }}>
            Your application is <strong>{existingStatus}</strong> and can no longer be edited.
            {existingStatus === "approved"
              ? " Check your email for next steps."
              : " Contact the team if you think this is a mistake."}
          </p>
          <Link
            to="/"
            className="inline-block font-sans text-sm underline"
            style={{ color: BRAND.gold }}
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans relative"
      style={{
        background: `linear-gradient(180deg, ${BRAND.purpleDeep} 0%, ${BRAND.navy} 50%, ${BRAND.navyDeep} 100%)`,
        color: BRAND.cream,
      }}
    >
      <style>{GLOBAL_CSS}</style>

      {/* Subtle star field */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <StarPattern opacity={0.04} />
      </div>

      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "rgba(6,15,32,0.88)",
          backdropFilter: "blur(14px)",
        }}
      >
        {/* Nav row */}
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span
            className="font-sans text-xs tabular-nums"
            style={{ color: BRAND.sand }}
          >
            {progress}% complete
          </span>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="font-sans text-xs uppercase tracking-[0.2em] flex items-center gap-1.5 hover:opacity-70 transition-opacity focus-visible:ring-2 rounded"
              style={{ color: BRAND.purpleLight }}
            >
              <ArrowLeft size={13} />
              Back
            </Link>
          </div>
        </div>

        {/* Full-width progress bar — flush to bottom of header */}
        <div style={{ background: "rgba(245,238,227,0.08)", height: "2px" }}>
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${BRAND.goldSoft}, ${BRAND.gold})`,
            }}
          />
        </div>
      </header>

      {/* Form */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex justify-between">
          <div className="flex flex-col gap-5 mb-14">
            <Eyebrow>Apply</Eyebrow>
            <h1
              className="font-display font-black leading-tight"
              style={{
                fontSize: "clamp(2.75rem, 7vw, 5rem)",
                letterSpacing: "-0.02em",
                color: BRAND.cream,
              }}
            >
              Build <GoldText>with us</GoldText>
            </h1>
            <p
              className="font-intimate text-xl leading-relaxed"
              style={{
                fontStyle: "italic",
                color: BRAND.creamMuted,
              }}
            >
              Tell us a little about you — it takes about 10 minutes.
            </p>
          </div>
          <div className="h-full w-auto">
            <img
              src={muslimHacksLogo}
              alt="MuslimHacks logo"
              className="w-auto"
              style={{ height: "12rem" }}
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-14"
        >
          {/* ── Section 1 ──────────────────────────────────────────── */}
          <FormSection number="01" title="About you">
            <Field>
              <FieldLabel htmlFor="fullName" required>
                Full name
              </FieldLabel>
              <TextInput
                id="fullName"
                value={form.fullName}
                onChange={(v) => set("fullName", v)}
                placeholder="Your full name"
                error={errors.fullName}
              />
              <FieldError message={errors.fullName} />
            </Field>

            <Field>
              <FieldLabel htmlFor="email" required>
                Email
              </FieldLabel>
              <TextInput
                id="email"
                value={form.email}
                onChange={(v) => set("email", v)}
                placeholder="applicant@example.com"
                error={errors.email}
              />
              <FieldError message={errors.email} />
            </Field>

            <Field>
              <FieldLabel htmlFor="institution">
                If you're a student, which school or institution?
              </FieldLabel>
              <TextInput
                id="institution"
                value={form.institution}
                onChange={(v) => set("institution", v)}
                placeholder="e.g. Concordia University (optional)"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="github" required>
                GitHub
              </FieldLabel>
              <TextInput
                id="github"
                value={form.github}
                onChange={(v) => set("github", v)}
                placeholder="github.com/username"
                error={errors.github}
              />
              <FieldError message={errors.github} />
            </Field>

            <Field>
              <FieldLabel htmlFor="linkedin" required>
                LinkedIn
              </FieldLabel>
              <TextInput
                id="linkedin"
                value={form.linkedin}
                onChange={(v) => set("linkedin", v)}
                placeholder="linkedin.com/in/username"
                error={errors.linkedin}
              />
              <FieldError message={errors.linkedin} />
            </Field>

            <Field>
              <FieldLabel htmlFor="resumeFile" required>
                Resume / CV
              </FieldLabel>
              <ResumeUpload
                id="resumeFile"
                value={form.resumeFile}
                onChange={(f) => set("resumeFile", f)}
                error={errors.resumeFile}
              />
              <FieldError message={errors.resumeFile} />
            </Field>
          </FormSection>

          {divider}

          {/* ── Section 2 ──────────────────────────────────────────── */}
          <FormSection number="02" title="A few details">
            <Field>
              <FieldLabel htmlFor="dietary" required>
                Dietary restrictions & allergies
              </FieldLabel>
              <TextInput
                id="dietary"
                value={form.dietary}
                onChange={(v) => set("dietary", v)}
                placeholder="e.g. nut allergy, vegan, none"
                error={errors.dietary}
              />
              <HelperText>
                All food is halal — let us know about allergies or other needs.
              </HelperText>
              <FieldError message={errors.dietary} />
            </Field>

            <Field>
              <FieldLabel htmlFor="accessibility">
                Accessibility needs
              </FieldLabel>
              <Textarea
                id="accessibility"
                value={form.accessibility}
                onChange={(v) => set("accessibility", v)}
                placeholder="Let us know how we can best support you (optional)"
                rows={3}
              />
            </Field>
          </FormSection>

          {divider}

          {/* ── Section 3 ──────────────────────────────────────────── */}
          <FormSection number="03" title="Tell us about you">
            <Field>
              <div id="firstHackathon-label">
                <FieldLabel htmlFor="firstHackathon" required>
                  Is this your first hackathon?
                </FieldLabel>
              </div>
              <YesNoToggle
                id="firstHackathon"
                value={form.firstHackathon}
                onChange={(v) => set("firstHackathon", v)}
                error={errors.firstHackathon}
              />
              <FieldError message={errors.firstHackathon} />
            </Field>

            <Field>
              <div id="csCareer-label">
                <FieldLabel htmlFor="csCareer" required>
                  Is Computer Science the main focus of your career?
                </FieldLabel>
              </div>
              <YesNoToggle
                id="csCareer"
                value={form.csCareer}
                onChange={(v) => set("csCareer", v)}
                error={errors.csCareer}
              />
              <FieldError message={errors.csCareer} />
            </Field>

            <Field>
              <FieldLabel htmlFor="motivation" required>
                What kind of experience, skill, or knowledge do you wish to gain
                from MuslimHacks, and why is it important to you?
              </FieldLabel>
              <Textarea
                id="motivation"
                value={form.motivation}
                onChange={(v) => set("motivation", v)}
                placeholder="Share your niyyah — what brought you here and what you hope to carry away..."
                rows={5}
                error={errors.motivation}
              />
              <FieldError message={errors.motivation} />
            </Field>

            <Field>
              <FieldLabel htmlFor="pastProject" required>
                Please briefly describe a project you've done in the past.
              </FieldLabel>
              <Textarea
                id="pastProject"
                value={form.pastProject}
                onChange={(v) => set("pastProject", v)}
                placeholder="It doesn't have to be technical — a community project counts too..."
                rows={4}
                error={errors.pastProject}
              />
              <HelperText>Skill level doesn't matter.</HelperText>
              <FieldError message={errors.pastProject} />
            </Field>

            <Field>
              <FieldLabel htmlFor="interests" required>
                What kind of challenges and tasks are you most interested in?
              </FieldLabel>
              <Textarea
                id="interests"
                value={form.interests}
                onChange={(v) => set("interests", v)}
                placeholder="e.g. front-end, data, hardware, design, community outreach..."
                rows={3}
                error={errors.interests}
              />
              <FieldError message={errors.interests} />
            </Field>

            <Field>
              <FieldLabel htmlFor="community">
                Have you ever contributed or volunteered in the Muslim
                community? If so, how?
              </FieldLabel>
              <Textarea
                id="community"
                value={form.community}
                onChange={(v) => set("community", v)}
                placeholder="Mosque volunteering, community events, online spaces — anything counts (optional)"
                rows={3}
              />
            </Field>
          </FormSection>

          {/* ── Submit ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-full font-sans text-sm font-semibold uppercase tracking-[0.18em] transition-all duration-200 hover:brightness-110 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
                color: BRAND.navyDeep,
                boxShadow: "0 8px 30px rgba(221,168,83,0.28)",
              }}
            >
              {submitting ? "Submitting..." : "Submit application"}
            </button>

            {submitError && (
              <p
                className="text-center font-sans text-sm flex items-center justify-center gap-1"
                style={{ color: "#C45B5B" }}
              >
                <AlertCircle size={14} />
                {submitError}
              </p>
            )}

            <p
              className="text-center font-intimate text-sm"
              style={{ fontStyle: "italic", color: BRAND.sand }}
            >
              We'll email you a confirmation once you submit.
            </p>

            {submitAttempted && Object.keys(errors).length > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-lg font-sans text-sm"
                style={{
                  background: "rgba(196,91,91,0.12)",
                  border: "1px solid rgba(196,91,91,0.3)",
                  color: "#E88",
                }}
              >
                <AlertCircle size={15} className="shrink-0" />
                Please fill in all required fields before submitting.
              </div>
            )}
          </div>
        </form>
      </main>

      <Footer/>
    </div>
  );
}
