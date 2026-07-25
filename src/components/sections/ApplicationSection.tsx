import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, CheckCircle2, AlertCircle, LogOut } from "lucide-react";
import NotFound from "../../pages/NotFound";
import { BRAND, StarPattern, GoldText, Eyebrow, GLOBAL_CSS } from "../Shared";
import muslimHacksLogo from "../../assets/muslimhacks-gradient.svg";
import Footer from "../ui/footer";
import { toast } from "sonner";
import { Application, ApplicationForm } from "@/types/application";
import {
  saveApplicationV2,
  fetchMyApplication,
  fetchMyResumeFile,
  ApiError,
  toFormValuesV2,
} from "@/lib/api";
import Profile from "../ui/profile";
import { useUser } from "@clerk/clerk-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Errors {
  [key: string]: string;
}

const EMPTY_FORM: ApplicationForm = {
  fullName: "",
  phone: "",
  gender: "",
  institution: "",
  github: "",
  linkedin: "",
  resumeFile: null,
  dietary: "",
  accessibility: "",
  firstHackathon: null,
  hackathonCount: null,
  csCareer: null,
  motivation: "",
  pastProject: "",
  interests: "",
  community: "",
};

// Required fields for progress calculation
const REQUIRED_FIELDS: (keyof ApplicationForm)[] = [
  "fullName",
  "phone",
  "gender",
  "institution",
  "dietary",
  "firstHackathon",
  "csCareer",
  "motivation",
  "pastProject",
  "interests",
  "community",
];

function isValidGithubUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    if (host !== "github.com") return false;
    const parts = url.pathname.split("/").filter(Boolean);
    return parts.length >= 1 && parts[0].toLowerCase() !== "settings";
  } catch {
    return false;
  }
}

function isValidLinkedinUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    if (host !== "linkedin.com") return false;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return false;
    const kind = parts[0].toLowerCase();
    if (kind === "in" || kind === "pub") return Boolean(parts[1]);
    if (kind === "mwlite") return parts[1]?.toLowerCase() === "in" && Boolean(parts[2]);
    return false;
  } catch {
    return false;
  }
}

function calcProgress(form: ApplicationForm): number {
  const keys = [...REQUIRED_FIELDS];
  if (form.firstHackathon === false) {
    keys.push("hackathonCount");
  }
  const filled = keys.filter((k) => {
    const v = form[k];
    if (v === null || v === undefined) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (v instanceof File) return true;
    if (typeof v === "boolean") return true;
    if (typeof v === "number") return v >= 1;
    return false;
  });
  return Math.round((filled.length / keys.length) * 100);
}

function validate(form: ApplicationForm): Errors {
  const e: Errors = {};
  if (!form.fullName.trim()) e.fullName = "Full name is required.";
  if (!form.phone) e.phone = "Phone number is required.";
  else {
    const digits = form.phone.replace(/[^\d+]/g, "");
    const digitCount = digits.replace(/\D/g, "").length;
    if (digitCount < 7) e.phone = "Phone number is too short.";
    else if (digitCount > 15) e.phone = "Phone number is too long.";
  }
  if (!form.gender.trim()) e.gender = "Select Male or Female.";
  else if (form.gender !== "male" && form.gender !== "female") {
    e.gender = "Select Male or Female.";
  }
  if (!form.institution.trim()) e.institution = "School / university is required.";
  if (form.github.trim() && !isValidGithubUrl(form.github)) {
    e.github = "Use a link like github.com/yourusername.";
  }
  if (form.linkedin.trim() && !isValidLinkedinUrl(form.linkedin)) {
    e.linkedin = "Use a link like linkedin.com/in/yourname.";
  }
  if (!form.dietary.trim())
    e.dietary = "Dietary info is required (put none if nothing).";
  if (form.firstHackathon === null)
    e.firstHackathon = "Select yes or no.";
  if (form.firstHackathon === false) {
    if (form.hackathonCount == null || form.hackathonCount < 1) {
      e.hackathonCount = "Enter how many hackathons you've done.";
    }
  }
  if (form.csCareer === null) e.csCareer = "Select yes or no.";
  if (!form.motivation.trim()) e.motivation = "This field is required.";
  if (!form.pastProject.trim())
    e.pastProject = "This field is required.";
  if (!form.interests.trim()) e.interests = "This field is required.";
  if (!form.community.trim()) e.community = "This field is required.";
  return e;
}

