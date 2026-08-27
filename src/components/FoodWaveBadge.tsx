import type { FoodWave } from "@/lib/food-wave";

type Wave = Pick<FoodWave, "label" | "hex" | "text_hex">;

interface FoodWaveBadgeProps {
  wave?: Wave | null;
  size?: "sm" | "lg";
}

export function FoodWaveBadge({ wave, size = "sm" }: FoodWaveBadgeProps) {
  if (!wave) {
    return (
      <span className="font-sans text-sm" style={{ color: "rgba(201,187,168,0.7)" }}>
        —
      </span>
    );
  }

  if (size === "lg") {
    return (
      <div
        className="rounded-2xl px-5 py-6 flex flex-col gap-1"
        style={{ background: wave.hex, color: wave.text_hex }}
      >
        <p className="font-sans text-xs uppercase tracking-[0.2em] font-semibold opacity-80">
          Food group
        </p>
        <p className="font-display text-4xl font-black leading-none">{wave.label}</p>
      </div>
    );
  }

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full font-sans text-xs font-semibold whitespace-nowrap"
      style={{ background: wave.hex, color: wave.text_hex }}
    >
      {wave.label}
    </span>
  );
}
