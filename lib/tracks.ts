export type GColor = "blue" | "red" | "yellow" | "green";

/**
 * The track catalog — the single source of truth for what a room can build.
 *
 * ── Adding a track ──────────────────────────────────────────────────────────
 * Append one object to TRACKS below. That is the whole job: every surface reads
 * from this array, so a new entry appears on the home page, /tracks, the jam
 * topic picker and the organizer notes with no other edit.
 *
 * ── Removing a track ────────────────────────────────────────────────────────
 * Delete its object, then add a redirect for its old URL in next.config.mjs so
 * shared links keep working. Nothing else references a track by name.
 *
 * Identity is the `slug`, never a number. Numbers were the old scheme and made
 * removal painful — every later track had to shift up, and submissions store
 * the number they were made with. `number` now survives only on the two
 * original drop-in projects, so their existing submissions still resolve.
 *
 * ── Two kinds ───────────────────────────────────────────────────────────────
 *   "open"     Names a capability and one requirement; each participant decides
 *              what to build. Most tracks are these.
 *   "project"  A complete, prescribed app with a brief and a starter repo, for
 *              a room that would rather follow along.
 */
export type TrackKind = "open" | "project";

export type TrackLevel = 1 | 2 | 3 | 4;

/** How far a participant gets in one tool during the 45-minute build block. */
export type ToolFit = {
  /** 4: no obstacles. 1: the wrong tool for this track. */
  level: TrackLevel;
  note: string;
};

/**
 * Organizer-facing notes.
 *
 * Nothing is demonstrated at the start of an open track: whatever an organizer
 * shows becomes the room's default, which turns an open track into a prescribed
 * one. So the organizer sets the boundary, watches for one failure mode, and
 * finds the divergence at the end.
 */
export type FacilitatorNotes = {
  openWith: string;
  watchFor: string;
  fishFor: string;
};

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

export type TrackProgramDetails = {
  badges: string[];
  conceptOverview: string[];
  challenges: string[];
  purpose: { title: string; description: string }[];
  impact: { title: string; description: string }[];
  rubricIntro: string;
  rubric: RubricPillar[];
  licensing: string;
  attestation: string;
};

export type Track = {
  kind: TrackKind;
  /** URL slug and identity. Used at /tracks/<slug> and stored on jams. */
  slug: string;
  name: string;
  /** One sentence: what participants build, and what they decide. */
  summary: string;
  color: GColor;
  emoji: string;
  tech: string[];
  codelab?: { title: string; url: string };
  video?: { url: string; youtubeId: string };
  datasets?: { label: string; url: string }[];
  aiStudio: ToolFit;
  antigravity: ToolFit;
  facilitator: FacilitatorNotes;
  programDetails?: TrackProgramDetails;

  /* ── kind: "open" ──────────────────────────────────────────────────────── */
  /** The single rule every participant works under. */
  requirement?: string;
  /** Starting points. Participants are not required to use them. */
  examples?: string[];
  /** Constraints and advice for the build block. */
  guidance?: string[];
  /** What each participant has when the session ends. */
  outcome?: string;

  /* ── kind: "project" ───────────────────────────────────────────────────── */
  /** Display number. Only on the original drop-in projects. */
  number?: number;
  /** What ships in 45 minutes. */
  mmv?: string;
  /** The quote that lands in the room. */
  aha?: string;
  thinkAbout?: string[];
  polished?: string[];
  ifStuck?: string[];
  starterRepo?: string;
};

/** Cross-track stack — the same on every track. */
export const CODING_JAM_STACK: string[] = [
  "Antigravity (AI-driven IDE)",
  "Python + FastAPI (backend)",
  "uv (package manager)",
  "Google Gemini API",
  "HTML / CSS / JS (frontend)",
];

