import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BRAND, StarPattern } from "@/components/Shared";
import muslimHacksLogo from "@/assets/muslimhacks-logo-white.svg";

export default function PostAuthRedirect() {
  const { loading, isAdmin, summary } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${BRAND.purpleDeep} 0%, ${BRAND.navy} 60%, ${BRAND.navyDeep} 100%)`,
        }}
      >
        <StarPattern opacity={0.06} />
        <img
          src={muslimHacksLogo}
          alt="MuslimHacks"
          className="relative h-10 w-auto opacity-90"
        />
        <span
          className="relative w-8 h-8 rounded-full border-2 animate-spin"
          style={{
            borderColor: "rgba(221,168,83,0.25)",
            borderTopColor: BRAND.gold,
          }}
        />
        <p className="relative font-sans text-sm tracking-wide" style={{ color: BRAND.sand }}>
          Getting things ready...
        </p>
      </div>
    );
  }

  if (isAdmin) {
    return <Navigate to="/admin/applications" replace />;
  }

  if (summary?.has_application) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/apply" replace />;
}
