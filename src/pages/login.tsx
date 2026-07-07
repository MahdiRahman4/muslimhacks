import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";
import {
  BRAND,
  StarPattern,
  GoldText,
  Eyebrow,
  GLOBAL_CSS,
} from "../components/Shared";
import googleGLogo from "../assets/google-G-logo.svg";
import Footer from "@/components/ui/footer";

// ─── Field components ─────────────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  background: "rgba(245,238,227,0.06)",
  border: `1px solid rgba(221,168,83,0.22)`,
  color: BRAND.cream,
  borderRadius: "8px",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s",
};

const inputErr: React.CSSProperties = {
  ...inputBase,
  border: `1px solid rgba(196,91,91,0.65)`,
};

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p
      className="flex items-center gap-1.5 font-sans text-xs"
      style={{ color: "#E07070" }}
    >
      <AlertCircle size={12} className="shrink-0" />
      {msg}
    </p>
  );
}

function EmailField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="login-email"
        className="font-sans text-xs uppercase tracking-[0.18em] font-medium"
        style={{ color: BRAND.sand }}
      >
        Email
      </label>
      <input
        id="login-email"
        type="email"
        autoComplete="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="you@example.com"
        className="px-4 py-3 font-sans text-sm focus-visible:ring-2 focus-visible:ring-offset-1"
        style={error ? inputErr : inputBase}
      />
      <FieldError msg={error} />
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-sans text-xs uppercase tracking-[0.18em] font-medium"
        style={{ color: BRAND.sand }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-3 pr-11 font-sans text-sm focus-visible:ring-2 focus-visible:ring-offset-1"
          style={error ? inputErr : inputBase}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded focus-visible:ring-2 hover:opacity-70 transition-opacity"
          aria-label={show ? "Hide password" : "Show password"}
          style={{ color: BRAND.sand }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <FieldError msg={error} />
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex-1 h-px"
        style={{ background: "rgba(221,168,83,0.15)" }}
      />
      <span
        className="font-sans text-xs uppercase tracking-[0.2em] shrink-0"
        style={{ color: BRAND.sand }}
      >
        or continue with email
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: "rgba(221,168,83,0.15)" }}
      />
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    ? ""
    : "Please enter a valid email address.";
}
function validatePassword(v: string) {
  return v.length >= 8 ? "" : "Password must be at least 8 characters.";
}
function validateConfirm(pw: string, confirm: string) {
  return pw === confirm ? "" : "Passwords don't match.";
}

