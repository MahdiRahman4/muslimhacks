import { Link } from "react-router-dom";
import { BRAND } from "@/components/Shared";
import muslimHacksLogo from "@/assets/muslimhacks-logo-white.svg";
import Profile from "@/components/ui/profile";

export function EventOpsHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ background: "rgba(6,15,32,0.95)", backdropFilter: "blur(14px)", borderColor: "rgba(221,168,83,0.1)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="shrink-0">
            <img src={muslimHacksLogo} alt="MuslimHacks" className="h-5 sm:h-6 w-auto object-contain" />
          </Link>
          <div className="h-4 w-px shrink-0" style={{ background: "rgba(221,168,83,0.2)" }} />
          <span className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.22em] font-medium truncate" style={{ color: BRAND.sand }}>
            Admin
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* <Link
            to="/admin/applications"
            className="font-sans text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: BRAND.sand }}
          >
            Applications
          </Link> */}
          <Profile />
        </div>
      </div>
    </header>
  );
}