function toApplicationPayload(form: ApplicationForm): ApplicationForm {
  return {
    fullName: form.fullName,
    phone: form.phone.replace(/[^\d+]/g, ""),
    gender: form.gender,
    institution: form.institution,
    github: form.github,
    linkedin: form.linkedin,
    resumeFile: form.resumeFile,
    dietary: form.dietary,
    accessibility: form.accessibility,
    firstHackathon: form.firstHackathon,
    hackathonCount: form.firstHackathon === false ? form.hackathonCount : null,
    csCareer: form.csCareer,
    motivation: form.motivation,
    pastProject: form.pastProject,
    interests: form.interests,
    community: form.community,
  };
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
      className="font-intimate text-lg sm:text-xl leading-snug"
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
  type = "text",
  error,
}: {
  id: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  type?: string;
  error?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 font-sans text-sm focus-visible:ring-2 focus-visible:ring-offset-1"
      style={
        readOnly
          ? { ...inputBase, opacity: 0.6, cursor: "not-allowed" }
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
  readOnly,
  error,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
  error?: string;
}) {
  return (
    <textarea
      id={id}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 font-sans text-sm resize-y focus-visible:ring-2 focus-visible:ring-offset-1"
      style={
        readOnly
          ? { ...inputBase, opacity: 0.6, cursor: "not-allowed" }
          : error
          ? inputError
          : inputBase
      }
    />
  );
}

