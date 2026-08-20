import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, CheckCircle2, AlertCircle, LogOut, Clock, ChevronDown } from "lucide-react";
import { BRAND, StarPattern, GoldText, Eyebrow, GLOBAL_CSS, LoadingScreen } from "../Shared";
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
import { useI18n } from "@/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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
  "gender",
  "institution",
  "dietary",
  "firstHackathon",
  "csCareer",
  "motivation",
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

function validate(
  form: ApplicationForm,
  t: (path: string) => string,
): Errors {
  const e: Errors = {};
  if (!form.fullName.trim()) e.fullName = t("apply.errFullName");
  if (form.phone) {
    const digitCount = form.phone.replace(/\D/g, "").length;
    if (digitCount === 0) {
      e.phone = t("apply.errPhoneDigits");
    } else if (/[a-zA-Z]/.test(form.phone)) {
      e.phone = t("apply.errPhoneLetters");
    } else if (digitCount < 7) {
      e.phone = t("apply.errPhoneShort");
    } else if (digitCount > 15) {
      e.phone = t("apply.errPhoneLong");
    }
  }
  if (!form.gender.trim()) e.gender = t("apply.errGender");
  else if (form.gender !== "male" && form.gender !== "female") {
    e.gender = t("apply.errGender");
  }
  if (!form.institution.trim()) e.institution = t("apply.errSchool");
  if (form.github.trim() && !isValidGithubUrl(form.github)) {
    e.github = t("apply.errGithub");
  }
  if (form.linkedin.trim() && !isValidLinkedinUrl(form.linkedin)) {
    e.linkedin = t("apply.errLinkedin");
  }
  if (!form.dietary.trim())
    e.dietary = t("apply.errDietary");
  if (form.firstHackathon === null)
    e.firstHackathon = t("apply.errYesNo");
  if (form.firstHackathon === false) {
    if (form.hackathonCount == null || form.hackathonCount < 1) {
      e.hackathonCount = t("apply.errHackathonCount");
    }
  }
  if (form.csCareer === null) e.csCareer = t("apply.errYesNo");
  if (!form.motivation.trim()) e.motivation = t("apply.errRequired");
  return e;
}

const VALIDATION_FIELD_ORDER: (keyof ApplicationForm)[] = [
  "fullName",
  "phone",
  "gender",
  "institution",
  "github",
  "linkedin",
  "resumeFile",
  "dietary",
  "firstHackathon",
  "hackathonCount",
  "csCareer",
  "motivation",
  "pastProject",
  "interests",
  "community",
];

