import { BRAND } from "../Shared";

export default function GoldButtonSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full border border-cream/15 bg-cream/5 ${className}`}
    >
      <span
        className="w-4 h-4 rounded-full border-2 animate-spin"
        style={{ borderColor: "rgba(221,168,83,0.25)", borderTopColor: BRAND.gold }}
      />
    </div>
  );
}
