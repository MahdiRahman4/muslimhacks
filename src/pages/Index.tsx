import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/400-italic.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/crimson-text/400.css';
import '@fontsource/crimson-text/400-italic.css';
import '@fontsource/amiri/400.css';
import '@fontsource/amiri/700.css';

import OpeningSection from '@/components/sections/OpeningSection';
import QuestionSection from '@/components/sections/QuestionSection';
import StorySection from '@/components/sections/StorySection';
import VisionSection from '@/components/sections/VisionSection';
import InvitationSection from '@/components/sections/InvitationSection';

const Index = () => {
  return (
    <main className="relative overflow-x-hidden">
      {/* SEO: Primary heading for the page */}
      <h1 className="sr-only">
        MuslimHacks - Québec's Largest Muslim Charity Hackathon | September 2026
      </h1>
      
      {/* The Five Emotional Sections */}
      <OpeningSection />
      <QuestionSection />
      <StorySection />
      <VisionSection />
      <InvitationSection />
    </main>
  );
};

export default Index;
