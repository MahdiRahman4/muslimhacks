import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import GoldButton from "./ui/goldButton";
import muslimHacksLogo from "../assets/muslimhacks-logo-white.svg";
import Profile from "./ui/profile";
import { LogIn } from "lucide-react";
import {
  getApplicationButtonLabel,
  useApplicationButtonState,
} from "@/contexts/ApplicationButtonContext";
import { useAuth } from "@/hooks/useAuth";
import { BRAND } from "@/components/Shared";

const navItems = [
  { key: "home", href: "#home" },
  { key: "about", href: "#about" },
  { key: "sponsors", href: "#sponsors" },
  { key: "faq", href: "#faq" },
];

const Navbar = ({ displayApplyDialog }: { displayApplyDialog?: boolean }) => {
  const { t, i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { hasApplication } = useApplicationButtonState();
  const applicationButtonLabel = getApplicationButtonLabel(hasApplication);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const sections = navItems.map((item) => item.href.slice(1));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-plum-deep/90 backdrop-blur-md border-b border-cream/10 py-4"
          : "bg-transparent py-6"
      )}
    >
      <div className="w-100 px-6 md:px-12 flex items-center justify-between gap-4">
        <img
          src={muslimHacksLogo}
          alt="MuslimHacks"
          className="h-7 w-auto object-contain"
        />

        <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleClick(e, item.href)}
              className={cn(
                "font-sans text-base uppercase tracking-wider transition-all duration-300",
                activeSection === item.href.slice(1)
                  ? "text-amber"
                  : "text-cream/70 hover:text-cream"
              )}
            >
              {t(`nav.${item.key}`)}
            </a>
          ))}
          {displayApplyDialog && (
            <SignedOut>
              <GoldButton
                as={Link}
                to="/signup"
                className="w-full sm:w-auto sm:self-start"
                isNavButton={false}
                displayApplyDialog={displayApplyDialog}
              >
                {t("nav.applyNow")}
              </GoldButton>
            </SignedOut>
          )}
          {displayApplyDialog && (
            <SignedIn>
              {!isAdmin && (
                <GoldButton
                  as={Link}
                  to="/apply"
                  className="w-full sm:w-auto sm:self-start"
                  isNavButton={true}
                  displayApplyDialog={displayApplyDialog}
                >
                  {t(applicationButtonLabel)}
                </GoldButton>
              )}
            </SignedIn>
          )}
          {isAdmin && !hasApplication && (
            <SignedIn>
              <GoldButton
                as={Link}
                to="/apply"
                className="w-full sm:w-auto sm:self-start"
                isNavButton={true}
                displayApplyDialog={displayApplyDialog}
              >
                {t(applicationButtonLabel)}
              </GoldButton>
            </SignedIn>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3 ml-4">
          <SignedOut>
            <Link
              to="/signin"
              className="font-sans text-sm uppercase tracking-wider text-cream/80 hover:text-cream flex items-center gap-2"
            >
              <LogIn size={15} />
              <span>{t("nav.signIn")}</span>
            </Link>
          </SignedOut>
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={t("nav.toggleLanguage")}
            className="font-sans text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors duration-200"
            style={{
              borderColor: "rgba(221,168,83,0.4)",
              color: BRAND.gold,
            }}
          >
            {i18n.language === "fr" ? "EN" : "FR"}
          </button>
          <Profile />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={t("nav.toggleLanguage")}
            className="font-sans text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors duration-200"
            style={{
              borderColor: "rgba(221,168,83,0.4)",
              color: BRAND.gold,
            }}
          >
            {i18n.language === "fr" ? "EN" : "FR"}
          </button>
          <SignedOut>
            <GoldButton
              as={Link}
              to="/signin"
              className="w-full sm:w-auto sm:self-start"
              isNavButton={false}
              displayApplyDialog={displayApplyDialog}
            >
              {t("nav.signIn")}
            </GoldButton>
          </SignedOut>

          <SignedIn>
            <Profile />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
