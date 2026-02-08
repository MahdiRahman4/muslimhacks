import { useScrollReveal } from '@/hooks/useScrollReveal';

const teamMembers = [
  {
    name: "Coming Soon",
    role: "Organizer",
    arabicName: "قريباً",
  },
  {
    name: "Coming Soon",
    role: "Tech Lead",
    arabicName: "قريباً",
  },
  {
    name: "Coming Soon",
    role: "Design Lead",
    arabicName: "قريباً",
  },
  {
    name: "Coming Soon",
    role: "Outreach",
    arabicName: "قريباً",
  },
];

const TeamSection = () => {
  const [headerRef, headerVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const [teamRef, teamVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const [joinRef, joinVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section id="team" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, hsl(230 35% 15%) 0%, hsl(280 40% 20%) 100%)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        
        {/* Header - right aligned for asymmetry */}
        <div 
          ref={headerRef}
          className={`max-w-xl ml-auto text-right mb-20 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
          }`}
        >
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-rose/60 mb-4">
            The people behind
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-cream leading-tight mb-6">
            A team united by<br />
            <span className="text-gradient-sunset">purpose</span>
          </h2>
          <p className="font-intimate text-lg text-cream/60">
            Muslims in tech who decided to build something bigger than themselves.
          </p>
        </div>
        
        {/* Team grid */}
        <div 
          ref={teamRef}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 transition-all duration-1000 delay-200 ${
            teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {teamMembers.map((member, index) => (
            <div 
              key={index}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Placeholder avatar */}
              <div className="relative mb-6">
                <div className="w-full aspect-square bg-gradient-to-br from-cream/10 to-cream/5 rounded-2xl flex items-center justify-center border border-cream/10 group-hover:border-amber/30 transition-colors">
                  <p className="font-arabic text-4xl text-cream/20" dir="rtl">
                    {member.arabicName}
                  </p>
                </div>
                {/* Decorative offset */}
                <div className="absolute -bottom-2 -right-2 w-full h-full border border-amber/20 rounded-2xl -z-10" />
              </div>
              
              <p className="font-display text-xl text-cream mb-1">
                {member.name}
              </p>
              <p className="font-sans text-sm uppercase tracking-wider text-cream/50">
                {member.role}
              </p>
            </div>
          ))}
        </div>
        
        {/* Join the team CTA */}
        <div 
          ref={joinRef}
          className={`max-w-lg text-center mx-auto transition-all duration-1000 delay-400 ${
            joinVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <p className="font-intimate text-xl text-cream/70 mb-4">
            Want to help make this happen?
          </p>
          <p className="font-intimate text-cream/50 mb-6">
            We're looking for volunteers, mentors, and organizers who share our vision.
          </p>
          <a 
            href="mailto:team@muslimhacks.ca" 
            className="inline-block font-sans text-sm uppercase tracking-wider text-cream border border-cream/30 rounded-full px-8 py-3 hover:bg-cream/10 hover:border-cream/50 transition-all duration-300"
          >
            Get Involved
          </a>
        </div>
        
      </div>
      
      {/* Decorative lines */}
      <div className="absolute left-0 top-1/3 w-16 h-px bg-gradient-to-r from-amber/40 to-transparent" />
      <div className="absolute right-0 bottom-1/3 w-24 h-px bg-gradient-to-l from-rose/30 to-transparent" />
    </section>
  );
};

export default TeamSection;
