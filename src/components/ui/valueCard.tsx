import { BRAND, StarPattern, Eyebrow } from "../Shared";

export default function ValueCard({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
    return (
      <div
        className="relative rounded-xl p-8 flex flex-col gap-4 transition-all duration-300 group hover:-translate-y-1"
        style={{
          background: "rgba(245,238,227,0.05)",
          border: `1px solid rgba(221,168,83,0.18)`,
          boxShadow: "0 8px 24px rgba(6,15,32,0.45)",
        }}
      >
        <Eyebrow>{eyebrow}</Eyebrow>
        <h3 className="font-display text-2xl font-bold leading-tight" style={{ color: BRAND.cream }}>
          {title}
        </h3>
        <p className="font-sans text-sm leading-relaxed" style={{ color: BRAND.creamMuted }}>
          {body}
        </p>
        <div
          className="absolute bottom-0 left-8 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, transparent, ${BRAND.gold}, transparent)` }}
        />
      </div>
    );
  }