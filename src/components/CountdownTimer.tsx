import { useEffect, useState } from "react";
import { BRAND } from "@/components/Shared";
import { useI18n } from "@/i18n/LanguageProvider";

// Application deadline: August 27, 2026, 11:59:59 PM EDT (UTC-4)
export const APPLICATION_DEADLINE = new Date("2026-08-27T23:59:59-04:00");

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

function getTimeLeft(deadline: Date): TimeLeft {
  const diff = deadline.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    done: false,
  };
}

interface CountdownTimerProps {
  deadline?: Date;
  /** "hero" adds a text-shadow so it stays legible over the photo */
  variant?: "hero" | "section";
  align?: "start" | "center";
  className?: string;
}

export default function CountdownTimer({
  deadline = APPLICATION_DEADLINE,
  variant = "section",
  align = "start",
  className = "",
}: CountdownTimerProps) {
  const { t } = useI18n();
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(deadline));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(deadline)), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const textShadow =
    variant === "hero" ? "0 2px 10px rgba(0,0,0,0.5)" : undefined;
  const alignClass = align === "center" ? "items-center" : "items-start";

  if (timeLeft.done) {
    return (
      <p
        className={`font-sans text-sm uppercase tracking-[0.28em] font-semibold ${className}`}
        style={{ color: BRAND.gold, textShadow }}
      >
        {t("countdown.closed")}
      </p>
    );
  }

  const units = [
    { label: t("countdown.days"), value: timeLeft.days },
    { label: t("countdown.hours"), value: timeLeft.hours },
    { label: t("countdown.mins"), value: timeLeft.minutes },
    { label: t("countdown.secs"), value: timeLeft.seconds },
  ];

  return (
    <div className={`flex flex-col gap-2 ${alignClass} ${className}`}>
      <p
        className="font-sans text-xs uppercase tracking-[0.28em] font-medium"
        style={{ color: BRAND.sand, textShadow }}
      >
        {t("countdown.label")}
      </p>
      <div
        className="flex gap-2 sm:gap-3"
        role="timer"
        aria-label={t("countdown.aria")}
      >
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center rounded-xl px-3 py-2 sm:px-4 sm:py-3 min-w-[3.75rem] sm:min-w-[4.25rem]"
            style={{
              background: "rgba(245,238,227,0.05)",
              border: "1px solid rgba(221,168,83,0.28)",
              backdropFilter: "blur(6px)",
            }}
          >
            <span
              className="font-display font-bold leading-none tabular-nums"
              style={{
                fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
                color: BRAND.gold,
              }}
            >
              {String(unit.value).padStart(2, "0")}
            </span>
            <span
              className="font-sans text-[0.6rem] sm:text-xs uppercase tracking-[0.18em] mt-1"
              style={{ color: BRAND.creamMuted }}
            >
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
