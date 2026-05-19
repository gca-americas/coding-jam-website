export type GColor = "blue" | "red" | "yellow" | "green";

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
  /** The one paragraph guiding the facilitator on what Spec Talk question to emphasize this week. */
  specTalkEmphasis: string;
  /** context/<file>.md references the starter ships with — safety nets, not requirements. */
  ifStuck: string[];

  starterRepo: string;
  codelabUrl: string;
  slidesUrl: string;
  videoUrl: string;
  /** Hero screenshot of the polished demo. Empty = render the placeholder. */
  screenshotUrl: string;
  /** 11-char YouTube video ID. When set, the track page embeds the video and uses its poster as the demo image. */
  youtubeId?: string;
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
    specTalkEmphasis:
      "This is the participants' first Spec Talk. The facilitator walks the room through it live — showing how 2 minutes of talking shapes the next 45 minutes of building. Question 4 (the signature detail) gets extra attention this week, because everyone's making a 'try-on' app — the signature is what makes theirs different from the person sitting next to them. Maybe one app writes a sassy stylist note. Another adds a 'vibe rating.' Same scaffolding, different soul. In Antigravity, the signature detail lives in the PRD — name it explicitly and the UI doc picks it up automatically.",
    ifStuck: ["context/image-gen-tryon.md"],
    starterRepo: "https://github.com/cuppibla/codingjam-glow-up",
    codelabUrl: "https://github.com/cuppibla/coding-jam-codelab/blob/main/coding-jam/codelab.md",
    slidesUrl: "#",
    videoUrl: "https://youtu.be/9tyZT5qqiCE",
    screenshotUrl: "",
    youtubeId: "9tyZT5qqiCE",
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
    specTalkEmphasis:
      "Participants run more of the Spec Talk solo. The facilitator steps in for tricky questions. Question 2 (input/output) is where the real design work happens — does the app accept any photo, or only faces? Does it generate one avatar or 4 at once? Does it work on full-body photos or just close-ups? Get this tight in the Spec Talk and the UI doc Antigravity generates comes back almost finished.",
    ifStuck: ["context/image-gen-stylization.md"],
    starterRepo: "https://github.com/cuppibla/codingjam-avatar-studio",
    codelabUrl: "https://github.com/cuppibla/coding-jam-codelab/blob/main/coding-jam/codelab.md",
    slidesUrl: "#",
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
      "During the Spec Talk, the participant tells AI the meaningful dates in their life — birthdays, anniversaries, the day they got their dog. AI generates a beautifully designed, scrollable year calendar with a short AI-written warm note for each date ('Grandma's birthday — call her' / 'One year since you and Sam').",
    aha: "My whole year, laid out like a poem.",
    thinkAbout: [
      "Decide who's looking at this — a quiet you-only calendar looks completely different from one printed for the family fridge. The audience drives every visual choice.",
      "Hardcode your dates from the Spec Talk into the build. Don't construct a date editor today; that's the polished version.",
      "Keep the AI's tone consistent across notes. 'Grandma's birthday — call her' should match the energy of every other line.",
      "Static display. No login, no database, no Google Calendar sync. The constraint is what makes it ship.",
    ],
    tech: ["LLM for warm notes", "Generative layout from Spec-Talk data"],
    polished: [
      "Login + edit-your-own-dates flow",
      "Google Calendar sync",
      "Birthday reminder notifications",
      "Family-shared edition",
      "Monthly reflection poem",
      "Photo-per-date upload",
      "Audio bed (ambient soundscape)",
    ],
    specTalkEmphasis:
      "Question 1 (the magical moment) is the star this week. Who's looking at this calendar? Just them, alone, on a quiet evening? Their family, printed and on the fridge? A version they can share online? The answer drives every visual decision. This is the week where participants discover that the magical moment isn't always 'wow factor' — sometimes it's 'feels like home.' Name that feeling in the PRD's opening paragraph; the UI doc inherits the whole mood from one sentence.",
    ifStuck: ["context/calendar-layout.md", "context/personal-data-from-spectalk.md"],
    starterRepo: "https://github.com/cuppibla/codingjam-year-in-poetry",
    codelabUrl: "https://github.com/cuppibla/coding-jam-codelab/blob/main/coding-jam/codelab.md",
    slidesUrl: "#",
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
    specTalkEmphasis:
      "Halfway point. Participants now run the entire Spec Talk solo. The facilitator observes and helps individuals who get stuck rather than facilitating the whole room. Watch for Question 5 (not-building) — the temptation to add pantry / dietary / budget filters here is enormous. If a participant adds them to the PRD, they will appear in the build. The PRD is the gate.",
    ifStuck: ["context/image-gen-food.md"],
    starterRepo: "https://github.com/cuppibla/codingjam-fridge-chef",
    codelabUrl: "https://github.com/cuppibla/coding-jam-codelab/blob/main/coding-jam/codelab.md",
    slidesUrl: "#",
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
    specTalkEmphasis:
      "Question 3 (Personality) becomes the heart of this week's Spec Talk — the AI's tone is the whole product. The facilitator highlights this so participants notice they're using the Spec Talk to make a real design decision, not just describe a feature. The personality goes verbatim into the PRD's voice section. Antigravity's engineering doc inherits it as the system prompt.",
    ifStuck: ["context/persona-prompt-pattern.md"],
    starterRepo: "https://github.com/cuppibla/codingjam-moodjar",
    codelabUrl: "https://github.com/cuppibla/coding-jam-codelab/blob/main/coding-jam/codelab.md",
    slidesUrl: "#",
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
      "The hardest input is you. Use the Spec Talk to get unstuck — out loud, with the room. It's much easier to describe yourself when someone else is asking.",
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
    specTalkEmphasis:
      "This is the hardest Spec Talk because the topic is them. Most people freeze when asked 'what's your magical moment?' about themselves. The facilitator names this out loud and lets the room sit with it. The skill being practiced is using the Spec Talk for self-reflection — a transferable life skill. The PRD they write today is the first time many of them will have written a one-page spec about themselves.",
    ifStuck: ["context/deploy-to-vercel.md", "context/self-writing-prompts.md"],
    starterRepo: "https://github.com/cuppibla/codingjam-my-corner",
    codelabUrl: "https://github.com/cuppibla/coding-jam-codelab/blob/main/coding-jam/codelab.md",
    slidesUrl: "#",
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
    specTalkEmphasis:
      "Question 5 (What you're NOT building today) is the star this week — there are SO many tempting features (cover letter! PDF! interview prep!). The facilitator uses this week to drive home that 'not building' is what makes 45 minutes possible. The not-building list goes into the PRD as an explicit non-goals section. Antigravity respects it; without it, scope creep makes the build doc twice as long.",
    ifStuck: ["context/long-context-handling.md", "context/text-diff-pattern.md"],
    starterRepo: "https://github.com/cuppibla/codingjam-bulletproof",
    codelabUrl: "https://github.com/cuppibla/coding-jam-codelab/blob/main/coding-jam/codelab.md",
    slidesUrl: "#",
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
      "Run YOUR Spec Talk on YOUR character. No menu, no demo to copy — this is the open canvas. The Spec Talk works on anything you bring to it.",
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
    specTalkEmphasis:
      "Open canvas. Participants run the Spec Talk on their own original idea — no menu, no demo to copy. This is the graduation moment. The Spec Talk works on anything. Now they prove it — write a PRD from scratch, run it through Antigravity, ship the build.",
    ifStuck: ["context/character-system-prompts.md", "context/character-guardrails.md"],
    starterRepo: "https://github.com/cuppibla/codingjam-character-chat",
    codelabUrl: "https://github.com/cuppibla/coding-jam-codelab/blob/main/coding-jam/codelab.md",
    slidesUrl: "#",
    videoUrl: "https://youtu.be/xFtSxF0ZM0g",
    screenshotUrl: "",
    youtubeId: "xFtSxF0ZM0g",
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

/** The 5 Spec Talk questions — referenced on the about page and in per-track facilitator notes. */
export const SPEC_TALK_QUESTIONS: Array<{ n: number; name: string; ask: string }> = [
  {
    n: 1,
    name: "Magical moment",
    ask: "Who's looking at this and what feeling are we going for?",
  },
  {
    n: 2,
    name: "Input / output",
    ask: "What does the app take in, exactly? What does it give back?",
  },
  {
    n: 3,
    name: "Personality",
    ask: "What's the AI's tone? Witty? Quiet? Stern? Encouraging?",
  },
  {
    n: 4,
    name: "Signature detail",
    ask: "What's the one thing that makes ours different from the person next to us?",
  },
  {
    n: 5,
    name: "Not building today",
    ask: "What are we explicitly NOT shipping? Name it out loud.",
  },
];
