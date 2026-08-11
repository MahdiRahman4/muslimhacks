import { Link } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import GoldButton from "@/components/ui/goldButton";
import { BRAND } from "@/components/Shared";
import { useAuth } from "@/hooks/useAuth";
import {
  getApplicationButtonLabel,
  useApplicationButtonState,
} from "@/contexts/ApplicationButtonContext";

interface ApplyFunnelCtaProps {
  variant?: "hero" | "section";
  helperText?: string;
  align?: "start" | "center";
  className?: string;
}

export function ApplyFunnelCta({
  variant = "section",
  helperText,
  align = "start",
  className = "",
}: ApplyFunnelCtaProps) {
  const { isAdmin } = useAuth();
  const { hasApplication } = useApplicationButtonState();
  const label = getApplicationButtonLabel(hasApplication);

  const alignClass =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={`flex flex-col gap-3 ${alignClass} ${className}`}>
      <SignedOut>
        <GoldButton as={Link} to="/signup" className="w-full sm:w-auto">
          {label}
        </GoldButton>
      </SignedOut>
      <SignedIn>
        {!isAdmin && (
          <GoldButton as={Link} to="/apply" className="w-full sm:w-auto">
            {label}
          </GoldButton>
        )}
        {isAdmin && (
          <GoldButton as={Link} to="/admin/applications" className="w-full sm:w-auto">
            Go to Applications
          </GoldButton>
        )}
      </SignedIn>
      {helperText && (
        <p
          className="font-intimate text-xs sm:text-sm leading-relaxed max-w-md whitespace-pre-line text-center md:text-left self-center md:self-start"
          style={{
            fontStyle: "italic",
            color: BRAND.sand,
            textShadow:
              variant === "hero" ? "0 2px 10px rgba(0,0,0,0.5)" : undefined,
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
