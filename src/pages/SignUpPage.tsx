import { SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { BRAND, StarPattern, GLOBAL_CSS } from "../components/Shared";

const SignUpPage = () => (
  <div
    className="min-h-screen font-sans flex flex-col items-center justify-center relative px-4 py-12"
    style={{
      background: `linear-gradient(160deg, ${BRAND.purpleDeep} 0%, ${BRAND.navy} 55%, ${BRAND.navyDeep} 100%)`,
      color: BRAND.cream,
    }}
  >
    <style>{GLOBAL_CSS}</style>
    <style>{`
      .cl-formFieldInput:focus {
        border-color: ${BRAND.gold} !important;
        box-shadow: 0 0 0 2px rgba(221,168,83,0.18) !important;
        outline: none !important;
      }
      .cl-formFieldInput::placeholder {
        color: rgba(201,187,168,0.35);
      }
      .cl-socialButtonsBlockButton:hover {
        background: rgba(245,238,227,0.1) !important;
        border-color: rgba(221,168,83,0.4) !important;
      }
      .cl-formButtonPrimary:hover {
        filter: brightness(1.1);
      }
      .cl-footerActionLink:hover {
        color: ${BRAND.goldSoft} !important;
        text-decoration: underline;
      }
      .cl-backLink:hover {
        color: ${BRAND.goldSoft} !important;
      }
    `}</style>

    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <StarPattern opacity={0.04} />
    </div>

    {/* Bismillah watermark */}
    <div
      className="fixed right-0 top-1/2 pointer-events-none select-none hidden lg:block"
      style={{
        fontSize: "clamp(16rem, 22vw, 24rem)",
        lineHeight: 1,
        color: BRAND.gold,
        opacity: 0.03,
        fontFamily: "'Amiri', serif",
        direction: "rtl",
        transform: "translateY(-50%) translateX(22%)",
      }}
      aria-hidden="true"
    >
      بسم الله
    </div>

    <div className="relative z-10 w-full max-w-md flex flex-col gap-6">
      <SignUp
        forceRedirectUrl="/apply"
        signInUrl="/signin"
        // First + last name must be Required in Clerk Dashboard
        // (User & authentication → Email, phone, username → Name)
      />
      <p className="text-center font-sans text-xs" style={{ color: BRAND.sand }}>
        <Link
          to="/"
          className="hover:opacity-70 transition-opacity underline underline-offset-4"
        >
          ← Back to home
        </Link>
      </p>
    </div>
  </div>
);

export default SignUpPage;
