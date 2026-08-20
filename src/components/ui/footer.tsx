import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <>
      <footer
        className="relative z-10 py-6 text-center border-t"
        style={{ borderColor: "rgba(221,168,83,0.08)" }}
      >
        <p
          className="font-intimate text-sm"
          style={{ fontStyle: "italic", color: "rgba(221,168,83,0.3)" }}
        >
          {t("footerUi.tagline")}
        </p>
      </footer>
    </>
  );
}
