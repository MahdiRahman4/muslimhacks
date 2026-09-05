export type ChallengeGroup = "pplus" | "sponsor";

export interface Challenge {
  id: string;
  group: ChallengeGroup;
  number: string;
  title: string;
  tagline: string;
  themes: string[];
  problem: string;
  howToday: string;
  focus: string[];
  constraints: string[];
  beforeYouBuild: string[];
  deliverable: string;
  extra?: string;
  example?: string;
  requiresIpGrant: boolean;
  ipOwner: string | null;
}

export const PPLUS_SECTION_TITLE = "MuslimHacks × PPLUS Challenges";
export const SPONSOR_SECTION_TITLE = "Sponsor Challenges";

export const CHALLENGES: Challenge[] = [
  {
    id: "elderly-care",
    group: "pplus",
    number: "01",
    title: "Elderly Care",
    tagline:
      "Help families and caregivers coordinate safer, more dignified care for elderly Muslims while respecting their privacy, independence, personal preferences, and connection to their community.",
    themes: ["Coordination", "Consent", "Cultural Fit"],
    problem:
      "Care for an elderly parent is often shared between relatives, doctors, pharmacists and support workers, but there is rarely one shared system keeping everyone coordinated. Medication, appointments, meals, transport and personal care may be tracked across WhatsApp, memory and separate calendars. Muslim families can also struggle to find care that respects language, diet, prayer, modesty and caregiver-gender preferences.",
    howToday:
      "Families coordinate care through messages, calls, calendars and informal handoffs. Existing products usually solve only one part: task apps organize responsibilities, medication tools send reminders, monitoring tools watch for safety risks and marketplaces find caregivers. Few connect these pieces while giving the elder control and treating cultural preferences as part of the actual system.",
    focus: [
      "Caregiver handoffs: make it clear what happened and what the next caregiver needs to know.",
      "Workload visibility: show how responsibilities are divided across family members.",
      "Personal preferences: structure language, diet, prayer, modesty and caregiver-gender needs.",
      "Elder participation: give the elder visibility and control over what is shared.",
    ],
    constraints: [
      "Health information requires appropriate consent and privacy protections.",
      "Do not build diagnosis, dosage recommendations or medical triage.",
      '"Muslim-friendly" is not one setting. Preferences must be individual.',
    ],
    beforeYouBuild: [
      "Who is your primary user?",
      "Why is this better than the family's WhatsApp group?",
      "Who can access the data, and who controls that access?",
    ],
    deliverable: "A working MVP demonstrating one core workflow.",
    requiresIpGrant: false,
    ipOwner: null,
  },
  {
    id: "international-trades",
    group: "pplus",
    number: "02",
    title: "International Trades",
    tagline: "Help businesses predict and reduce the costs of their international transactions.",
    themes: ["Visibility", "Forecasting", "Sharia constraints"],
    problem:
      "When a business sends money internationally, the exchange rate it sees is not the final cost. The total can include the exchange-rate spread, transfer fees, intermediary bank fees and receiving-bank charges. Some of these costs may only become visible after the payment is completed. There is also a timing problem: if an invoice is priced weeks before it is paid, exchange-rate changes can reduce the business's profit without the business intentionally taking that risk.",
    howToday:
      "A business may send money through its bank or a foreign exchange (FX) provider. The payment can pass through intermediary banks before reaching the recipient, with fees added along the way. Existing FX providers show their own rates, while treasury systems are often too expensive or complex for small businesses. Hedging tools can reduce exchange-rate risk, but they are usually designed and explained for finance professionals rather than ordinary business owners.",
    focus: [
      "Show the real cost: estimate the exchange-rate, transfer fees and other charges before the business sends money.",
      "Show the risk: demonstrate what happens to an invoice or profit margin if the exchange rate moves against the business.",
      "Make options understandable: help a non-finance user compare payment timing, providers or risk-management options.",
      "Explore Sharia-compliant alternatives: help Muslim businesses understand ways of managing currency risk without relying on conventional FX forwards.",
    ],
    constraints: [
      "Do not predict exchange rates. Show the effect of possible changes instead of claiming where a currency will move.",
      "Do not act like a bank. Moving customer money is regulated. A decision or visibility tool is much more realistic for a hackathon.",
      "Some data will be incomplete. Live FX data can be paid, and intermediary-bank fees may not be known until after the transfer.",
      "If discussing Sharia compliance, cite a recognized standard or scholar and acknowledge legitimate scholarly disagreement.",
    ],
    beforeYouBuild: [
      "Who is making the payment, and where are they sending it?",
      "Where does your rate and fee data come from?",
      "What decision does your product help the business make?",
      "Why is this better than what the business uses today?",
    ],
    deliverable: "A working MVP demonstrating one core workflow.",
    requiresIpGrant: false,
    ipOwner: null,
  },
  {
    id: "online-privacy",
    group: "pplus",
    number: "03",
    title: "Online Privacy",
    tagline:
      "Use technology to help people detect, understand, and prevent the unauthorized collection and use of their personal data online.",
    themes: ["Detection", "Evidence", "Local-first privacy"],
    problem:
      "Online tracking is no longer just about cookies. Websites can collect information through hidden scripts, browser fingerprinting, extension probing and other techniques that are difficult for users to see or stop. The LinkedIn BrowserGate case shows why this matters: LinkedIn was found probing thousands of Chrome extensions and collecting device characteristics. The scan included Islamic extensions such as Deen Shield and PordaAI, showing how this data could potentially reveal sensitive traits such as religion. LinkedIn disputes that it used the data for this purpose. The core problem is visibility and control: users often do not know what is being collected, what it can reveal about them or how to stop it.",
    howToday:
      "Tools such as uBlock Origin, Ghostery and Privacy Badger block many known trackers, while browsers such as Brave, Firefox and Safari provide additional privacy protections. However, these tools often depend on known domains or predefined rules. They may block something without explaining what happened and can miss newer techniques such as fingerprinting or disguised third-party tracking. Research tools such as Blacklight and OpenWPM provide deeper visibility, but are mainly designed for technical users.",
    focus: [
      "Make tracking understandable: show what data was collected, who received it and what it could reveal.",
      "Detect hidden behaviour: look beyond lists of known trackers for fingerprinting, extension probing, unusual scripts or hidden data flows.",
      "Move from detection to prevention: help users stop or limit unwanted collection, not only report that it happened.",
      "Design for ordinary users: a non-technical person should understand the risk and know what action to take.",
    ],
    constraints: [
      "Do not create another privacy problem. Collect as little user data as possible and prefer local processing.",
      "Do not break the web unnecessarily. Blocking everything is not useful if websites stop functioning.",
      "Test prevention, not only detection. Show that the solution actually reduces or stops the unwanted collection.",
      "If building a Chrome extension, make sure your approach works within Manifest V3 restrictions.",
    ],
    beforeYouBuild: [
      "What can your tool detect that existing privacy tools or browser developer tools cannot?",
      "Can a non-technical person understand what is happening and what to do about it?",
      "Does it actually prevent or reduce unwanted data collection?",
      "Can it protect the user without unnecessarily breaking websites?",
      "Does it provide enough value for users to justify using it?",
    ],
    deliverable: "A working MVP demonstrating one core workflow.",
    requiresIpGrant: false,
    ipOwner: null,
  },
  {
    id: "at-home-education",
    group: "pplus",
    number: "04",
    title: "At-Home Education",
    tagline:
      "Provide reliable, structured at-home education for families that want to take their children's upbringing into their own hands.",
    themes: ["Compliance", "Community", "Affordability"],
    problem:
      "Families may choose homeschooling for many reasons, including greater control over their children's education, religious environment and upbringing. Recent changes in Quebec have added new concerns for some Muslim families, including restrictions on religious practice in public institutions, changes affecting religious private schools, and a rule preventing public institutions from offering an exclusively religion-based diet such as an exclusively halal or kosher menu. Leaving the traditional school system creates another problem: private schools, online academies, homeschool co-ops, learning pods and weekend schools each solve only part of the need. Families still face trade-offs between education quality, affordability, flexibility, legal compliance and socialization.",
    howToday:
      "Private schools provide structure but can be expensive or geographically limited. Online academies provide curriculum but often lack local alignment and in-person community. Co-ops and learning pods provide social interaction but can leave parents responsible for much of the teaching and organization. Weekend schools provide trusted community spaces but do not replace a full education model. In Quebec, homeschooling also requires families to manage a learning project, progress reporting, evaluations and other requirements themselves.",
    focus: [
      "Consider masjids, community centres and qualified educators as part of the model.",
      "Define tuition or funding, staffing, facilities and how the model grows over time.",
      "Start with Quebec, but design the model so it can adjust to different jurisdictions and communities.",
    ],
    constraints: [
      "This is a business-model challenge, not primarily an app challenge. The main deliverable should explain how the service actually operates and remains financially viable.",
      "Legal requirements are part of the model. A small learning pod and a larger centre may face different rules.",
      "In Quebec, the cited exemption involves someone teaching fewer than five students at one time, subject to other conditions. Treat this as a statutory constraint to investigate, not legal advice.",
      "Consider credentialed French-speaking teachers who may be affected by religious-symbol restrictions in certain education roles.",
    ],
    beforeYouBuild: [
      "Who pays, how much, and is the model still viable after year one?",
      "Who teaches, and how many children learn together at once?",
      "What does a normal Tuesday look like for one family, including learning and socialization?",
      "Can the model adapt to different legal and educational environments?",
    ],
    deliverable:
      "A business and community model presented as a deck. A full software product is not expected.",
    requiresIpGrant: false,
    ipOwner: null,
  },
  {
    id: "courtside-ai",
    group: "sponsor",
    number: "06",
    title: "CourtSide AI",
    tagline:
      "Build a real-time, voice-controlled match scoring system and a central dashboard that simplifies tennis tournament operations, enforces singles, doubles, and express rules, and opens court-side sponsorship revenue for local and recreational events.",
    themes: ["Sponsor", "IP grant required"],
    problem:
      "Running a multi-court local or recreational tennis tournament is logistically chaotic. Matches operate unofficiated, relying on self-scoring players who frequently lose track of scores, serving rotations, or changeover break limits. Tournament organizers must continuously walk between courts or rely on paper draw sheets to update central standings, causing scheduling bottlenecks and delayed court assignments. Professional tournaments use automated umpires and electronic scoreboards, but local organizers lack an affordable, easy-to-deploy solution. Existing software either requires manual entry by a dedicated court-side volunteer or offers no real-time sync with central organizers. Quebec runs 400+ sanctioned competitive tournaments a year across Junior, Open, and Masters tiers, and Greater Montreal has 60+ indoor and outdoor multi-court facilities. Over 60% of adult recreational and Masters entries play doubles or mixed doubles, so multi-player tracking is essential. Outdoor public courts routinely exceed 65 dB of ambient noise, so voice models must sit next to tactile screen controls.",
    howToday:
      "Players call scores out loud. Score disputes require stopping play to find a roaming tournament director. When a match ends, players walk to the desk to report results. The organizer updates a spreadsheet, writes results on a draw board, and manually calls the next match to court. Manual court scoreboards need a person sitting court-side tapping buttons and have no remote connectivity. Enterprise tournament software such as TournamentSoftware or Tennis Canada IPIN handles registration and draws, but not real-time court-level execution. Wearable stroke tools such as SwingVision focus on individual video analysis, not live scoreboards, court rotation, or ads. Basic timer apps track rest intervals but lack tennis scoring logic, rule customization, or organizer dashboard sync. Paper scorecards and whiteboards are free and universal, but they create delays, missing records, and zero revenue.",
    focus: [
      "Hands-free court updates: replace manual tapping with a tablet app driven by the server's verbal point calls (for example 30-15 or Correction).",
      "Real-time multi-court dashboard: connect individual court tablets to a master organizer view that tracks live match states and flags freed courts instantly.",
      "Amateur match variations: singles, doubles and mixed doubles server rotations, plus Fast-Play / Express modes without rest periods.",
      "Digitized court-side monetization: turn idle 90-second changeovers into dynamic ad space for audio and video.",
      "Centralized rules push: override match rules such as No-Ad scoring, a 10-point tiebreaker, or serve clocks globally from the organizer console.",
    ],
    constraints: [
      "Hands-free voice recognition is noisy. Speech-to-text must handle player accents and court noise using keywords such as 40-30, Correction, and Fault, plus a tactile fallback touchscreen.",
      "Tablets on court fences face sun glare and heat. The UI needs ultra-high contrast, large fonts for fans, and explicit audio alerts (a Time call at 80 seconds into a 90-second rest).",
      "Internet drops on distant courts must not crash a match. Record score states locally and push to the organizer dashboard when reconnected.",
      "24-hour hackathon scope: build a 2-court demonstrator with 1 organizer dashboard and 1 court scorer tablet, synced over WebSockets or Firebase.",
    ],
    beforeYouBuild: [
      "How well does voice recognition filter ambient noise or score calls from adjacent courts?",
      "How do you handle disputes?",
      "How are doubles server rotations and receiver order tracked during tiebreaks?",
      "What happens when a player mispronounces a score or the speech model misinterprets a call?",
      "How do local organizers load ad sponsors into the changeover video or audio loop?",
      "How well is the tournament dashboard designed, and how are matches configured?",
      "How well are the scoreboard graphics and animation designed?",
    ],
    deliverable:
      "A 2-court demonstrator: one organizer dashboard and one court scorer tablet, synced in real time. Prize: $250 in Ethereum (ETH) for the top-performing build.",
    extra:
      "Prize: $250 in Ethereum (ETH) for the top-performing build. Selecting this challenge requires an IP grant acknowledgement.",
    example:
      "COURT 2  |  MATCH #104  |  TENNIS MONTREAL OPEN  [LIVE]  [VOICE ACTIVE]\nSERVER  J. Tremblay / A. Roy     Sets 1   Games 4   Points 40   Serve clock 18s\n        (Serving: A. Roy)\nRECEIVER  M. Dubois / P. Lefebvre  Sets 0   Games 2   Points 15   No-Ad / 3rd TB\n        (Receiving: P. Lefebvre)\n[Correction]  [Override]  [Force changeover]  [Call umpire]",
    requiresIpGrant: true,
    ipOwner: "the CourtSide AI sponsor",
  },
];