function scrollToFirstError(errs: Errors) {
  const firstKey = VALIDATION_FIELD_ORDER.find((key) => errs[key]);
  if (!firstKey) return;

  window.setTimeout(() => {
    const el =
      document.getElementById(firstKey) ??
      document.getElementById(`${firstKey}-label`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (el instanceof HTMLElement && typeof el.focus === "function") {
      el.focus({ preventScroll: true });
    }
  }, 50);
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
    pastProject: form.pastProject || "This is a placeholder answer for the past project field.",
    interests: form.interests || "This is a placeholder answer for the interests field.",
    community: form.community || "This is a placeholder answer for the community field.",
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
      className="font-sans text-base sm:text-lg leading-snug font-medium"
      style={{ color: BRAND.cream }}
    >
      {children}
      {required && (
        <span
          className="ml-1 font-sans text-xs"
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
  const { t } = useI18n();
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
          {opt ? t("apply.yes") : t("apply.no")}
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
  const { t } = useI18n();
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
      toast.error(t("apply.resumePdf"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("apply.resumeSize"));
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
            aria-label={t("apply.removeFile")}
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
        aria-label={readOnly ? undefined : t("apply.uploadResume")}
      >
        <Upload size={24} style={{ color: BRAND.gold }} />
        <div className="text-center flex flex-col gap-1">
          <p
            className="font-sans text-sm font-medium"
            style={{ color: BRAND.cream }}
          >
            {t("apply.dragDrop")}{" "}
            <span
              style={{
                color: BRAND.gold,
                textDecoration: "underline",
              }}
            >
              {t("apply.browse")}
            </span>
          </p>
          <p className="font-sans text-xs" style={{ color: BRAND.sand }}>
            {t("apply.resumeHint")}
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
  collapsible,
  defaultOpen = true,
  forceOpen,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = collapsible ? open || forceOpen : true;

  const header = (
    <>
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
      {collapsible && (
        <ChevronDown
          size={22}
          className="ml-auto shrink-0"
          style={{
            color: BRAND.gold,
            transition: "transform 0.25s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-8">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={isOpen}
          className="flex items-baseline gap-4 w-full text-left focus-visible:ring-2 focus-visible:ring-offset-2 rounded-sm"
        >
          {header}
        </button>
      ) : (
        <div className="flex items-baseline gap-4">{header}</div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: collapsible ? "grid-template-rows 0.3s ease" : undefined,
        }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

// ─── Apply page ───────────────────────────────────────────────────────────────
export default function ApplicationSection() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();
  const [form, setForm] = useState<ApplicationForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplicationFilled, setIsApplicationFilled] = useState(false);

  const progress = calcProgress(form);

  function set<K extends keyof ApplicationForm>(
    key: K,
    value: ApplicationForm[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    if (showValidationAlert && errors[key as string]) {
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
    if (showValidationAlert) {
      setErrors(validate(form, t));
    }
    // Re-translate existing validation errors when language changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, t]);

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
              : t("apply.loadFailed")
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
    const errs = validate(form, t);
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      setShowValidationAlert(true);
      scrollToFirstError(errs);
      return;
    }

    setShowValidationAlert(false);
    setIsSubmitting(true);

    const applicationFormPayload = toApplicationPayload(form);
    try {
      const data = await saveApplicationV2(applicationFormPayload);
      setApplication(data.application);
      toast.success(t("apply.submitted"));
      setForm(toFormValuesV2(data.application) || EMPTY_FORM);
      setErrors({});
      navigate("/apply/submitted");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(
          t("apply.submitError")
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const divider = (
    <div
      className="border-t my-2"
      style={{ borderColor: "rgba(221,168,83,0.12)" }}
    />
  );

  const hasError = (fields: (keyof ApplicationForm)[]) =>
    showValidationAlert && fields.some((f) => errors[f as string]);
  const section1HasError = hasError([
    "fullName",
    "phone",
    "gender",
    "institution",
    "github",
    "linkedin",
    "resumeFile",
  ]);
  const section2HasError = hasError(["dietary", "accessibility"]);
  const section3HasError = hasError([
    "firstHackathon",
    "hackathonCount",
    "csCareer",
    "motivation",
  ]);

  if (loading) {
    return <LoadingScreen message={t("apply.loading")} />;
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
      {/* <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <StarPattern opacity={0.04} />
      </div> */}

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
            {t("apply.progress", { n: progress })}
          </span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
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
            <Eyebrow>{t("apply.eyebrow")}</Eyebrow>
            <h1
              className="font-display font-black leading-tight"
              style={{
                fontSize: "clamp(2.75rem, 7vw, 5rem)",
                letterSpacing: "-0.02em",
                color: BRAND.cream,
              }}
            >
              {t("apply.headingBefore")}<GoldText>{t("apply.headingGold")}</GoldText>
            </h1>
            <p
              className="font-intimate text-xl leading-relaxed flex items-center gap-2"
              style={{
                fontStyle: "normal",
                color: BRAND.creamMuted,
              }}
            >
              <Clock size={20} style={{ color: BRAND.gold }} />
              {t("apply.timeEstimate")}
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

        {showValidationAlert && Object.keys(errors).length > 0 && (
          <div
            role="alert"
            className="sticky top-[73px] z-40 mb-8 flex gap-3 px-5 py-4 rounded-xl font-sans text-sm"
            style={{
              background: "rgba(196,91,91,0.15)",
              border: "1px solid rgba(196,91,91,0.4)",
              color: "#F4B4B4",
            }}
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2">
              <p className="font-semibold" style={{ color: BRAND.cream }}>
                {t("apply.fixBefore")}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                {Object.values(errors).map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-14"
        >
          {/* ── Section 1 ──────────────────────────────────────────── */}
          <FormSection
            number="01"
            title={t("apply.section1")}
            collapsible
            forceOpen={section1HasError}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="fullName" required>
                  {t("apply.fullName")}
                </FieldLabel>
                <TextInput
                  id="fullName"
                  value={form.fullName}
                  onChange={(v) => set("fullName", v)}
                  placeholder={t("apply.fullNamePlaceholder")}
                  readOnly={readOnly}
                  error={errors.fullName}
                />
                <FieldError message={errors.fullName} />
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">
                  {t("apply.phone")}
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
                <HelperText>{t("apply.phoneOptional")}</HelperText>
                <FieldError message={errors.phone} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="gender" required>
                  {t("apply.gender")}
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
                    {t("apply.genderSelect")}
                  </option>
                  <option value="male" style={{ background: BRAND.navy }}>
                    {t("apply.male")}
                  </option>
                  <option value="female" style={{ background: BRAND.navy }}>
                    {t("apply.female")}
                  </option>
                </select>
                <HelperText>
                  {t("apply.genderHelp")}
                </HelperText>
                <FieldError message={errors.gender} />
              </Field>

              <Field>
                <FieldLabel htmlFor="institution" required>
                  {t("apply.school")}
                </FieldLabel>
                <TextInput
                  id="institution"
                  value={form.institution}
                  onChange={(v) => set("institution", v)}
                  placeholder={t("apply.schoolPlaceholder")}
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
                <HelperText>{t("apply.linkedinHelp")}</HelperText>
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
                <HelperText>{t("apply.githubHelp")}</HelperText>
                <FieldError message={errors.github} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="resumeFile">{t("apply.resume")}</FieldLabel>
              <ResumeUpload
                id="resumeFile"
                value={form.resumeFile}
                onChange={(f) => set("resumeFile", f)}
                readOnly={readOnly}
                error={errors.resumeFile}
              />
              <HelperText>
                {t("apply.resumeHelp")}
              </HelperText>
              <FieldError message={errors.resumeFile} />
            </Field>
          </FormSection>

          {divider}

          {/* ── Section 2 ──────────────────────────────────────────── */}
          <FormSection
            number="02"
            title={t("apply.section2")}
            collapsible
            forceOpen={section2HasError}
          >
            <Field>
              <FieldLabel htmlFor="dietary" required>
                {t("apply.dietary")}
              </FieldLabel>
              <TextInput
                id="dietary"
                value={form.dietary}
                onChange={(v) => set("dietary", v)}
                placeholder={t("apply.dietaryPlaceholder")}
                readOnly={readOnly}
                error={errors.dietary}
              />
              <HelperText>
                {t("apply.dietaryHelp")}
              </HelperText>
              <FieldError message={errors.dietary} />
            </Field>

            <Field>
              <FieldLabel htmlFor="accessibility">
                {t("apply.accessibility")}
              </FieldLabel>
              <Textarea
                id="accessibility"
                value={form.accessibility}
                onChange={(v) => set("accessibility", v)}
                placeholder={t("apply.optional")}
                rows={3}
                readOnly={readOnly}
              />
            </Field>
          </FormSection>

          {divider}

          {/* ── Section 3 ──────────────────────────────────────────── */}
          <FormSection
            number="03"
            title={t("apply.section3")}
            collapsible
            forceOpen={section3HasError}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <div id="firstHackathon-label">
                  <FieldLabel htmlFor="firstHackathon" required>
                    {t("apply.firstHackathon")}
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
                    {t("apply.csCareer")}
                  </FieldLabel>
                </div>
                <YesNoToggle
                  id="csCareer"
                  value={form.csCareer}
                  onChange={(v) => set("csCareer", v)}
                  readOnly={readOnly}
                  error={errors.csCareer}
                />
                <HelperText>{t("apply.csHelp")}</HelperText>
                <FieldError message={errors.csCareer} />
              </Field>
            </div>

            {form.firstHackathon === false && (
              <Field>
                <FieldLabel htmlFor="hackathonCount" required>
                  {t("apply.hackathonCount")}
                </FieldLabel>
                <TextInput
                  id="hackathonCount"
                  type="number"
                  value={form.hackathonCount == null ? "" : String(form.hackathonCount)}
                  onChange={(v) => {
                    const n = Number(v);
                    set("hackathonCount", Number.isInteger(n) && n >= 1 ? n : null);
                  }}
                  placeholder={t("apply.hackathonCountPlaceholder")}
                  readOnly={readOnly}
                  error={errors.hackathonCount}
                />
                <FieldError message={errors.hackathonCount} />
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="motivation" required>
                {t("apply.motivation")}
              </FieldLabel>
              <Textarea
                id="motivation"
                value={form.motivation}
                onChange={(v) => set("motivation", v)}
                placeholder={t("apply.motivationPlaceholder")}
                rows={5}
                readOnly={readOnly}
                error={errors.motivation}
              />
              <FieldError message={errors.motivation} />
            </Field>
          </FormSection>

          {divider}

          {/* ── Section 4 ──────────────────────────────────────────── */}
          <FormSection
            number="04"
            title={t("apply.section4")}
            collapsible
            defaultOpen={false}
          >
            <Field>
              <FieldLabel htmlFor="pastProject">
                {t("apply.pastProject")}
              </FieldLabel>
              <Textarea
                id="pastProject"
                value={form.pastProject}
                onChange={(v) => set("pastProject", v)}
                placeholder={t("apply.pastProjectPlaceholder")}
                rows={4}
                readOnly={readOnly}
                error={errors.pastProject}
              />
              <FieldError message={errors.pastProject} />
            </Field>

            <Field>
              <FieldLabel htmlFor="interests">
                {t("apply.interests")}
              </FieldLabel>
              <Textarea
                id="interests"
                value={form.interests}
                onChange={(v) => set("interests", v)}
                placeholder={t("apply.interestsPlaceholder")}
                rows={4}
                readOnly={readOnly}
                error={errors.interests}
              />
              <FieldError message={errors.interests} />
            </Field>

            <Field>
              <FieldLabel htmlFor="community">
                {t("apply.community")}
              </FieldLabel>
              <Textarea
                id="community"
                value={form.community}
                onChange={(v) => set("community", v)}
                placeholder={t("apply.communityPlaceholder")}
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
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? t("apply.submitting")
                    : application
                      ? t("apply.update")
                      : t("apply.submit")}
                </button>

                <p
                  className="text-center font-intimate text-sm"
                  style={{ fontStyle: "italic", color: BRAND.sand }}
                >
                  {t("apply.confirmNote")}
                </p>
              </>
            )}
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