// ─── Yes/No toggle ────────────────────────────────────────────────────────────
function YesNoToggle({
  id,
  value,
  onChange,
  readOnly,
  error,
}: {
  id: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  readOnly?: boolean;
  error?: string;
}) {
  return (
    <div
      id={id}
      className="flex gap-3"
      role="group"
      aria-labelledby={`${id}-label`}
    >
      {([true, false] as const).map((opt) => (
        <button
          key={String(opt)}
          type="button"
          onClick={() => !readOnly && onChange(opt)}
          disabled={readOnly}
          className="px-6 py-2.5 rounded-full font-sans text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-pressed={value === opt}
          style={
            value === opt
              ? {
                  background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
                  color: BRAND.navyDeep,
                  border: "none",
                  boxShadow: "0 4px 16px rgba(221,168,83,0.22)",
                  opacity: readOnly ? 0.6 : 1,
                  cursor: readOnly ? "default" : undefined,
                }
              : {
                  background: "rgba(245,238,227,0.07)",
                  border: error
                    ? `1px solid rgba(196,91,91,0.5)`
                    : `1px solid rgba(221,168,83,0.2)`,
                  color: BRAND.creamMuted,
                  opacity: readOnly ? 0.6 : 1,
                  cursor: readOnly ? "default" : undefined,
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
  readOnly,
  error,
}: {
  id?: string;
  value: File | null;
  onChange: (f: File | null) => void;
  readOnly?: boolean;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function handleFile(file: File) {
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("Resume must be a PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume must be 5 MB or smaller.");
      return;
    }
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
        {!readOnly && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="p-1 rounded hover:opacity-70 transition-opacity focus-visible:ring-2"
            aria-label="Remove file"
            style={{ color: BRAND.gold }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        id={id}
        className="relative flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-lg transition-all duration-200"
        style={{
          background: dragging
            ? "rgba(221,168,83,0.08)"
            : "rgba(245,238,227,0.04)",
          border: error
            ? `1px dashed rgba(196,91,91,0.5)`
            : dragging
            ? `1px dashed ${BRAND.gold}`
            : `1px dashed rgba(221,168,83,0.28)`,
          cursor: readOnly ? "default" : "pointer",
          opacity: readOnly ? 0.6 : 1,
        }}
        onDragOver={(e) => {
          if (readOnly) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={readOnly ? undefined : onDrop}
        onClick={() => !readOnly && inputRef.current?.click()}
        role={readOnly ? undefined : "button"}
        tabIndex={readOnly ? undefined : 0}
        onKeyDown={(e) => !readOnly && e.key === "Enter" && inputRef.current?.click()}
        aria-label={readOnly ? undefined : "Upload resume"}
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
            PDF only · max 5 MB
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
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
  const [form, setForm] = useState<ApplicationForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplicationFilled, setIsApplicationFilled] = useState(false);

  const progress = calcProgress(form);

  function set<K extends keyof ApplicationForm>(
    key: K,
    value: ApplicationForm[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    if (submitAttempted && errors[key as string]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key as string];
        return next;
      });
    }
  }

  const readOnly =
    application?.status === "approved" || application?.status === "rejected";

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchMyApplication();
        setApplication(data.application);
        const values = toFormValuesV2(data.application) ?? EMPTY_FORM;

        if (data.application?.resume_key || data.application?.resume_url) {
          try {
            const resumeFile = await fetchMyResumeFile();
            if (resumeFile) {
              values.resumeFile = resumeFile;
            }
          } catch {
            // Keep form usable even if resume download fails
          }
        }

        setForm(values);
        if (data.application) {
          setIsApplicationFilled(true);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setApplication(null);
          const clerkName = [clerkUser?.firstName, clerkUser?.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
          setForm({
            ...EMPTY_FORM,
            fullName: clerkName || EMPTY_FORM.fullName,
          });
        } else {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Failed to load application"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerkUser?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    const errs = validate(form);
    setErrors(errs);
    // scrolling works sometimes need more time to fix this
    // if (Object.keys(errs).length > 0) {
    //   const firstKey = Object.keys(errs)[0];
    //   requestAnimationFrame(() => {
    //     document.getElementById(firstKey)?.scrollIntoView({
    //       behavior: "smooth",
    //       block: "center",
    //     });
    //   });
    //   return;
    // }
    if (Object.keys(errs).length > 0) {
      setSubmitAttempted(false);
      return;}

    const applicationFormPayload = toApplicationPayload(form);
    try {
      const data = await saveApplicationV2(applicationFormPayload);
      setApplication(data.application);
      toast.success("Application submitted! We'll be in touch soon.");
      setForm(toFormValuesV2(data.application) || EMPTY_FORM); //reset form
      setErrors({});
      setSubmitAttempted(false);
      navigate("/apply/submitted");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(
          "There was an error submitting your application. Please try again."
        );
      }
    }
  }

  const divider = (
    <div
      className="border-t my-2"
      style={{ borderColor: "rgba(221,168,83,0.12)" }}
    />
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading application...
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
        <div className="w-100 px-6 py-4 flex items-center justify-between">
          <span
            className="font-sans text-xs tabular-nums"
            style={{ color: BRAND.sand }}
          >
            {progress}% complete
          </span>
          <div className="flex items-center gap-3">
            <Profile/>
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
              This should take about 10 minutes.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="fullName" required>
                  Full Name
                </FieldLabel>
                <TextInput
                  id="fullName"
                  value={form.fullName}
                  onChange={(v) => set("fullName", v)}
                  placeholder="Your full name"
                  readOnly={readOnly}
                  error={errors.fullName}
                />
                <FieldError message={errors.fullName} />
              </Field>

              <Field>
                <FieldLabel htmlFor="phone" required>
                  Phone Number
                </FieldLabel>
                <TextInput
                  id="phone"
                  type="tel"
                  value={form.phone || ""}
                  onChange={(v) => {
                    set("phone", v);
                  }}
                  placeholder="+1 (xxx) xxx-xxxx"
                  readOnly={readOnly}
                  error={errors.phone}
                />
                <FieldError message={errors.phone} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="gender" required>
                  Gender
                </FieldLabel>
                <select
                  id="gender"
                  value={form.gender}
                  disabled={readOnly}
                  onChange={(e) => set("gender", e.target.value)}
                  className="w-full px-4 py-3 font-sans text-sm focus-visible:ring-2 focus-visible:ring-offset-1 appearance-none"
                  style={
                    {
                      ...inputBase,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9BBA8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 14px center",
                      color: form.gender ? BRAND.cream : BRAND.sand,
                      opacity: readOnly ? 0.6 : 1,
                      cursor: readOnly ? "default" : undefined,
                    } as React.CSSProperties
                  }
                >
                  <option value="" disabled style={{ background: BRAND.navy }}>
                    Select your gender
                  </option>
                  <option value="male" style={{ background: BRAND.navy }}>
                    Male
                  </option>
                  <option value="female" style={{ background: BRAND.navy }}>
                    Female
                  </option>
                </select>
                <HelperText>
                  For rooming and prayer spaces.
                </HelperText>
                <FieldError message={errors.gender} />
              </Field>

              <Field>
                <FieldLabel htmlFor="institution" required>
                  School / university
                </FieldLabel>
                <TextInput
                  id="institution"
                  value={form.institution}
                  onChange={(v) => set("institution", v)}
                  placeholder="e.g. Concordia University"
                  readOnly={readOnly}
                  error={errors.institution}
                />
                <FieldError message={errors.institution} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="linkedin">LinkedIn</FieldLabel>
                <TextInput
                  id="linkedin"
                  value={form.linkedin}
                  onChange={(v) => set("linkedin", v)}
                  placeholder="linkedin.com/in/yourname"
                  readOnly={readOnly}
                  error={errors.linkedin}
                />
                <HelperText>Optional but recommended for recruiters.</HelperText>
                <FieldError message={errors.linkedin} />
              </Field>

              <Field>
                <FieldLabel htmlFor="github">GitHub</FieldLabel>
                <TextInput
                  id="github"
                  value={form.github}
                  onChange={(v) => set("github", v)}
                  placeholder="github.com/yourusername"
                  readOnly={readOnly}
                  error={errors.github}
                />
                <HelperText>Optional but recommended for recruiters.</HelperText>
                <FieldError message={errors.github} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="resumeFile">Resume / CV</FieldLabel>
              <ResumeUpload
                id="resumeFile"
                value={form.resumeFile}
                onChange={(f) => set("resumeFile", f)}
                readOnly={readOnly}
                error={errors.resumeFile}
              />
              <HelperText>
                Optional but recommended for recruiters. PDF only.
              </HelperText>
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
                readOnly={readOnly}
                error={errors.dietary}
              />
              <HelperText>
                All food is already halal. Just tell us about allergies or anything else.
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
                placeholder="Optional"
                rows={3}
                readOnly={readOnly}
              />
            </Field>
          </FormSection>

          {divider}

          {/* ── Section 3 ──────────────────────────────────────────── */}
          <FormSection number="03" title="Tell us about you">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <div id="firstHackathon-label">
                  <FieldLabel htmlFor="firstHackathon" required>
                    Is this your first hackathon?
                  </FieldLabel>
                </div>
                <YesNoToggle
                  id="firstHackathon"
                  value={form.firstHackathon}
                  onChange={(v) => {
                    set("firstHackathon", v);
                    if (v === true) set("hackathonCount", null);
                  }}
                  readOnly={readOnly}
                  error={errors.firstHackathon}
                />
                <FieldError message={errors.firstHackathon} />
              </Field>

              <Field>
                <div id="csCareer-label">
                  <FieldLabel htmlFor="csCareer" required>
                    Are you studying or going into tech / CS?
                  </FieldLabel>
                </div>
                <YesNoToggle
                  id="csCareer"
                  value={form.csCareer}
                  onChange={(v) => set("csCareer", v)}
                  readOnly={readOnly}
                  error={errors.csCareer}
                />
                <HelperText>Beginners and non-CS majors are welcome.</HelperText>
                <FieldError message={errors.csCareer} />
              </Field>
            </div>

            {form.firstHackathon === false && (
              <Field>
                <FieldLabel htmlFor="hackathonCount" required>
                  About how many hackathons have you done before?
                </FieldLabel>
                <TextInput
                  id="hackathonCount"
                  type="number"
                  value={form.hackathonCount == null ? "" : String(form.hackathonCount)}
                  onChange={(v) => {
                    const n = Number(v);
                    set("hackathonCount", Number.isInteger(n) && n >= 1 ? n : null);
                  }}
                  placeholder="e.g. 2"
                  readOnly={readOnly}
                  error={errors.hackathonCount}
                />
                <FieldError message={errors.hackathonCount} />
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="motivation" required>
                Why do you want to attend MuslimHacks? What are you hoping to
                learn, build, or contribute?
              </FieldLabel>
              <Textarea
                id="motivation"
                value={form.motivation}
                onChange={(v) => set("motivation", v)}
                placeholder="Be honest. A few sentences is enough."
                rows={5}
                readOnly={readOnly}
                error={errors.motivation}
              />
              <FieldError message={errors.motivation} />
            </Field>

            <Field>
              <FieldLabel htmlFor="pastProject" required>
                Tell us about something you're proud of accomplishing. What was
                it, and why is it meaningful to you?
              </FieldLabel>
              <Textarea
                id="pastProject"
                value={form.pastProject}
                onChange={(v) => set("pastProject", v)}
                placeholder="School, work, personal, volunteering — anything that matters to you."
                rows={4}
                readOnly={readOnly}
                error={errors.pastProject}
              />
              <FieldError message={errors.pastProject} />
            </Field>

            <Field>
              <FieldLabel htmlFor="interests" required>
                If you had the opportunity to build something that benefits the
                Ummah, what would you build, and why?
              </FieldLabel>
              <Textarea
                id="interests"
                value={form.interests}
                onChange={(v) => set("interests", v)}
                placeholder="An idea, a problem you'd solve, or a direction you'd explore."
                rows={4}
                readOnly={readOnly}
                error={errors.interests}
              />
              <FieldError message={errors.interests} />
            </Field>

            <Field>
              <FieldLabel htmlFor="community" required>
                Have you volunteered or contributed to your community? Tell us
                about it.
              </FieldLabel>
              <Textarea
                id="community"
                value={form.community}
                onChange={(v) => set("community", v)}
                placeholder="Mosque, school, events, online, neighborhood — whatever you've done."
                rows={3}
                readOnly={readOnly}
                error={errors.community}
              />
              <FieldError message={errors.community} />
            </Field>
          </FormSection>

          {/* ── Submit ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {!readOnly && (
              <>
                <button
                  type="submit"
                  className="w-full py-4 rounded-full font-sans text-sm font-semibold uppercase tracking-[0.18em] transition-all duration-200 hover:brightness-110 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
                    color: BRAND.navyDeep,
                    boxShadow: "0 8px 30px rgba(221,168,83,0.28)",
                  }}
                  disabled={submitAttempted}
                >
                  {submitAttempted ? "Submitting..." : application ? "Update application" : "Submit application"}
                </button>

                <p
                  className="text-center font-intimate text-sm"
                  style={{ fontStyle: "italic", color: BRAND.sand }}
                >
                  We'll email you a confirmation once you submit.
                </p>
              </>
            )}

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
                Fill in the required fields first.
              </div>
            )}
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
