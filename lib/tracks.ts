export type GColor = "blue" | "red" | "yellow" | "green";

export type RubricCriterion = {
  name: string;
  points: string;
  description: string;
};

export type RubricPillar = {
  pillar: string;
  weight: string;
  focus: string;
  criteria: RubricCriterion[];
};

export type TrackTitledPoint = {
  title: string;
  description: string;
};

export type TrackProgramDetails = {
  badges: string[];
  conceptOverview: string[];
  challenges: string[];
  purpose: TrackTitledPoint[];
  impact: TrackTitledPoint[];
  rubricIntro: string;
  rubric: RubricPillar[];
  licensing: string;
  attestation: string;
};

export type Track = {
  number: number;
  slug: string;
  /** The app name — e.g. "Image Makeover Studio". This is what learners build. */
  project: string;
  tagline: string;
  color: GColor;
  emoji: string;
  dropIn: boolean;

  /** What ships in 45 minutes — the core feature, no polish. */
  mmv: string;
  /** The aha-moment quote that lands in the room. */
  aha: string;
  /** 2-4 short, participant-facing bullets — what to consider while building this app. */
  thinkAbout: string[];
  /** 3-5 short tech labels participants will touch. */
  tech: string[];

  /** Bullets describing what the polished at-home version pulls in. */
  polished: string[];
  /** context/<file>.md references the starter ships with — safety nets, not requirements. */
  ifStuck: string[];

  starterRepo: string;
  codelabUrl: string;
  videoUrl: string;
  /** Hero screenshot of the polished demo. Empty = render the placeholder. */
  screenshotUrl: string;
  /** 11-char YouTube video ID. When set, the track page embeds the video and uses its poster as the demo image. */
  youtubeId?: string;
  /** Rich program overview, impact, rubric, licensing, and attestation for hackathon initiatives. */
  programDetails?: TrackProgramDetails;
};

/** Cross-track stack — same on every track, rendered in the sidebar alongside the per-track capability. */
export const CODING_JAM_STACK: string[] = [
  "Antigravity (AI-driven IDE)",
  "Python + FastAPI (backend)",
  "uv (package manager)",
  "Google Gemini API",
  "HTML / CSS / JS (frontend)",
];

