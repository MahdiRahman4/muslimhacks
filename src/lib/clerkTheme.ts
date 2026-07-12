import type { Appearance } from "@clerk/types";

// Brand tokens mirrored from Shared.tsx — keep in sync if BRAND changes
const B = {
  gold: "#DDA853",
  goldSoft: "#E7C078",
  navy: "#0C1F3F",
  navyDeep: "#060F20",
  purpleLight: "#9B7CB0",
  cream: "#F5EEE3",
  creamMuted: "#D9CFC0",
  sand: "#C9BBA8",
};

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: B.gold,
    colorBackground: B.navy,
    colorInputBackground: "rgba(245,238,227,0.06)",
    colorInputText: B.cream,
    colorText: B.cream,
    colorTextSecondary: B.sand,
    colorTextOnPrimaryBackground: B.navyDeep,
    colorNeutral: B.sand,
    colorDanger: "#C47070",
    colorSuccess: "#5FA877",
    borderRadius: "8px",
    fontFamily: "'Inter', system-ui, sans-serif",
    fontFamilyButtons: "'Inter', system-ui, sans-serif",
    spacingUnit: "16px",
  },
  elements: {
    // ── Layout ──────────────────────────────────────────────────────────────────
    card: {
      background: "rgba(12,31,63,0.96)",
      border: "1px solid rgba(221,168,83,0.18)",
      boxShadow: "0 24px 60px rgba(6,15,32,0.6)",
      borderRadius: "16px",
    },
    cardBox: {
      boxShadow: "none",
    },
    // ── Header ──────────────────────────────────────────────────────────────────
    headerTitle: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: "700",
      color: B.cream,
      letterSpacing: "-0.02em",
    },
    headerSubtitle: {
      fontFamily: "'Crimson Text', Georgia, serif",
      fontStyle: "italic",
      color: B.creamMuted,
      fontSize: "16px",
    },
    // ── Social OAuth buttons ─────────────────────────────────────────────────────
    socialButtonsBlockButton: {
      background: "rgba(245,238,227,0.06)",
      border: "1px solid rgba(221,168,83,0.22)",
      color: B.cream,
      borderRadius: "100px",
    },
    socialButtonsBlockButtonText: {
      color: B.cream,
      fontWeight: "500",
    },
    // ── Dividers ────────────────────────────────────────────────────────────────
    dividerLine: {
      background: "rgba(221,168,83,0.15)",
    },
    dividerText: {
      color: B.sand,
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.2em",
    },
    // ── Form fields ─────────────────────────────────────────────────────────────
    formFieldLabel: {
      color: B.sand,
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.18em",
      fontWeight: "500",
    },
    formFieldInput: {
      background: "rgba(245,238,227,0.06)",
      border: "1px solid rgba(221,168,83,0.22)",
      color: B.cream,
      borderRadius: "8px",
    },
    formFieldInputShowPasswordButton: {
      color: B.sand,
    },
    formFieldHintText: {
      color: B.sand,
    },
    formFieldSuccessText: {
      color: "#5FA877",
    },
    // ── Primary action button ────────────────────────────────────────────────────
    formButtonPrimary: {
      background: `linear-gradient(135deg, ${B.goldSoft} 0%, ${B.gold} 100%)`,
      color: B.navyDeep,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.15em",
      fontSize: "13px",
      borderRadius: "100px",
      boxShadow:
        "0 0 18px rgba(221,168,83,0.35), 0 4px 16px rgba(221,168,83,0.2)",
    },
    // ── Secondary / ghost button ─────────────────────────────────────────────────
    formButtonReset: {
      color: B.purpleLight,
    },
    // ── Alerts / errors ──────────────────────────────────────────────────────────
    alert: {
      background: "rgba(196,112,112,0.1)",
      border: "1px solid rgba(196,112,112,0.25)",
      borderRadius: "8px",
    },
    alertText: {
      color: "#E07070",
    },
    // ── Footer ──────────────────────────────────────────────────────────────────
    footer: {
      background: "transparent",
      borderTop: "1px solid rgba(221,168,83,0.1)",
    },
    footerActionText: {
      color: B.sand,
    },
    footerActionLink: {
      color: B.purpleLight,
      fontWeight: "500",
    },
    // ── Identity preview (after email entry) ─────────────────────────────────────
    identityPreviewText: {
      color: B.cream,
    },
    identityPreviewEditButton: {
      color: B.purpleLight,
    },
    // ── OTP / verification ───────────────────────────────────────────────────────
    otpCodeFieldInput: {
      background: "rgba(245,238,227,0.06)",
      border: "1px solid rgba(221,168,83,0.22)",
      color: B.cream,
      borderRadius: "8px",
    },
    // ── Back link ────────────────────────────────────────────────────────────────
    backLink: {
      color: B.purpleLight,
    },
    // ── Modal ────────────────────────────────────────────────────────────────────
    modalBackdrop: {
      background: "rgba(6,15,32,0.85)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
    },
    modalCloseButton: {
      color: B.sand,
    },
  },
};
