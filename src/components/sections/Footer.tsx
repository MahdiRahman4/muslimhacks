import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/LanguageProvider";
import { APPLICATIONS_OPEN } from "@/lib/applications-open";

const Footer = () => {
  const { t } = useI18n();

  const footerLinks = [
    { label: t("nav.home"), href: "#home" },
    { label: t("nav.about"), href: "#about" },
    { label: t("nav.sponsors"), href: "#sponsors" },
    { label: t("nav.faq"), href: "#faq" },
    ...(APPLICATIONS_OPEN
      ? [{ label: t("footer.register"), href: "#register" }]
      : []),
  ];

  const contactEmails = [
    { label: t("footer.general"), email: "info@muslimhacks.ca" },
    { label: t("footer.sponsorship"), email: "sponsors@muslimhacksoutreach.ca" },
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer
      className="relative border-t border-cream/10"
      style={{
        background: "linear-gradient(180deg, hsl(240 50% 6%) 0%, hsl(235 45% 8%) 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <p className="font-display text-2xl md:text-3xl text-gradient-sunset mb-3">
              MuslimHacks
            </p>
            <p className="font-intimate text-base md:text-lg text-cream/60 leading-relaxed" style={{ fontStyle: "normal" }}>
              {t("footer.blurb")}
            </p>
            <p className="font-sans text-sm text-cream/40 mt-4">
              {t("footer.dateLocation")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-sans text-sm uppercase tracking-[0.2em] text-amber mb-4">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => handleClick(e, item.href)}
                    className="font-sans text-base md:text-lg text-cream/70 hover:text-cream transition-colors" style={{ fontSize: "0.875rem" }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-sans text-sm uppercase tracking-[0.2em] text-amber mb-4">
              {t("footer.contact")}
            </h3>
            <ul className="space-y-3">
              {contactEmails.map((item) => (
                <li key={item.email}>
                  <span className="font-sans text-sm text-cream/50 block mb-0.5">
                    {item.label}
                  </span>
                  <a
                    href={`mailto:${item.email}`}
                    style={{ fontSize: "0.875rem" }}
                    className="font-sans text-base md:text-lg text-cream/80 hover:text-amber transition-colors"
                  >
                    {item.email}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Partnership */}
          <div>
            <h3 className="font-sans text-sm uppercase tracking-[0.2em] text-amber mb-4">
              {t("footer.partner")}
            </h3>
            <p className="font-display text-lg md:text-xl text-cream/90">
              Islamic Relief Canada
            </p>
            <p className="font-intimate text-base text-cream/50 mt-1" style={{ fontStyle: "normal" }}>
              {t("footer.funds")}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-sm text-cream/40">
            {t("footer.rights", { year: new Date().getFullYear() })}
          </p>
          {/* <LanguageSwitcher /> */}
          <p className="font-sans text-sm text-cream/40">
            {t("footer.madeIn")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