export const TRACKS: Track[] = [
  {
    number: 1,
    slug: "image-makeover-studio",
    project: "Glow Up",
    tagline: "Selfie + a hairstyle → see the new you.",
    color: "blue",
    emoji: "✨",
    dropIn: true,
    mmv:
      "Upload a selfie. Pick from preset hairstyles. AI does a virtual hair try-on via Vertex AI image generation — same person, new look — and shows before / after side by side.",
    aha: "OMG that's me with bangs.",
    thinkAbout: [
      "Hair only today. No outfits, no facial filters — those are the polished version. The constraint is what gets you to ship.",
      "Your signature detail is what makes your app yours. A sassy stylist note? A vibe rating? Decide before you start typing.",
      "Test on a face you don't recognize first. You'll catch prompt issues faster when there's no emotional read on the result.",
    ],
    tech: ["Vertex AI image generation", "Before/after UI"],
    polished: [
      "Outfit and accessory modes",
      "Custom typed-in prompts",
      "Share button",
      "Side-by-side compare",
      "Lookbook to save favorites",
      "'Rate my friends' group photo",
      "Decade time machine",
    ],
    ifStuck: ["context/image-gen-tryon.md"],
    starterRepo: "https://github.com/gca-americas/codingjam-glow-up",
    codelabUrl: "https://codelabs.developers.google.com/codelabs/coding-jam/instructions#0",
    videoUrl: "https://youtu.be/9tyZT5qqiCE",
    screenshotUrl: "",
    youtubeId: "9tyZT5qqiCE",
  },
  {
    number: 10,
    slug: "ai-for-good",
    project: "AI for Good",
    tagline: "Multi-chapter regional hacking sprints uniting developers around annually rotating societal challenges.",
    color: "green",
    emoji: "🌍",
    dropIn: true,
    mmv:
      "The GDG AI for Good Hackathon is a multi-chapter regional initiative across Google Developer Groups in North America. Local chapters host Fall hacking sprints where developers, designers, students, and domain experts collaborate to build open-source solutions for community-validated problems using Google’s applied AI ecosystem.",
    aha: "Our prototype solves a real local non-profit problem — and any chapter can deploy it.",
    thinkAbout: [
      "Validate the community problem first — ground your solution in real beneficiary personas or direct input from local non-profits and municipal partners.",
      "Use AI where it is genuinely necessary (multimodal inference, agentic orchestration, embeddings) rather than as a bolt-on gimmick.",
      "Build explicit guardrails for safety, grounding, privacy, and WCAG-aligned accessibility from the start.",
      "Design for low-friction handoff, sustainable inference cost efficiency, and Apache 2.0 open-source licensing so community partners can actually run it.",
    ],
    tech: [
      "Agentic orchestration & frameworks",
      "Multimodal inference & embeddings",
      "Responsible AI & safety guardrails",
      "Accessible UI (WCAG-aligned)",
      "Apache 2.0 open-source deployment",
    ],
    polished: [
      "Direct handoff package for local non-profits or municipal agencies",
      "Synthetic evaluation datasets under Creative Commons (CC-BY 4.0 or CC0)",
      "Token & inference cost optimization for resource-constrained orgs",
      "Full WCAG keyboard navigation, contrast, and screen-reader audit",
      "Transparent API dependency mapping & one-click deployment guide",
    ],
    ifStuck: [],
    starterRepo: "",
    codelabUrl: "https://codelabs.developers.google.com/codelabs/coding-jam/instructions#0",
    videoUrl: "",
    screenshotUrl: "",
    programDetails: {
      badges: [
        "Fall Hacking Sprints",
        "100-Point Standard Rubric",
        "Apache 2.0 Open Source",
      ],
      conceptOverview: [
        "The GDG AI for Good Hackathon is a multi-chapter regional initiative across the Google Developer Groups in North America. Rather than running disconnected, one-off hackathons, the initiative unites chapters around an annually rotating societal challenge (such as environmental resilience, digital accessibility, public health informatics, or workforce readiness).",
        "Local chapters host hacking sprints during the Fall period, where developers, designers, students, and domain experts collaborate to build solutions for community-validated problems using Google’s applied AI ecosystem.",
      ],
      challenges: [
        "Environmental Resilience",
        "Digital Accessibility",
        "Public Health Informatics",
        "Workforce Readiness",
      ],
      purpose: [
        {
          title: "Bridging Theory and Community Utility",
          description:
            "Raise awareness of societal challenges and educate the public on the latest AI tools.",
        },
        {
          title: "Democratizing Applied AI",
          description:
            "Provide a concrete on-ramp for participants to master agent frameworks within AI in an applied, ethical problem space.",
        },
        {
          title: "Standardizing Regional Excellence",
          description:
            "Establish a shared evaluation baseline across chapters, fostering cross-chapter collaboration, talent discovery, and measurable impact tracking.",
        },
      ],
      impact: [
        {
          title: "Catalyst for Localized Civic Tech",
          description:
            "Builds a direct bridge between local non-profits, municipal agencies, and GDG talent, delivering actionable open-source repositories to underserved community partners.",
        },
        {
          title: "Regional Talent Pipeline & Cross-Pollination",
          description:
            "Connects collegiate tech enthusiasts, career switchers, and senior engineers across urban and suburban tech corridors, showcasing regional talent to industry sponsors and ecosystem partners.",
        },
      ],
      rubricIntro:
        "This proposed 4-pillar rubric serves as the master scoring guidelines across all chapters and annual iterations to guarantee cross-regional parity.",
      rubric: [
        {
          pillar: "1. Problem Validation & Social Impact",
          weight: "25 Pts",
          focus: "Depth of community relevance, beneficiary focus, and quantifiable real-world value.",
          criteria: [
            {
              name: "Problem Definition",
              points: "10 pts",
              description: "Clearly addresses the annual topic in an authentic, well-scoped way.",
            },
            {
              name: "Impact Multiplier",
              points: "10 pts",
              description: "Demonstrates tangible, measurable benefit to the target audience or community sector.",
            },
            {
              name: "Stakeholder Empathy",
              points: "5 pts",
              description: "Solution reflects direct input or realistic personas representing affected end users.",
            },
          ],
        },
        {
          pillar: "2. Technical Innovation & AI Architecture",
          weight: "25 Pts",
          focus: "Rigor, elegance, and utility of the underlying solution.",
          criteria: [
            {
              name: "AI Integration & Necessity",
              points: "15 pts",
              description:
                "Meaningful use of AI (e.g., multimodal inference, agentic orchestration, embeddings) where AI is genuinely necessary, not a gimmick.",
            },
            {
              name: "Architectural Soundness",
              points: "10 pts",
              description:
                "Stable full-stack execution, robust data pipeline handling, clean code structure, and functional working prototype.",
            },
          ],
        },
        {
          pillar: "3. Responsible AI, Ethics & Accessibility",
          weight: "25 Pts",
          focus: "Safety, equity, bias prevention, transparency, and inclusive design principles.",
          criteria: [
            {
              name: "Safety & Grounding",
              points: "10 pts",
              description:
                "Explicit guardrails against hallucinations, adversarial inputs, bias, and harmful content generation.",
            },
            {
              name: "Privacy & Data Ethics",
              points: "8 pts",
              description:
                "Responsible handling of training data, user confidentiality, and minimal data-collection footprints.",
            },
            {
              name: "Inclusive Design",
              points: "7 pts",
              description:
                "Adherence to accessibility standards (WCAG-aligned UI, keyboard navigation, readable contrasts, screen-reader compatibility).",
            },
          ],
        },
        {
          pillar: "4. Feasibility, Scalability & Sustainability",
          weight: "25 Pts",
          focus: "Viability of handoff, operational cost management, and long-term ecosystem maintenance.",
          criteria: [
            {
              name: "Deployment Viability",
              points: "10 pts",
              description:
                "Low-friction deployment path for resource-constrained community organizations or non-profits.",
            },
            {
              name: "Inference Cost Efficiency",
              points: "8 pts",
              description:
                "Architecture balances token consumption, model sizing, and operational hosting costs sustainably.",
            },
            {
              name: "Documentation & Maintenance",
              points: "7 pts",
              description:
                "Clear setup guides, transparent API dependency mappings, and open-source documentation.",
            },
          ],
        },
      ],
      licensing:
        "Participants retain 100% ownership of all software, models, and intellectual property created during the event; neither Google Developer Groups (GDG), Google LLC, nor host institutions claim any equity or commercial rights in your work. To ensure community and non-profit partners can deploy, maintain, and scale these civic solutions without legal barriers or licensing friction, all builds submitted to the GDG AI for Good track must be released publicly under the Apache License 2.0, with accompanying project documentation and synthetic evaluation datasets shared under Creative Commons (CC-BY 4.0 or CC0).",
      attestation:
        "By submitting to codingjam.dev, teams warrant that their build is original work, free of unauthorized third-party or employer-owned proprietary trade secrets, contains no unscrubbed personally identifiable information (PII), and adheres strictly to upstream AI foundation model terms of service. Entrants grant GDG and local organizing chapters a non-exclusive, perpetual, royalty-free license solely to index, demonstrate, screenshot, and publicize the project across regional leaderboards, promotional media, and DevFest showcases.",
    },
  },
  {
    number: 2,
    slug: "ai-avatar-generator",
    project: "Avatar Studio",
    tagline: "Photo (you OR your pet) + pick a style → one stylized avatar.",
    color: "red",
    emoji: "🤖",
    dropIn: true,
    mmv:
      "Upload a photo — your face OR your pet's face. Pick from four preset styles (e.g. Pixar, anime). AI returns one stylized avatar.",
    aha: "My cat looks like a Pixar character.",
    thinkAbout: [
      "Your input rules are the design — faces only? full body? pets too? Pick one rule and stick to it. It shapes every prompt you write.",
      "One avatar at a time. Bulk generation, animations, multiple sizes — all polished version.",
      "Assume people will share these — your output is the marketing. Pick styles that screenshot well.",
    ],
    tech: ["Style transfer prompts", "Single-image generation"],
    polished: [
      "Generate multiple avatars at once",
      "Animated avatars (subtle motion)",
      "Full character lore generator (name + backstory)",
      "Social media format presets (Twitter PFP, Discord, LinkedIn)",
      "User-defined style prompts",
    ],
    ifStuck: ["context/image-gen-stylization.md"],
    starterRepo: "https://github.com/gca-americas/codingjam-avatar-studio",
    codelabUrl: "https://codelabs.developers.google.com/codelabs/coding-jam/instructions#0",
    videoUrl: "https://youtu.be/d23zmrm1BCs",
    screenshotUrl: "",
    youtubeId: "d23zmrm1BCs",
  },
  {
    number: 3,
    slug: "my-special-year",
    project: "Year in Poetry",
    tagline: "Tell AI your meaningful dates → a year calendar you can read like a poem.",
    color: "yellow",
    emoji: "📅",
    dropIn: true,
    mmv:
      "The participant tells AI the meaningful dates in their life — birthdays, anniversaries, the day they got their dog. AI generates a beautifully designed, scrollable year calendar with a short AI-written warm note for each date ('Grandma's birthday — call her' / 'One year since you and Sam').",
    aha: "My whole year, laid out like a poem.",
    thinkAbout: [
      "Decide who's looking at this — a quiet you-only calendar looks completely different from one printed for the family fridge. The audience drives every visual choice.",
      "Hardcode your dates into the build. Don't construct a date editor today; that's the polished version.",
      "Keep the AI's tone consistent across notes. 'Grandma's birthday — call her' should match the energy of every other line.",
      "Static display. No login, no database, no Google Calendar sync. The constraint is what makes it ship.",
    ],
    tech: ["LLM for warm notes", "Generative layout from your own dates"],
    polished: [
      "Login + edit-your-own-dates flow",
      "Google Calendar sync",
      "Birthday reminder notifications",
      "Family-shared edition",
      "Monthly reflection poem",
      "Photo-per-date upload",
      "Audio bed (ambient soundscape)",
    ],
    ifStuck: ["context/calendar-layout.md", "context/personal-data.md"],
    starterRepo: "https://github.com/gca-americas/codingjam-year-in-poetry",
    codelabUrl: "https://codelabs.developers.google.com/codelabs/coding-jam/instructions#0",
    videoUrl: "https://youtu.be/WviNDBWFeek",
    screenshotUrl: "",
    youtubeId: "WviNDBWFeek",
  },
  {
    number: 4,
    slug: "fridge-to-recipe",
    project: "FridgeChef",
    tagline: "Type what's in your fridge → one recipe (with food photo).",
    color: "green",
    emoji: "🧊",
    dropIn: true,
    mmv:
      "One text box: 'what's in your fridge?' One button. AI returns one recipe — title, ingredients, steps — plus an AI-generated photo of the dish.",
    aha: "It actually used my random ingredients. And the photo looks like food.",
    thinkAbout: [
      "One recipe back, not three. The constraint is the whole point — you're not building a meal planner today.",
      "Don't skip the dish photo because text feels safer. The image is what makes the result feel real.",
      "The AI's culinary voice IS the personality. Is your chef a strict budget planner, a supportive grandma, or a Michelin-starred chef? Pick one and write the prompt for it.",
      "Resist adding pantry / dietary / budget filters. Those are the polished version — every one of them is its own rabbit hole.",
    ],
    tech: ["Recipe text + dish image generation", "Voice-driven prompt"],
    polished: [
      "Mode picker (quick / grandma / budget / healthy / fancy)",
      "Local grocery store integration",
      "Shopping list generator",
      "Dietary preferences",
      "Family meal planner",
      "Photo input — show your fridge instead of typing",
      "Save & share recipe gallery",
    ],
    ifStuck: ["context/image-gen-food.md"],
    starterRepo: "https://github.com/gca-americas/codingjam-fridge-chef",
    codelabUrl: "https://codelabs.developers.google.com/codelabs/coding-jam/instructions#0",
    videoUrl: "https://youtu.be/dpzHIClbkyI",
    screenshotUrl: "",
    youtubeId: "dpzHIClbkyI",
  },
  {
    number: 5,
    slug: "reflective-journal",
    project: "Mood Jar",
    tagline: "Type how you're feeling → a little token drops into your jar.",
    color: "blue",
    emoji: "🫙",
    dropIn: true,
    mmv:
      "One text box: type what's on your mind. AI generates a mood sticker/item — kawaii emoji, glowing orb, tiny potion, pixel-art object — and drops it into a visual 'jar' on the page. The jar fills up as you keep writing.",
    aha: "My scattered thoughts just turned into a cute little token in my jar.",
    thinkAbout: [
      "The visual aesthetic of the tokens IS the soul of the app. Kawaii emojis, glowing orbs, tiny potions, pixel-art objects — pick a vibe and stay there.",
      "The jar is a simple container today. No physics, no falling animations, no settling — that's the polished version. Items just appear inside.",
      "No persistence across sessions. The 'jar that fills over weeks' is the magical polished version — leave it as a reason to come back.",
      "One token per submission. Don't generate a grid of options. The serendipity of one is part of the feel.",
    ],
    tech: ["LLM for mood interpretation", "Image generation for tokens"],
    polished: [
      "Local storage so the jar persists",
      "Animated physics (tokens settle, jar tilts)",
      "Multi-day pattern detection",
      "Cross-device sync",
      "Mood history charts",
      "Share-your-jar mode",
      "Voice memo input",
    ],
    ifStuck: ["context/persona-prompt-pattern.md"],
    starterRepo: "https://github.com/gca-americas/codingjam-moodjar",
    codelabUrl: "https://codelabs.developers.google.com/codelabs/coding-jam/instructions#0",
    videoUrl: "https://youtu.be/MqNxjZZlEEQ",
    screenshotUrl: "",
    youtubeId: "MqNxjZZlEEQ",
  },
  {
    number: 6,
    slug: "one-page-portfolio",
    project: "My Corner",
    tagline: "Name + bio + 3 things → a live URL you can text your mom.",
    color: "red",
    emoji: "🏠",
    dropIn: true,
    mmv:
      "Single page. Name, 2-line bio, 3 things you're proud of, one photo. Deploy to a real URL via Vercel/Netlify drag-and-drop. That's it.",
    aha: "I have a website I can text my mom.",
    thinkAbout: [
      "The hardest input is you. Say it out loud to the room to get unstuck — it's much easier to describe yourself when someone else is asking.",
      "Pick the photo before the bio. The photo sets the tone for everything else on the page.",
      "A live URL today beats a perfect site next week. Drag-and-drop deploy first; iterate on copy after.",
      "Resist adding a blog, a contact form, a guestbook. All polished version — every one is its own afternoon.",
    ],
    tech: ["Static site deploy (Vercel/Netlify)"],
    polished: [
      "Custom domain",
      "Blog/log section",
      "Contact form",
      "Guestbook",
      "Seasonal/animated theme",
      "Links-tree mode",
      "AI-generated 'sounds like you' refinements",
    ],
    ifStuck: ["context/deploy-to-vercel.md", "context/self-writing-prompts.md"],
    starterRepo: "https://github.com/gca-americas/codingjam-my-corner",
    codelabUrl: "https://codelabs.developers.google.com/codelabs/coding-jam/instructions#0",
    videoUrl: "https://youtu.be/gPu54YWqy6k",
    screenshotUrl: "",
    youtubeId: "gPu54YWqy6k",
  },
  {
    number: 7,
    slug: "resume-tailor",
    project: "BulletProof",
    tagline: "Paste resume + paste job → tailored bullets.",
    color: "yellow",
    emoji: "💼",
    dropIn: true,
    mmv:
      "Two text boxes — paste resume text, paste job posting text. One button. AI returns tailored resume bullets, ready to copy. No PDF parsing, no cover letter, no interview prep, no Word export.",
    aha: "This is actually better than what I'd write.",
    thinkAbout: [
      "'Not building' is the lesson today. Skip the cover letter, the PDF parsing, the ATS scoring — every one of those is the polished version.",
      "Paste the whole job posting, not just the title. The full text is half the prompt's quality.",
      "Read the bullets the AI returns out loud. If you wouldn't actually say them in an interview, your prompt needs work — not the AI.",
      "Ruthless focus is the personality. What you refuse to build is what makes this ship in 45 minutes.",
    ],
    tech: ["Long-context tailoring"],
    polished: [
      "Match score + missing keywords",
      "PDF parsing for resume input",
      "Cover letter generator",
      "Interview question generator",
      "Networking message writer",
      "Application tracker",
      "ATS scoring",
    ],
    ifStuck: ["context/long-context-handling.md", "context/text-diff-pattern.md"],
    starterRepo: "https://github.com/gca-americas/codingjam-bulletproof",
    codelabUrl: "https://codelabs.developers.google.com/codelabs/coding-jam/instructions#0",
    videoUrl: "https://youtu.be/xTxW3euV9kw",
    screenshotUrl: "",
    youtubeId: "xTxW3euV9kw",
  },
  {
    number: 8,
    slug: "ai-character-chat",
    project: "Character Chat",
    tagline: "Define one character → chat with them.",
    color: "green",
    emoji: "🎭",
    dropIn: true,
    mmv:
      "Define one character (name + 1-paragraph personality + 1 thing they'd never say). Chat with them — up to 5 messages back and forth. No persistent memory across sessions.",
    aha: "I made this person and I'm talking to them.",
    thinkAbout: [
      "One paragraph of personality + one thing they'd never say. That's the whole spec. Adding more makes the character generic, not deeper.",
      "The 'never say' rule is the secret weapon — constraints create authenticity. Without it, every character sounds the same.",
      "Five messages is a feature, not a limit. It forces you to test the persona itself, not the chat scrollback.",
      "Bring your own character. No menu, no template to copy — this one is the open canvas.",
    ],
    tech: ["Persona design + chat guardrails"],
    polished: [
      "Persistent memory across sessions",
      "Character avatars and voices",
      "Multi-character world",
      "Reverse mode (you play the character)",
      "In-character safety guardrails",
      "Themed visual packs (anime, sci-fi, noir)",
    ],
    ifStuck: ["context/character-system-prompts.md", "context/character-guardrails.md"],
    starterRepo: "https://github.com/gca-americas/codingjam-character-chat",
    codelabUrl: "https://codelabs.developers.google.com/codelabs/coding-jam/instructions#0",
    videoUrl: "https://youtu.be/xFtSxF0ZM0g",
    screenshotUrl: "",
    youtubeId: "xFtSxF0ZM0g",
  },
  {
    number: 9,
    slug: "build-your-own-idea",
    project: "Your Own Idea",
    tagline: "No menu. No template. The thing you've been daydreaming about.",
    color: "blue",
    emoji: "💡",
    dropIn: true,
    mmv:
      "Bring an idea you've been sitting on — write a 1-paragraph PRD, hand it to Antigravity, and ship a working slice in 45 minutes. No starter repo. No menu. Just your spec and your taste.",
    aha: "I built the thing that was only in my head.",
    thinkAbout: [
      "One paragraph of PRD beats a backlog. If you can't describe it in three sentences, you can't ship it in 45 minutes.",
      "Pick the smallest version of the idea that's still recognizable — one core flow, one screen, no settings.",
      "Your signature detail matters more here than anywhere else. There's no demo to copy from, so the soul has to come from you.",
      "Stuck on prompting? Steal from the other tracks — image gen, RAG, persona design, agent loops are all fair game.",
    ],
    tech: ["Whatever your idea needs"],
    polished: [
      "Whatever the at-home version of your idea looks like.",
      "Steal patterns from tracks 1-8 — they're reference implementations now.",
      "Polish pass: empty states, error states, the one delightful detail.",
    ],
    ifStuck: [],
    starterRepo: "",
    codelabUrl: "https://codelabs.developers.google.com/codelabs/coding-jam/instructions#0",
    videoUrl: "",
    screenshotUrl: "",
  },
];