export const TRACKS: Track[] = [
  {
    kind: "open",
    slug: "your-own-idea",
    name: "Build your own idea",
    summary: "Build the idea you have been planning. There is no topic this session.",
    color: "blue",
    emoji: "💡",
    requirement: "Write a one-paragraph description of what you are building before you start.",
    examples: [
      "An idea you have described to someone but have not started",
      "A tool that solves a problem you have",
      "A version of an application you use",
      "An idea from an earlier session that you did not finish",
    ],
    guidance: [
      "Describe the application in three sentences. If you cannot, reduce the scope.",
      "Build one flow and one screen.",
      "Reuse approaches from earlier sessions.",
    ],
    outcome: "A working version of an idea you brought.",
    tech: ["Your choice"],
    aiStudio: { level: 4, note: "Suitable for most ideas that end in a shareable link." },
    antigravity: { level: 4, note: "Suitable for most ideas that end in a repository." },
    facilitator: {
      openWith: "Read the requirement and give the room ten minutes to write the paragraph before anyone opens a tool.",
      watchFor: "Scope that cannot be described in three sentences. Ask for the description; the difficulty is the signal.",
      fishFor: "A build that shipped because the participant cut something. Ask what they cut.",
    },
  },
  {
    kind: "open",
    slug: "ai-for-good",
    name: "AI for Good",
    summary:
      "A multi-chapter regional initiative uniting chapters around annually rotating societal challenges to build solutions with Google's applied AI ecosystem.",
    color: "green",
    emoji: "🌱",
    requirement:
      "Build an open-source prototype addressing an annually rotating societal challenge (environmental resilience, digital accessibility, public health informatics, or workforce readiness).",
    examples: [
      "Environmental Resilience: Carbon footprint tracking or hyper-local disaster response",
      "Digital Accessibility: Multi-modal screen assistance or WCAG-aligned adaptive UI",
      "Public Health Informatics: Community resource allocation or triage assistance",
      "Workforce Readiness: Vocational training simulators or accessible career coaching",
    ],
    guidance: [
      "Validate the community problem first — ground your solution in real beneficiary personas or direct input from local non-profits and municipal partners.",
      "Use AI where it is genuinely necessary (multimodal inference, agentic orchestration, embeddings) rather than as a bolt-on gimmick.",
      "Build explicit guardrails for safety, grounding, privacy, and WCAG-aligned accessibility from the start.",
      "Design for low-friction handoff, sustainable inference cost efficiency, and Apache 2.0 open-source licensing so community partners can actually run it.",
    ],
    outcome:
      "A validated open-source civic prototype licensed under Apache 2.0 with documentation ready for community handoff.",
    tech: [
      "Agentic orchestration & frameworks",
      "Multimodal inference & embeddings",
      "Responsible AI & safety guardrails",
      "Accessible UI (WCAG-aligned)",
      "Apache 2.0 open-source deployment",
    ],
    aiStudio: {
      level: 4,
      note: "Prompt prototyping, multimodal evaluation, and structured safety guardrails directly in browser.",
    },
    antigravity: {
      level: 4,
      note: "Full-stack agent development, data pipelines, and open-source repo scaffolding on laptops.",
    },
    facilitator: {
      openWith:
        "Read the 4-pillar 100-point rubric and confirm teams have chosen an annual challenge focus before writing code.",
      watchFor:
        "Gimmick AI features without real social impact or neglecting accessibility and license requirements.",
      fishFor:
        "A build designed with direct empathy for non-profit operations and measurable community impact.",
    },
    programDetails: {
      badges: ["Fall Hacking Sprints", "100-Point Standard Rubric", "Apache 2.0 Open Source"],
      conceptOverview: [
        "The GDG AI for Good initiative is a multi-chapter regional program across the Google Developer Groups in North America. Rather than running disconnected, one-off hackathons, the initiative unites chapters around an annually rotating societal challenge (such as environmental resilience, digital accessibility, public health informatics, or workforce readiness).",
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
    kind: "open",
    slug: "android-app",
    name: "Build an Android app",
    summary: "Build an Android app and install it on your own device. You decide what the app does.",
    color: "yellow",
    emoji: "📱",
    requirement: "Your app must run on an Android device or the browser emulator before the session ends.",
    examples: [
      "A tool built around one phone sensor, such as the accelerometer or the light sensor",
      "A single-screen utility you would use the next day",
      "A game that responds to movement",
      "An app that shows one piece of information and nothing else",
    ],
    guidance: [
      "Choose the sensor or capability first, then decide what to build around it.",
      "Limit the app to one screen. Navigation and settings screens are out of scope for this session.",
      "Install the app on a device before you improve the design.",
    ],
    outcome: "A working Android app installed on your device.",
    tech: ["Google AI Studio Build mode", "Android emulator", "SensorManager"],
    codelab: {
      title: "Build and publish your first Android app with AI Studio",
      url: "https://codelabs.developers.google.com/build-with-ai/build-and-publish-android-app-with-ai-studio",
    },
    video: { url: "https://youtu.be/Vl9HYB9tmdw", youtubeId: "Vl9HYB9tmdw" },
    aiStudio: { level: 4, note: "Build mode includes a browser emulator, so no Android Studio install is required." },
    antigravity: { level: 1, note: "Android is outside the Python and FastAPI stack used elsewhere in the jam." },
    facilitator: {
      openWith: "Read the requirement, then confirm every participant has either a device and a USB cable, or the browser emulator open. Settle device setup before the build block starts.",
      watchFor: "Participants design the app before they install anything. Ask early who has run an empty app on a device. Anyone who has not should do that first.",
      fishFor: "Two builds that used different sensors. The contrast shows the room how wide the requirement was.",
    },
  },
  {
    kind: "open",
    slug: "on-the-map",
    name: "Put it on the map",
    summary: "Build an application that uses real map data. You decide what it shows.",
    color: "green",
    emoji: "🗺️",
    requirement: "Your application must display a real location on a map and respond to what is there.",
    examples: [
      "A quiz about the area around a chosen location",
      "A walking route with a generated description for each stop",
      "A comparison of two neighborhoods",
      "A recommendation based on where the user is",
    ],
    guidance: [
      "Include real location data in your prompts. Prompts without location context return generic results.",
      "Build against one city you know well. You will recognize an incorrect result immediately.",
      "Handle the case where a location cannot be found.",
    ],
    outcome: "A deployed web application that responds to real map data.",
    tech: ["Google Maps Platform", "Geocoding API", "Gemini API", "Cloud Run"],
    codelab: {
      title: "Build with Google Maps Platform and AI",
      url: "https://codelabs.developers.google.com/codelabs/cloud-run/build-with-google-maps-platform-and-ai",
    },
    aiStudio: { level: 4, note: "Build mode provisions a Maps demo key, so there is no console step during the session." },
    antigravity: { level: 3, note: "Workable, but API keys and CORS take time before the first map renders." },
    facilitator: {
      openWith: "Read the requirement and confirm everyone can load a map with a working key. Do not suggest a city or a use case.",
      watchFor: "Prompts that leave out location data, which return generic results. Ask to see the prompt when someone says the output is bland.",
      fishFor: "One build that used the map as input and one that used it as output. They read the same requirement in opposite directions.",
    },
  },
  {
    kind: "open",
    slug: "multiplayer",
    name: "Make it multiplayer",
    summary: "Build something two or more people use at the same time. You decide what it is.",
    color: "blue",
    emoji: "🎮",
    requirement: "A second person must be able to join from another device and see updates without refreshing.",
    examples: [
      "A two-player board game",
      "A shared drawing surface",
      "A quiz the room answers together",
      "A voting or ranking tool",
    ],
    guidance: [
      "Build the join flow first. Test it in a second browser window before you test it with another person.",
      "Support two players. Lobbies, matchmaking, and rankings are out of scope for this session.",
      "Deploy early. Other people cannot reach a server running on your laptop.",
    ],
    outcome: "A deployed application that at least two people used at the same time.",
    tech: ["Google AI Studio Build mode", "Firebase Authentication", "Cloud Firestore", "Cloud Run"],
    codelab: {
      title: "Launch your web-based video game with AI",
      url: "https://codelabs.developers.google.com/codelabs/cloud-run/launch-your-web-based-video-game-with-ai",
    },
    aiStudio: { level: 4, note: "Build mode configures Firebase and deploys to Cloud Run from the same tab." },
    antigravity: { level: 3, note: "You configure Firebase and hosting manually, which uses part of the build block." },
    facilitator: {
      openWith: "Read the requirement and ask the room to pair up before the build block starts. Every participant needs a second person to test with.",
      watchFor: "Participants build the interface before the join flow, then find at the end that nobody can connect. Ask for a working join link by the halfway point.",
      fishFor: "A build where the second person does something different from the first. Symmetric games are common; asymmetric ones are worth showing.",
    },
  },
  {
    kind: "open",
    slug: "with-a-dataset",
    name: "Build with a dataset",
    summary: "Choose a public dataset and build something with it. You decide what question to ask.",
    color: "red",
    emoji: "📊",
    requirement: "Your application must use a real dataset. Data you generated does not count.",
    examples: [
      "City service requests, such as 311 reports",
      "Public transit punctuality or traffic history",
      "Sports results and player statistics",
      "Search interest over time, by region",
      "Open city data such as tree inventories or air quality",
    ],
    guidance: [
      "Decide the question before you query the data.",
      "Show the query or the source rows next to each answer.",
      "Present one finding. A dashboard is out of scope for this session.",
    ],
    outcome: "An application that answers a real question using a real dataset.",
    tech: ["BigQuery", "Gemini", "Agent Development Kit"],
    datasets: [
      { label: "BigQuery public datasets", url: "https://cloud.google.com/bigquery/public-data" },
      { label: "Google Dataset Search", url: "https://datasetsearch.research.google.com/" },
    ],
    codelab: {
      title: "AI-Assisted Data Science with BigQuery",
      url: "https://codelabs.developers.google.com/codelabs/bigquery-data-science-notebooks",
    },
    aiStudio: { level: 3, note: "Suitable for the analysis, less suitable for the notebook workflow." },
    antigravity: { level: 4, note: "A local repository and notebook suit this topic well." },
    facilitator: {
      openWith: "Read the requirement and give the room five minutes to choose a dataset before anyone writes code.",
      watchFor: "Participants query the data before they decide the question, then present whatever came back. Ask what question they are answering.",
      fishFor: "Two builds that used the same dataset and reached different conclusions.",
    },
  },
  {
    kind: "open",
    slug: "live-api",
    name: "Build with the Live API",
    summary: "Build something that responds while the user is still speaking or showing it something. You decide what it responds to.",
    color: "blue",
    emoji: "🎙️",
    requirement: "Your application must accept live audio or video input and respond during the input, not after it.",
    examples: [
      "A conversation partner for a language you are learning",
      "A narrator that describes what the camera sees",
      "An assistant that extracts action items while people speak",
      "A hands-free instruction reader for cooking or repair",
    ],
    guidance: [
      "Test with background noise. A quiet room is not a realistic condition.",
      "Show a clear indicator of when the application is listening.",
      "Keep responses short. Long responses break the sense of a conversation.",
    ],
    outcome: "An application that responds to live audio or video input.",
    tech: ["Gemini Live API", "WebSockets", "Cloud Run"],
    aiStudio: { level: 4, note: "Live input is available directly in the browser." },
    antigravity: { level: 3, note: "Requires a streaming transport, which takes setup time." },
    facilitator: {
      openWith: "Read the requirement and ask everyone to test microphone permissions immediately. Browser permission prompts consume build time.",
      watchFor: "Responses that run long, which break the sense of a conversation. Suggest a sentence limit in the prompt.",
      fishFor: "A build that responds while the speaker is still talking, rather than after a pause.",
    },
  },
  {
    kind: "open",
    slug: "build-an-agent",
    name: "Build an agent",
    summary: "Build something that chooses which tools to use instead of answering directly. You decide what it works on.",
    color: "blue",
    emoji: "🤖",
    requirement: "Your agent must have at least two tools and choose between them at run time.",
    examples: [
      "An assistant that searches, then summarizes what it found",
      "An assistant that queries a database and formats a report",
      "A planner and an executor that pass work between them",
      "An agent that checks one source before it answers",
    ],
    guidance: [
      "Show the tool calls in the interface. Tool selection is the behavior you are demonstrating.",
      "Give the tools clearly different purposes. Similar tools produce an agent that only uses one.",
      "Write the question you want answered before you build the agent.",
    ],
    outcome: "An agent that selects tools and shows what it did.",
    tech: ["Agent Development Kit", "MCP servers", "Gemini", "Cloud Run"],
    codelab: {
      title: "Build and Deploy AI Agents with Gemini and BigQuery MCP server in Cloud Run",
      url: "https://codelabs.developers.google.com/codelabs/cloud-run/cloud-run-adk-gemini-bq-mcp",
    },
    aiStudio: { level: 2, note: "Agent frameworks and MCP servers expect a terminal and a package manager." },
    antigravity: { level: 4, note: "A local repository and an agent-first IDE suit this topic well." },
    facilitator: {
      openWith: "Read the requirement and ask each participant to name their two tools out loud before they start.",
      watchFor: "Two tools that do similar things, which produces an agent that only ever calls one. Ask what makes the tools different.",
      fishFor: "A run where the agent chose a tool the participant did not expect.",
    },
  },
  {
    kind: "open",
    slug: "what-the-camera-sees",
    name: "Build with what the camera sees",
    summary: "Build something whose main input is an image rather than typed text. You decide what it looks at.",
    color: "red",
    emoji: "👀",
    requirement: "Your application must take an image or camera input as its primary input.",
    examples: [
      "Identify something and explain it",
      "Translate text that appears in a photo",
      "Check a physical space against a checklist",
      "Describe an image for someone who cannot see it",
    ],
    guidance: [
      "Test with poor-quality images. Participants and users do not take clear photographs.",
      "State when the model is uncertain. A confident incorrect answer is the main risk in this topic.",
      "Accept file upload as well as camera capture.",
    ],
    outcome: "An application that produces a useful result from a photograph.",
    tech: ["Gemini multimodal input", "Image generation"],
    aiStudio: { level: 4, note: "Image input and image output are both available in the browser." },
    antigravity: { level: 4, note: "One upload endpoint and two API calls fit within the build block." },
    facilitator: {
      openWith: "Read the requirement and ask everyone to take one deliberately poor photograph to test with.",
      watchFor: "Testing only with clear images. Results degrade sharply on the photographs people actually take.",
      fishFor: "A build that states when it is uncertain. Most will not, and the contrast is the lesson.",
    },
  },
  {
    kind: "open",
    slug: "your-own-documents",
    name: "Answer from your own documents",
    summary: "Build something that answers questions from documents you provide. You decide which documents.",
    color: "blue",
    emoji: "🔍",
    requirement: "Every answer must cite the passage it came from.",
    examples: [
      "A handbook or policy assistant",
      "A lease or contract reader",
      "A rules reference for a game",
      "A study assistant for your own notes",
    ],
    guidance: [
      "Configure the application to state when an answer is not in the documents.",
      "Spend your time on how the documents are split. Retrieval quality depends on it.",
      "Use documents you know well, so you can verify the answers.",
    ],
    outcome: "An application that answers questions with citations from your documents.",
    tech: ["Retrieval-augmented generation", "Vector search", "Gemini", "Cloud Run"],
    codelab: {
      title: "Building Agents with Retrieval-Augmented Generation",
      url: "https://codelabs.developers.google.com/codelabs/production-ready-ai-with-gc/7-advanced-agent-capabilities/building-agents-with-retrieval-augmented-generation",
    },
    aiStudio: { level: 3, note: "Suitable for the chat interface, less suitable for the retrieval layer." },
    antigravity: { level: 4, note: "Documents on disk and a local repository suit this topic well." },
    facilitator: {
      openWith: "Read the requirement and ask everyone to have their documents on disk before the build block starts.",
      watchFor: "Time spent on the wording of answers instead of on how documents are split. Retrieval quality decides the result.",
      fishFor: "A build that correctly refuses to answer something that is not in its documents.",
    },
  },
  {
    kind: "open",
    slug: "generate-the-interface",
    name: "Generate the interface",
    summary: "Build something that generates a different interface for each request. You decide the subject.",
    color: "yellow",
    emoji: "✨",
    requirement: "The layout your application returns must change with the request, not only the text.",
    examples: [
      "A form generated from a described task",
      "A comparison view chosen by the type of question",
      "A view assembled from a request in plain language",
      "A configuration screen generated from a description",
    ],
    guidance: [
      "Limit the component set to four or five. An unrestricted set produces unusable layouts.",
      "Define the fallback layout first.",
      "Use structured output, so responses map to components reliably.",
    ],
    outcome: "An application whose interface changes with each request.",
    tech: ["Gemini structured output", "Component registry"],
    codelab: {
      title: "Build a Generative UI (GenUI) App",
      url: "https://codelabs.developers.google.com/codelabs/genui-intro",
    },
    aiStudio: { level: 4, note: "Prompt-first and visual, which suits the browser workflow." },
    antigravity: { level: 3, note: "Workable locally. The component registry takes most of the build block." },
    facilitator: {
      openWith: "Read the requirement and ask each participant to list their component set before they start.",
      watchFor: "Unrestricted component sets, which produce layouts that do not render. Ask how many components are in the set.",
      fishFor: "Two requests to the same build that produced genuinely different layouts.",
    },
  },

  {
    kind: "project",
    number: 4,
    slug: "fridge-to-recipe",
    name: "FridgeChef",
    summary: "Type what's in your fridge and get one recipe back, with a photo of the dish.",
    color: "green",
    emoji: "🧊",
    mmv:
      "One text box: what's in your fridge? One button. AI returns one recipe — title, ingredients, steps — plus a generated photo of the dish.",
    aha: "It actually used my random ingredients. And the photo looks like food.",
    thinkAbout: [
      "Return one recipe, not three. You are not building a meal planner today.",
      "Generate the dish photo. The image is what makes the result feel real.",
      "The culinary voice is the personality. Pick one and write the prompt for it.",
      "Leave out pantry, dietary and budget filters. Each one is its own rabbit hole.",
    ],
    tech: ["Recipe text and dish image generation", "Gemini API"],
    polished: [
      "Mode picker (quick / grandma / budget / healthy / fancy)",
      "Shopping list generator",
      "Dietary preferences",
      "Photo input — show your fridge instead of typing",
      "Save and share a recipe gallery",
    ],
    ifStuck: ["context/image-gen-food.md"],
    starterRepo: "https://github.com/gca-americas/codingjam-fridge-chef",
    codelab: {
      title: "Coding Jam codelab",
      url: "https://codelabs.developers.google.com/codelabs/coding-jam/instructions#0",
    },
    video: { url: "https://youtu.be/dpzHIClbkyI", youtubeId: "dpzHIClbkyI" },
    aiStudio: { level: 4, note: "Text and image generation both run in the browser." },
    antigravity: { level: 4, note: "Two API calls and a layout. Comfortable inside the build block." },
    facilitator: {
      openWith:
        "Read the brief and point the room at the starter repo. Confirm everyone has a Gemini API key before the build block starts.",
      watchFor:
        "Participants skip the dish photo because text feels safer. The photo is what makes the demo land — ask to see it.",
      fishFor: "A build whose chef has a distinct voice. That choice is what separates two identical apps.",
    },
  },
  {
    kind: "project",
    number: 7,
    slug: "resume-tailor",
    name: "BulletProof",
    summary: "Paste a resume and a job posting, and get tailored bullets back.",
    color: "yellow",
    emoji: "💼",
    mmv:
      "Two text boxes — paste resume text, paste job posting text. One button. AI returns tailored resume bullets, ready to copy. No PDF parsing, no cover letter, no export.",
    aha: "This is better than what I would have written.",
    thinkAbout: [
      "What you refuse to build is the lesson. Skip the cover letter, the PDF parsing and the ATS scoring.",
      "Paste the whole job posting, not just the title. The full text is half the prompt's quality.",
      "Read the bullets out loud. If you would not say them in an interview, the prompt needs work.",
    ],
    tech: ["Long-context tailoring", "Gemini API"],
    polished: [
      "Match score and missing keywords",
      "PDF parsing for resume input",
      "Cover letter generator",
      "Interview question generator",
      "Application tracker",
    ],
    ifStuck: ["context/long-context-handling.md", "context/text-diff-pattern.md"],
    starterRepo: "https://github.com/gca-americas/codingjam-bulletproof",
    codelab: {
      title: "Coding Jam codelab",
      url: "https://codelabs.developers.google.com/codelabs/coding-jam/instructions#0",
    },
    video: { url: "https://youtu.be/xTxW3euV9kw", youtubeId: "xTxW3euV9kw" },
    aiStudio: { level: 4, note: "Two text boxes and one call. Nothing to install." },
    antigravity: { level: 4, note: "A single endpoint. Comfortable inside the build block." },
    facilitator: {
      openWith:
        "Read the brief and ask everyone to have a resume and a real job posting open before the build block starts.",
      watchFor:
        "Scope creep into cover letters and PDF parsing. Ask what they are deliberately not building.",
      fishFor: "A build where the participant rejected the AI's bullets and said why.",
    },
  },
];

export const colorClasses: Record<
  GColor,
  { bg: string; bgSoft: string; text: string; border: string; ring: string; chip: string; gradient: string; hex: string }
> = {
  blue: {
    bg: "bg-gblue", bgSoft: "bg-gblue/10", text: "text-gblue", border: "border-gblue",
    ring: "ring-gblue", chip: "bg-gblue/10 text-gblue", gradient: "from-gblue/90 to-gblue/60", hex: "#4285F4",
  },
  red: {
    bg: "bg-gred", bgSoft: "bg-gred/10", text: "text-gred", border: "border-gred",
    ring: "ring-gred", chip: "bg-gred/10 text-gred", gradient: "from-gred/90 to-gred/60", hex: "#EA4335",
  },
  yellow: {
    bg: "bg-gyellow", bgSoft: "bg-gyellow/10", text: "text-gyellow", border: "border-gyellow",
    ring: "ring-gyellow", chip: "bg-gyellow/15 text-yellow-700", gradient: "from-gyellow/90 to-gyellow/60", hex: "#FBBC04",
  },
  green: {
    bg: "bg-ggreen", bgSoft: "bg-ggreen/10", text: "text-ggreen", border: "border-ggreen",
    ring: "ring-ggreen", chip: "bg-ggreen/10 text-ggreen", gradient: "from-ggreen/90 to-ggreen/60", hex: "#34A853",
  },
};

export function getTrack(slug: string): Track | undefined {
  return TRACKS.find((t) => t.slug === slug);
}

/** Two-digit display label for the numbered drop-in projects. */
export function trackLabel(n: number): string {
  return n.toString().padStart(2, "0");
}

/** The lower of the two tool levels — how well a track suits a mixed room. */
export function bothToolsLevel(track: Track): number {
  return Math.min(track.aiStudio.level, track.antigravity.level);
}
