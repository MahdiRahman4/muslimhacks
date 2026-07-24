const footerLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Sponsors', href: '#sponsors' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Register', href: '#register' },
];

const contactEmails = [
  { label: 'General inquiries', email: 'info@muslimhacks.ca' },
  { label: 'Sponsorship', email: 'sponsors@muslimhacksoutreach.ca' },
];

const Footer = () => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      className="relative border-t border-cream/10"
      style={{
        background: 'linear-gradient(180deg, hsl(240 50% 6%) 0%, hsl(235 45% 8%) 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <p className="font-display text-2xl md:text-3xl text-gradient-sunset mb-3">
              MuslimHacks
            </p>
            <p className="font-intimate text-base md:text-lg text-cream/60 leading-relaxed">
              Quebec's largest Muslim charity hackathon. 24 hours to build technology with purpose.
            </p>
            <p className="font-sans text-sm text-cream/40 mt-4">
              September 2026 · Concordia University, Downtown Campus, Montreal, Quebec
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-sans text-sm uppercase tracking-[0.2em] text-amber mb-4">
              Quick links
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => handleClick(e, item.href)}
                    className="font-intimate text-base md:text-lg text-cream/70 hover:text-cream transition-colors"
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
              Contact
            </h3>
            <ul className="space-y-3">
              {contactEmails.map((item) => (
                <li key={item.email}>
                  <span className="font-sans text-sm text-cream/50 block mb-0.5">
                    {item.label}
                  </span>
                  <a
                    href={`mailto:${item.email}`}
                    className="font-intimate text-base md:text-lg text-cream/80 hover:text-amber transition-colors"
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
              Partner
            </h3>
            <p className="font-display text-lg md:text-xl text-cream/90">
              Islamic Relief Canada
            </p>
            <p className="font-intimate text-base text-cream/50 mt-1">
              Serving humanity since 1984. All hackathon proceeds go to charity through IR Canada.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-sm text-cream/40">
            © {new Date().getFullYear()} MuslimHacks. All rights reserved.
          </p>
          <p className="font-sans text-sm text-cream/40">
            Built with intention · Montreal, Quebec
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