export const colorClasses: Record<
  GColor,
  { bg: string; bgSoft: string; text: string; border: string; ring: string; chip: string; gradient: string; hex: string }
> = {
  blue: {
    bg: "bg-gblue",
    bgSoft: "bg-gblue/10",
    text: "text-gblue",
    border: "border-gblue",
    ring: "ring-gblue",
    chip: "bg-gblue/10 text-gblue",
    gradient: "from-gblue/90 to-gblue/60",
    hex: "#4285F4",
  },
  red: {
    bg: "bg-gred",
    bgSoft: "bg-gred/10",
    text: "text-gred",
    border: "border-gred",
    ring: "ring-gred",
    chip: "bg-gred/10 text-gred",
    gradient: "from-gred/90 to-gred/60",
    hex: "#EA4335",
  },
  yellow: {
    bg: "bg-gyellow",
    bgSoft: "bg-gyellow/10",
    text: "text-gyellow",
    border: "border-gyellow",
    ring: "ring-gyellow",
    chip: "bg-gyellow/15 text-yellow-700",
    gradient: "from-gyellow/90 to-gyellow/60",
    hex: "#FBBC04",
  },
  green: {
    bg: "bg-ggreen",
    bgSoft: "bg-ggreen/10",
    text: "text-ggreen",
    border: "border-ggreen",
    ring: "ring-ggreen",
    chip: "bg-ggreen/10 text-ggreen",
    gradient: "from-ggreen/90 to-ggreen/60",
    hex: "#34A853",
  },
};

export function getTrack(slug: string): Track | undefined {
  return TRACKS.find((t) => t.slug === slug);
}

/** Two-digit display label, e.g. "01", "08". */
export function trackLabel(n: number): string {
  return n.toString().padStart(2, "0");
}

