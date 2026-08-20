import { BRAND } from "@/components/Shared";
import { useI18n } from "@/i18n/LanguageProvider";
import type { Locale } from "@/i18n/messages";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();

  function Option({ code, label }: { code: Locale; label: string }) {
    const active = locale === code;
    return (
      <button
        type="button"
        onClick={() => setLocale(code)}
        aria-pressed={active}
        aria-label={label}
        className={`font-sans text-xs uppercase tracking-[0.18em] font-semibold rounded transition-opacity hover:opacity-80 ${
          compact ? "px-1.5 py-0.5" : "px-2 py-1"
        }`}
        style={{
          color: active ? BRAND.gold : BRAND.sand,
          background: active ? "rgba(221,168,83,0.12)" : "transparent",
        }}
      >
        {code === "en" ? "EN" : "FR"}
      </button>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="group"
      aria-label={t("nav.language")}
    >
      <Option code="en" label={t("nav.english")} />
      <span style={{ color: "rgba(201,187,168,0.35)" }} aria-hidden="true">
        /
      </span>
      <Option code="fr" label={t("nav.french")} />
    </div>
  );
}
