import { BRAND } from "../Shared";
import { Link } from "react-router-dom";

export default function GoldButton({
    children,
    onClick,
    className = "",
    as: Tag = "button",
    ...rest
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    as?: "button" | typeof Link;
    to?: string;
  }) {
    return (
      <Tag
        onClick={onClick}
        className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-sans text-sm font-semibold uppercase tracking-[0.15em] transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
        style={{
          background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
          color: BRAND.navyDeep,
          boxShadow: "0 8px 30px rgba(221,168,83,0.22)",
          // @ts-ignore
          "--tw-ring-color": BRAND.gold,
        }}
        {...rest}
      >
        {children}
      </Tag>
    );
  }