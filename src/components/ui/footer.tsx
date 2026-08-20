import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/LanguageProvider";

export default function Footer() {
  const { t } = useI18n();

  return (
    <>
      <footer
        className="relative z-10 py-6 text-center border-t"
        style={{ borderColor: "rgba(221,168,83,0.08)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <LanguageSwitcher />
          <p
            className="font-intimate text-sm"
            style={{ fontStyle: "italic", color: "rgba(221,168,83,0.3)" }}
          >
            {t("footer.builtWith")}
          </p>
        </div>
      </footer>
    </>
  );
}
