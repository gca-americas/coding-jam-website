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
};

export const TRACKS: Track[] = [
  {
    number: 1,
    slug: "image-makeover-studio",
    project: "Image Makeover Studio",
    tagline: "Photo + pick a mode → see the new you.",
    color: "blue",
    emoji: "✨",
    dropIn: true,
    mmv:
      "Upload a selfie. Pick one mode (hairstyle OR outfit) — you decide in your Spec Talk. Pick from 4 presets in that mode. See before / after side by side.",
    aha: "OMG that's me with bangs.",
    thinkAbout: [
      "Pick ONE mode in your Spec Talk — hairstyle OR outfit. Trying both doubles the prompt work and you won't ship.",
      "Your signature detail is what makes your app yours. A sassy stylist note? A vibe rating? Decide before you start typing.",
      "Test on a face you don't recognize first. You'll catch prompt issues faster when there's no emotional read on the result.",
    ],
    tech: ["Image generation API", "Image input", "Before/after UI", "Preset prompts"],
    polished: [
      "Both modes (hairstyle + outfit) at once",
      "Custom typed-in prompts",
      "Share button",
      "Side-by-side compare",
      "Lookbook to save favorites",
      "'Rate my friends' group photo",
      "Decade time machine",
    ],
    specTalkEmphasis:
      "This is the participants' first Spec Talk. The facilitator walks the room through it live — showing how 2 minutes of talking shapes the next 45 minutes of building. Question 4 (the signature detail) gets extra attention this week, because everyone's making a 'try-on' app — the signature is what makes theirs different from the person sitting next to them. Maybe one app writes a sassy stylist note. Another adds a 'vibe rating.' Same scaffolding, different soul.",
    ifStuck: ["context/image-gen-tryon.md"],
    starterRepo: "https://github.com/gdg-coding-jams/image-makeover-studio",
    codelabUrl: "https://codelabs.developers.google.com/coding-jams/image-makeover-studio",
    slidesUrl: "#",
    videoUrl: "#",
    screenshotUrl: "",
  },
  {
    number: 2,
    slug: "ai-avatar-generator",
    project: "AI Avatar Generator",
    tagline: "Photo (you OR your pet) + pick a style → stylized avatar.",
    color: "red",
    emoji: "🤖",
    dropIn: true,
    mmv:
      "Upload a photo (your face OR your pet's face — your choice). Pick from 4 preset styles (Pixar, anime, oil painting, pixel art). See the stylized avatar.",
    aha: "My cat looks like a Pixar character.",
    thinkAbout: [
      "Decide your input rules upfront: any photo, only faces, only people, pets too? It changes every prompt you write.",
      "Four styles ships clean. Eight becomes a UI problem. Save the extras for the polished version.",
      "Assume people will share these — your output is the marketing. Pick styles that screenshot well.",
    ],
    tech: ["Image generation API", "Style transfer prompts", "Image input", "Preset palette"],
    polished: [
      "Generate multiple avatars at once",
      "Animated avatars (subtle motion)",
      "Full character lore generator (name + backstory)",
      "Social media format presets (Twitter PFP, Discord, LinkedIn)",
    ],
    specTalkEmphasis:
      "Participants run more of the Spec Talk solo. The facilitator steps in for tricky questions. Question 2 (input/output) is where the real design work happens — does the app accept any photo, or only faces? Does it generate one avatar or 4 at once? Does it work on full-body photos or just close-ups? These are the kinds of decisions that make a real spec different from a wish.",
    ifStuck: ["context/image-gen-stylization.md"],
    starterRepo: "https://github.com/gdg-coding-jams/ai-avatar-generator",
    codelabUrl: "https://codelabs.developers.google.com/coding-jams/ai-avatar-generator",
    slidesUrl: "#",
    videoUrl: "#",
    screenshotUrl: "",
  },
  {
    number: 3,
    slug: "my-special-year",
    project: "My Special Year",
    tagline: "Tell AI your meaningful dates → a beautiful year calendar.",
    color: "yellow",
    emoji: "📅",
    dropIn: true,
    mmv:
      "During the Spec Talk, the participant tells AI the meaningful dates in their life — birthdays, anniversaries, the day they got their dog, the date they moved cities. AI generates a beautifully designed scrollable year calendar where those dates are highlighted with a short warm note AI wrote ('Grandma's birthday — call her' / 'One year since you and Sam').",
    aha: "My whole year, laid out like a poem.",
    thinkAbout: [
      "Decide who's looking at this — a quiet you-only calendar looks completely different from one printed for the family fridge. The audience drives every visual choice.",
      "Hardcode your dates from the Spec Talk into the build. Don't construct a date editor today; that's the polished version.",
      "Keep the AI's tone consistent across notes. 'Grandma's birthday — call her' should match the energy of every other line.",
      "Static display. No login, no database, no calendar API. The constraint is what makes it ship.",
    ],
    tech: ["LLM for warm notes", "Generative layout", "Scrollable design", "Spec-Talk-to-data pattern"],
    polished: [
      "Login + edit-your-own-dates flow",
      "Google Calendar sync",
      "Birthday reminder notifications",
      "Family-shared calendar",
      "AI-generated poetic name for each special day",
      "Monthly reflection poem",
      "Photo-per-date upload",
    ],
    specTalkEmphasis:
      "Question 1 (the magical moment) is the star this week. Who's looking at this calendar? Just them, alone, on a quiet evening? Their family, printed and on the fridge? A version they can share online? The answer drives every visual decision. This is the week where participants discover that the magical moment isn't always 'wow factor' — sometimes it's 'feels like home.'",
    ifStuck: ["context/calendar-layout.md", "context/personal-data-from-spectalk.md"],
    starterRepo: "https://github.com/gdg-coding-jams/my-special-year",
    codelabUrl: "https://codelabs.developers.google.com/coding-jams/my-special-year",
    slidesUrl: "#",
    videoUrl: "#",
    screenshotUrl: "",
  },
  {
    number: 4,
    slug: "fridge-to-recipe",
    project: "Fridge to Recipe",
    tagline: "Type what's in your fridge → one recipe with a photo.",
    color: "green",
    emoji: "🥗",
    dropIn: true,
    mmv:
      "One text box: 'what's in your fridge?' One button. AI returns one recipe (title, ingredients, steps) with a generated photo.",
    aha: "It actually used my random ingredients.",
    thinkAbout: [
      "One recipe back, not three. The constraint is the whole point — you're not building a meal planner today.",
      "Don't skip the dish photo because text feels safer. The image is what makes the result feel real.",
      "Resist adding pantry / dietary / budget filters. Those are the polished version — every one of them is its own rabbit hole.",
    ],
    tech: ["LLM for recipe text", "Image generation for the dish", "Single-screen UI"],
    polished: [
      "Local grocery store integration",
      "Shopping list generator",
      "Dietary preferences",
      "Family meal planner",
      "'What would Grandma make' mode",
      "$50/week budget mode",
      "Photo input — show your fridge instead of typing",
    ],
    specTalkEmphasis:
      "Halfway point. Participants now run the entire Spec Talk solo. The facilitator observes and helps individuals who get stuck rather than facilitating the whole room.",
    ifStuck: ["context/image-gen-food.md"],
    starterRepo: "https://github.com/gdg-coding-jams/fridge-to-recipe",
    codelabUrl: "https://codelabs.developers.google.com/coding-jams/fridge-to-recipe",
    slidesUrl: "#",
    videoUrl: "#",
    screenshotUrl: "",
  },
  {
    number: 5,
    slug: "reflective-journal",
    project: "Reflective Journal",
    tagline: "Type your day → one art piece + one gentle question back.",
    color: "blue",
    emoji: "📓",
    dropIn: true,
    mmv:
      "One text box for the day's entry. AI generates one piece of art capturing the mood + asks one gentle reflection question. No saving across sessions.",
    aha: "It really got what I was feeling.",
    thinkAbout: [
      "The AI's tone IS the product. Write the personality prompt three times before you settle. Pick the one that doesn't feel like a productivity app.",
      "One reflection question back, not three. The constraint forces the AI to choose what matters most.",
      "Don't persist entries today. The 'open it again tomorrow' magic is the whole job of the polished version — leave it as a reason to come back.",
    ],
    tech: ["Persona prompts", "Image generation for mood art", "Single text input"],
    polished: [
      "Local storage so entries persist",
      "Multi-day pattern detection",
      "Voice memo input",
      "Daily tarot prompt",
      "Year-end 'highlight reel'",
      "Letter-to-future-self",
    ],
    specTalkEmphasis:
      "Question 3 (Personality) becomes the heart of this week's Spec Talk — the AI's tone is the whole product. The facilitator highlights this so participants notice they're using the Spec Talk to make a real design decision, not just describe a feature.",
    ifStuck: ["context/persona-prompt-pattern.md"],
    starterRepo: "https://github.com/gdg-coding-jams/reflective-journal",
    codelabUrl: "https://codelabs.developers.google.com/coding-jams/reflective-journal",
    slidesUrl: "#",
    videoUrl: "#",
    screenshotUrl: "",
  },
  {
    number: 6,
    slug: "one-page-portfolio",
    project: "One-Page Portfolio",
    tagline: "Name + bio + 3 things → a live URL.",
    color: "red",
    emoji: "🌐",
    dropIn: true,
    mmv:
      "Single page. Name, 2-line bio, 3 things you're proud of, one photo. Deployed to a real URL via Vercel/Netlify drag-and-drop.",
    aha: "I have a website I can text my mom.",
    thinkAbout: [
      "The hardest input is you. Use the Spec Talk to get unstuck — out loud, with the room. It's much easier to describe yourself when someone else is asking.",
      "Pick the photo before the bio. The photo sets the tone for everything else on the page.",
      "A live URL today beats a perfect site next week. Drag-and-drop deploy first; iterate on copy after.",
    ],
    tech: ["Static site generation", "Vercel/Netlify deploy", "Single-page HTML/CSS"],
    polished: [
      "Custom domain",
      "Blog/log section",
      "Contact form",
      "Guestbook",
      "Seasonal/animated theme",
      "Links-tree mode",
    ],
    specTalkEmphasis:
      "This is the hardest Spec Talk because the topic is them. Most people freeze when asked 'what's your magical moment?' about themselves. The facilitator names this out loud and lets the room sit with it. The skill being practiced is using the Spec Talk for self-reflection — a transferable life skill.",
    ifStuck: ["context/deploy-to-vercel.md", "context/self-writing-prompts.md"],
    starterRepo: "https://github.com/gdg-coding-jams/one-page-portfolio",
    codelabUrl: "https://codelabs.developers.google.com/coding-jams/one-page-portfolio",
    slidesUrl: "#",
    videoUrl: "#",
    screenshotUrl: "",
  },
  {
    number: 7,
    slug: "resume-tailor",
    project: "Resume Tailor",
    tagline: "Paste resume + paste job → tailored bullets.",
    color: "yellow",
    emoji: "💼",
    dropIn: true,
    mmv:
      "Two text boxes — paste resume, paste job posting. One button. AI returns tailored bullets. No PDF parsing, no cover letter, no Word export.",
    aha: "This is actually better than what I'd write.",
    thinkAbout: [
      "'Not building' is the lesson today. Skip the cover letter, the PDF parsing, the ATS scoring — every one of those is the polished version.",
      "Paste the whole job posting, not just the title. The full text is half the prompt's quality.",
      "Read the bullets the AI returns out loud. If you wouldn't actually say them in an interview, your prompt needs work — not the AI.",
    ],
    tech: ["LLM for tailoring", "Long-context handling", "Two-textarea UI"],
    polished: [
      "PDF parsing for resume input",
      "Cover letter generator",
      "Interview question generator",
      "Networking message writer",
      "Application tracker",
      "ATS scoring",
    ],
    specTalkEmphasis:
      "Question 5 (What you're NOT building today) is the star this week — there are SO many tempting features (cover letter! PDF! interview prep!). The facilitator uses this week to drive home that 'not building' is what makes 45 minutes possible.",
    ifStuck: ["context/long-context-handling.md", "context/text-diff-pattern.md"],
    starterRepo: "https://github.com/gdg-coding-jams/resume-tailor",
    codelabUrl: "https://codelabs.developers.google.com/coding-jams/resume-tailor",
    slidesUrl: "#",
    videoUrl: "#",
    screenshotUrl: "",
  },
  {
    number: 8,
    slug: "ai-character-chat",
    project: "AI Character Chat",
    tagline: "Define one character → chat with them.",
    color: "green",
    emoji: "🎭",
    dropIn: true,
    mmv:
      "Define one character (name + 1-paragraph personality + a thing they'd never say). Chat window. 5-message conversation possible. No persistent memory.",
    aha: "I made this person and I'm talking to them.",
    thinkAbout: [
      "One paragraph of personality + one thing they'd never say. That's the whole spec. Adding more makes the character generic, not deeper.",
      "Five messages is a feature, not a limit. It forces you to test the persona itself, not the chat scrollback.",
      "Run YOUR Spec Talk on YOUR character. No menu, no demo to copy — this is the open canvas. The Spec Talk works on anything you bring to it.",
    ],
    tech: ["Chat UI", "System prompts", "Persona design", "Conversation guardrails"],
    polished: [
      "Persistent memory across sessions",
      "Character avatars and voices",
      "Multi-character world",
      "Reverse mode (you play the character)",
      "In-character safety guardrails",
    ],
    specTalkEmphasis:
      "Open canvas. Participants run the Spec Talk on their own original idea — no menu, no demo to copy. This is the graduation moment. The Spec Talk works on anything. Now they prove it.",
    ifStuck: ["context/character-system-prompts.md", "context/character-guardrails.md"],
    starterRepo: "https://github.com/gdg-coding-jams/ai-character-chat",
    codelabUrl: "https://codelabs.developers.google.com/coding-jams/ai-character-chat",
    slidesUrl: "#",
    videoUrl: "#",
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
