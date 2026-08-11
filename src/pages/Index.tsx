import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/crimson-text/400.css";
import "@fontsource/crimson-text/400-italic.css";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";

// old components
import Navbar from "@/components/Navbar";
import OpeningSection from "@/components/sections/OpeningSection";
import QuestionSection from "@/components/sections/QuestionSection";
import StorySection from "@/components/sections/StorySection";
import VisionSection from "@/components/sections/VisionSection";
import SponsorsSection from "@/components/sections/SponsorsSection";
import FAQSection from "@/components/sections/FAQSection";
import InvitationSection from "@/components/sections/InvitationSection";
import Footer from "@/components/sections/Footer";
// new components
import OpeningSectionV2 from "@/components/sections/OpeningSectionV2";
import QuestionSectionV2 from "@/components/sections/QuestionSectionV2";
import VisionFunnelSection from "@/components/sections/VisionFunnelSection";
import BenefitsSection from "@/components/sections/BenefitsSection";
import VisionSectionV2 from "@/components/sections/VisionSectionV2";
import SponsorsSectionV2 from "@/components/sections/SponsorsSectionV2";
import FAQSectionV2 from "@/components/sections/FAQSectionV2";
import { useState } from "react";

const Index = () => {
  const [displayInviteDialog, setDisplayInviteDialog] = useState(false);
  const [displayApplyDialog, setDisplayApplyDialog] = useState(true);

  return (
    <main className="relative overflow-x-hidden">
      {/* SEO: Primary heading for the page */}
      <h1 className="sr-only">
        MuslimHacks - Quebec's Largest Muslim Charity Hackathon | September 2026
      </h1>

      {/* Navigation */}
      <Navbar displayApplyDialog={displayApplyDialog} />

      {/* The Emotional Journey Sections */}

      {/* <OpeningSection /> */}
      <OpeningSectionV2
        displayApplyDialog={displayApplyDialog}
        displayInviteDialog={displayInviteDialog}
      />
      <VisionFunnelSection />
      <BenefitsSection />
      {/* <QuestionSection /> */}
      <QuestionSectionV2 />
      {/* <VisionSection /> */}
      <VisionSectionV2 />

      {/* Standard Hackathon Sections */}

      {/* <SponsorsSection /> */}
      <SponsorsSectionV2 />
      {/* <FAQSection /> */}
      <FAQSectionV2 />

      {/* Final Call to Action */}
      <InvitationSection
        displayApplyDialog={displayApplyDialog}
        displayInviteDialog={displayInviteDialog}
      />

      {/* Footer */}
      <Footer />
    </main>
  );
};

export default Index;