// ─── Login page ───────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleMode() {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setErrors({});
    setPassword("");
    setConfirm("");
  }

  // Placeholder — wire to real auth
  function handleGoogle() {
    setGoogleLoading(true);
    setTimeout(() => {
      setGoogleLoading(false);
      navigate("/apply");
    }, 1200);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    const emailErr = validateEmail(email);
    if (emailErr) next.email = emailErr;
    const pwErr = validatePassword(password);
    if (pwErr) next.password = pwErr;
    if (mode === "signup") {
      const confirmErr = validateConfirm(password, confirm);
      if (confirmErr) next.confirm = confirmErr;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // Placeholder — wire to real auth
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/apply");
    }, 1200);
  }

  const isSignUp = mode === "signup";

  return (
    <div
      className="min-h-screen font-sans flex flex-col relative"
      style={{
        background: `linear-gradient(160deg, ${BRAND.purpleDeep} 0%, ${BRAND.navy} 55%, ${BRAND.navyDeep} 100%)`,
        color: BRAND.cream,
      }}
    >
      <style>{GLOBAL_CSS}</style>

      {/* Star field */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <StarPattern opacity={0.05} />
      </div>

      {/* Bismillah watermark */}
      <div
        className="fixed right-0 top-1/2 pointer-events-none select-none hidden lg:block"
        style={{
          fontSize: "clamp(16rem, 22vw, 24rem)",
          lineHeight: 1,
          color: BRAND.gold,
          opacity: 0.04,
          fontFamily: "'Amiri', serif",
          direction: "rtl",
          transform: "translateY(-50%) translateX(22%)",
        }}
        aria-hidden="true"
      >
        بسم الله
      </div>

      {/* Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md flex flex-col gap-8">
          {/* Heading */}
          <div className="flex flex-col gap-3">
            <div className="flex align-center justify-between">
              <Eyebrow>Welcome</Eyebrow>
              <div>

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
            <h1
              className="font-display font-black leading-tight"
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                letterSpacing: "-0.02em",
                color: BRAND.cream,
              }}
            >
              Sign in <GoldText>to apply</GoldText>
            </h1>
            <p
              className="font-intimate text-lg"
              style={{ fontStyle: "italic", color: BRAND.creamMuted }}
            >
              One account to apply and track your status.
            </p>
          </div>

          {/* Card surface */}
          <div
            className="flex flex-col gap-6 rounded-2xl px-7 py-8"
            style={{
              background: "rgba(245,238,227,0.04)",
              border: "1px solid rgba(221,168,83,0.14)",
              boxShadow: "0 24px 60px rgba(6,15,32,0.5)",
            }}
          >
            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-full font-sans text-sm font-semibold transition-all duration-200 hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "#FFFFFF",
                color: "#1A1426",
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              }}
            >
              {googleLoading ? (
                <span className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
              ) : (
                <img
                  src={googleGLogo}
                  alt="Google logo"
                  className="h-7 w-auto object-contain"
                />
              )}
              {googleLoading ? "Signing in…" : "Continue with Google"}
            </button>

            <Divider />

            {/* Email form */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-4"
            >
              <EmailField
                value={email}
                onChange={setEmail}
                error={errors.email}
              />

              <PasswordField
                id="login-password"
                label="Password"
                value={password}
                onChange={setPassword}
                error={errors.password}
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />

              {isSignUp && (
                <PasswordField
                  id="login-confirm"
                  label="Confirm password"
                  value={confirm}
                  onChange={setConfirm}
                  error={errors.confirm}
                  autoComplete="new-password"
                />
              )}

              {!isSignUp && (
                <div className="flex justify-end -mt-1">
                  <button
                    type="button"
                    className="font-sans text-xs hover:opacity-70 transition-opacity focus-visible:ring-2 rounded"
                    style={{ color: BRAND.purpleLight }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full mt-1 py-3.5 rounded-full font-sans text-sm font-semibold uppercase tracking-[0.18em] transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
                  color: BRAND.navyDeep,
                  boxShadow:
                    "0 0 18px rgba(221,168,83,0.35), 0 4px 16px rgba(221,168,83,0.2)",
                }}
              >
                {loading ? (
                  <>
                    <span
                      className="w-4 h-4 rounded-full border-2 animate-spin"
                      style={{
                        borderColor: `${BRAND.navyDeep}40`,
                        borderTopColor: BRAND.navyDeep,
                      }}
                    />
                    {isSignUp ? "Creating account…" : "Signing in…"}
                  </>
                ) : isSignUp ? (
                  "Create account"
                ) : (
                  "Continue"
                )}
              </button>
            </form>

            {/* Mode toggle */}
            <p
              className="text-center font-sans text-sm"
              style={{ color: BRAND.sand }}
            >
              {isSignUp ? "Already have an account?" : "New here?"}{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium underline underline-offset-2 hover:opacity-80 transition-opacity focus-visible:ring-2 rounded"
                style={{ color: BRAND.purpleLight }}
              >
                {isSignUp ? "Sign in" : "Create an account"}
              </button>
            </p>
          </div>

          {/* Footer note */}
          <p
            className="text-center font-sans text-xs leading-relaxed px-4"
            style={{ color: "rgba(201,187,168,0.55)" }}
          >
            By continuing, you agree to the MuslimHacks{" "}
            <button
              type="button"
              className="underline underline-offset-2 hover:opacity-80 transition-opacity focus-visible:ring-2 rounded"
            >
              code of conduct
            </button>
            .
          </p>
        </div>
      </main>

      <Footer/>
    </div>
  );
}
