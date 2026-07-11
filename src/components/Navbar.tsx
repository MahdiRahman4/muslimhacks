import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { cn } from "@/lib/utils";
import GoldButton from "./ui/goldButton";
import muslimHacksLogo from "../assets/muslimhacks-logo.png";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Sponsors", href: "#sponsors" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = ({ displayApplyDialog }: { displayApplyDialog?: boolean }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

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
    href: string,
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
          : "bg-transparent py-6",
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between gap-4">
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
                  : "text-cream/70 hover:text-cream",
              )}
            >
              {item.label}
            </a>
          ))}
          {displayApplyDialog && (
            <GoldButton
              as={Link}
              to="/signin"
              className="w-full sm:w-auto sm:self-start"
              isNavButton={true}
              displayApplyDialog={displayApplyDialog}
            >
              Apply now
            </GoldButton>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3 ml-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="font-sans text-sm uppercase tracking-wider text-cream/80 hover:text-cream">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="font-sans text-sm uppercase tracking-wider px-4 py-2 rounded-full bg-amber text-plum-deep hover:brightness-110">
                Apply
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              to="/dashboard"
              className="font-sans text-sm uppercase tracking-wider text-cream/80 hover:text-cream"
            >
              Dashboard
            </Link>
            <Link
              to="/apply"
              className="font-sans text-sm uppercase tracking-wider text-cream/80 hover:text-cream"
            >
              Application
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        <button className="md:hidden text-cream p-2" aria-label="Menu">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
