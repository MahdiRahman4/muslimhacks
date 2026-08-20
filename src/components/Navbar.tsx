import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
} from "@clerk/clerk-react";
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
import { useI18n } from "@/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const NAV_HREFS = [
  { key: "home" as const, href: "#home" },
  { key: "about" as const, href: "#about" },
  { key: "sponsors" as const, href: "#sponsors" },
  { key: "faq" as const, href: "#faq" },
];

const EXTERNAL_NAV_LINKS = [
  { key: "devpost" as const, href: "https://muslimhacks.devpost.com/" },
];

const Navbar = ({ displayApplyDialog }: { displayApplyDialog?: boolean }) => {
  const { t } = useI18n();
  const { isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { hasApplication } = useApplicationButtonState();
  const applicationButtonLabel = getApplicationButtonLabel(hasApplication, t);

  const navItems = NAV_HREFS.map((item) => ({
    ...item,
    label: t(`nav.${item.key}`),
  }));

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
              {item.label}
            </a>
          ))}
          {false &&EXTERNAL_NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-base uppercase tracking-wider transition-all duration-300 text-cream/70 hover:text-cream"
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
                  {applicationButtonLabel}
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
                {applicationButtonLabel}
              </GoldButton>
            </SignedIn>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3 ml-4">
          <LanguageSwitcher />
          <SignedOut>
            <Link
              to="/signin"
              className="font-sans text-sm uppercase tracking-wider text-cream/80 hover:text-cream flex items-center gap-2"
            >
              <LogIn size={15} />
              <span>{t("nav.signIn")}</span>
            </Link>
          </SignedOut>
          <Profile />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher compact />
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