const CHALLENGE_BY_ID = new Map(CHALLENGES.map((challenge) => [challenge.id, challenge]));

export function getChallenge(id: string): Challenge | undefined {
  return CHALLENGE_BY_ID.get(id);
}

export function publicChallenge(challenge: Challenge) {
  return {
    id: challenge.id,
    group: challenge.group,
    number: challenge.number,
    title: challenge.title,
    tagline: challenge.tagline,
    themes: challenge.themes,
    problem: challenge.problem,
    howToday: challenge.howToday,
    focus: challenge.focus,
    constraints: challenge.constraints,
    beforeYouBuild: challenge.beforeYouBuild,
    deliverable: challenge.deliverable,
    extra: challenge.extra ?? null,
    example: challenge.example ?? null,
    requiresIpGrant: challenge.requiresIpGrant,
    ipOwner: challenge.ipOwner,
    ipGrantText: challenge.requiresIpGrant
      ? ipGrantText(challenge.ipOwner || "the challenge sponsor")
      : null,
  };
}

export function ipGrantText(owner: string): string {
  return `If my team wins this challenge, I grant ${owner} a perpetual, irrevocable, worldwide, royalty-free license to use, reproduce, modify, distribute, and commercially exploit the winning project's source code and related materials, without further permission or compensation. I understand this is a condition of entering this sponsor challenge.`;
}
