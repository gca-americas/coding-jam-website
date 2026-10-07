import { FunctionTool } from "@google/adk";
import { z } from "zod";
import { TRACKS } from "@/lib/tracks";
import { CHAPTER_TYPES, chapterList, formatChapter, parseChapter, type ChapterType } from "@/lib/chapters";
import { COUNTRIES, canonicalCountry } from "@/lib/countries";
import { createJam, listJamsByOrganizer, newSlug, MAX_JAMS_PER_ORGANIZER, SlugTakenError } from "@/lib/jams";
import { parseJamInput } from "@/app/api/jams/validate";

/**
 * The organizer the agent is acting for.
 *
 * Established once by the route handler from the Auth.js session, then closed
 * over by every tool below. It is deliberately NOT a tool parameter: the model
 * never sees an organizer field, so it cannot act as somebody else even if a
 * participant tries to talk it into doing so.
 */
export type AgentOrganizer = {
  email: string;
  displayName: string;
  chapter?: string;
  chapterType?: ChapterType;
  country?: string;
  /** Copied onto the jam as public attribution, as the API route does. */
  isGde?: boolean;
};

/** A choice the UI renders as a clickable chip. */
export type Choice = { value: string; label: string; hint?: string };

export type ToolSignal =
  /** A short list — rendered as buttons. */
  | { kind: "choices"; field: string; prompt: string; choices: Choice[] }
  /** A long list — rendered as a filter box the organizer types into. */
  | { kind: "search"; field: string; prompt: string; placeholder: string; options: Choice[] }
  /** A date — rendered as a calendar, so the stored value is always YYYY-MM-DD. */
  | { kind: "date"; field: string; prompt: string }
  /** The jam exists. Carries where to see it. */
  | { kind: "created"; slug: string; title: string; status: "draft" | "published" };

const CHAPTER_TYPE_LABELS: Record<ChapterType, string> = {
  gdg: "GDG chapter (city)",
  campus: "GDG on Campus (university)",
  other: "Something else",
};

/**
 * Most tool calls one reply may make.
 *
 * A guard, not a budget: a tool that keeps rejecting what the model offers will
 * otherwise loop until the request times out, burning a Vertex call every two
 * seconds. Twelve is far more than a normal turn needs.
 */
const MAX_TOOL_CALLS = 12;

export function buildTools(organizer: AgentOrganizer, signals: ToolSignal[]) {
  let calls = 0;
  const budget = () => {
    calls += 1;
    return calls > MAX_TOOL_CALLS
      ? { status: "stop", note: "You have used too many tools on this reply. Stop calling tools, answer the organizer with what you have, and ask them what to do next." }
      : null;
  };
  /**
   * A long list goes to the browser whole and is filtered there. Round-tripping
   * the model for each search costs a call per keystroke and gets the organizer
   * no closer — they know their own city, they just need to find it in 788.
   */
  const offerSearch = (
    field: string,
    prompt: string,
    placeholder: string,
    options: Choice[],
  ) => {
    signals.push({ kind: "search", field, prompt, placeholder, options });
    return {
      status: "shown",
      note: `The organizer can now pick from ${options.length} options. Ask your question in a few words. Do not mention the list, the screen, or the options themselves.`,
    };
  };

  const offer = (field: string, prompt: string, choices: Choice[]) => {
    signals.push({ kind: "choices", field, prompt, choices });
    return {
      status: "shown",
      note: "The organizer can now pick an option. Ask your question in a few words. Do not mention the buttons, the screen, or the options themselves.",
      choices: choices.map((c) => c.value),
    };
  };

  const listChapterTypes = new FunctionTool({
    name: "list_chapter_types",
    description:
      "Show the kinds of community the organizer can run this jam for. Call this first when you do not yet know whether they run a city GDG chapter or a campus one.",
    parameters: z.object({}),
    execute: () =>
      offer(
        "chapterType",
        "Which kind of community do you run?",
        CHAPTER_TYPES.map((t) => ({ value: t, label: CHAPTER_TYPE_LABELS[t] })),
      ),
  });

  const findChapter = new FunctionTool({
    name: "find_chapter",
    description:
      "Put the official chapter directory on screen as a searchable list. Call this once, as soon as you know whether they run a city or campus chapter. The organizer filters and picks it themselves — you do not need a query.",
    parameters: z.object({
      chapterType: z.enum(["gdg", "campus", "other"]).describe("Which directory to show."),
    }),
    execute: ({ chapterType }) => {
      const over = budget();
      if (over) return over;
      const type = chapterType as ChapterType;
      // Only GDG and campus communities have a directory. Anything else is a
      // free-text name, so offering an empty picker would be a dead end.
      if (type === "other") {
        return {
          status: "no_directory",
          note: "There is no directory for this kind of community. Ask them what their group is called, in their own words, and take whatever they type. Then ask which city they are in so you can work out the country.",
        };
      }
      const all = chapterList(type).map((n) => ({
        value: formatChapter(type, n),
        label: formatChapter(type, n),
      }));
      // Their roster chapter first — it is nearly always the answer.
      const mine = organizer.chapter && organizer.chapterType === type ? organizer.chapter : null;
      const options = mine
        ? [{ value: mine, label: mine, hint: "Your chapter" }, ...all.filter((c) => c.value !== mine)]
        : all;
      return offerSearch(
        "chapter",
        `Which ${type === "campus" ? "campus" : "chapter"} is this jam for?`,
        type === "campus" ? "Type a university…" : "Type a city…",
        options,
      );
    },
  });

  const confirmCountry = new FunctionTool({
    name: "confirm_country",
    description:
      "Propose the country you believe the chapter is in, worked out from its city or university name, and ask the organizer to confirm. Always use this before list_countries — guessing saves them scrolling, but the guess must be confirmed, never applied silently.",
    parameters: z.object({
      country: z
        .string()
        .describe("Your best guess at the country, in English, e.g. 'United States'."),
    }),
    execute: ({ country }) => {
      const over = budget();
      if (over) return over;
      // The model supplies the geography; the catalogue decides the spelling.
      // An unrecognised guess is dropped rather than shown as a valid option.
      const canonical = canonicalCountry(String(country ?? ""));
      if (!canonical) {
        return {
          status: "unknown_country",
          note: `"${country}" is not in the country list. Call list_countries and let them pick instead.`,
        };
      }
      return offer("country", `Is this jam in ${canonical}?`, [
        { value: canonical, label: `Yes, ${canonical}`, hint: "Worked out from the chapter name" },
        { value: "__other__", label: "Somewhere else" },
      ]);
    },
  });

  const listCountries = new FunctionTool({
    name: "list_countries",
    description:
      "Put the country list on screen as a searchable list for the organizer to pick from.",
    parameters: z.object({}),
    execute: () =>
      offerSearch(
        "country",
        "Which country?",
        "Type a country…",
        COUNTRIES.map((c) => ({ value: c, label: c })),
      ),
  });

  const askTopicKind = new FunctionTool({
    name: "ask_topic_kind",
    description:
      "Ask whether the room is taking a built-in track or bringing its own topic, as two buttons. Call this before list_tracks — it is a two-way choice, so it should not need typing.",
    parameters: z.object({}),
    execute: () =>
      offer("topicKind", "How are you choosing what the room builds?", [
        {
          value: "track",
          label: "Use a built-in track",
          hint: "Pick from the catalogue — the brief and codelab are written already",
        },
        {
          value: "custom",
          label: "Bring my own topic",
          hint: "Your own subject, dataset or codelab — we will write it together",
        },
      ]),
  });

  const listTracks = new FunctionTool({
    name: "list_tracks",
    description:
      "Offer the built-in tracks as buttons. The full brief for every track is already on the page below the chat, so the organizer can read it themselves — link them to it rather than describing tracks at length.",
    parameters: z.object({}),
    execute: () =>
      offer(
        "track",
        "What is the room building?",
        TRACKS.map((t) => ({
          value: t.slug,
          label: `${t.emoji} ${t.name}`,
          hint: t.summary,
        })),
      ),
  });

  const describeTrack = new FunctionTool({
    name: "describe_track",
    description:
      "Look up everything about one track — its requirement, example directions, guidance, what people walk out with, and whether it needs a laptop. Call this whenever the organizer asks anything about a track, so you answer from the real brief rather than from memory.",
    parameters: z.object({
      slug: z.string().describe("The track slug, as returned by list_tracks."),
    }),
    execute: ({ slug }) => {
      const track = TRACKS.find((t) => t.slug === String(slug).trim());
      if (!track) {
        return { status: "not_found", note: "No such track. Call list_tracks and use a slug from it." };
      }
      return {
        status: "ok",
        name: track.name,
        kind: track.kind,
        summary: track.summary,
        requirement: track.requirement ?? track.mmv,
        examples: track.examples ?? track.polished ?? [],
        guidance: track.guidance ?? track.thinkAbout ?? [],
        outcome: track.outcome ?? track.aha,
        tech: track.tech,
        codelab: track.codelab?.title,
        starterRepo: track.starterRepo ? "yes" : "no",
        worksInBrowserOnly: track.antigravity.level <= 1,
        toolNote: `AI Studio ${track.aiStudio.level}/4 — ${track.aiStudio.note} Antigravity ${track.antigravity.level}/4 — ${track.antigravity.note}`,
      };
    },
  });

  const askDate = new FunctionTool({
    name: "ask_date",
    description:
      "Put a calendar on screen for the event date. Call this instead of asking for the date in words — a typed date arrives in a dozen formats and half of them do not parse.",
    parameters: z.object({}),
    execute: () => {
      signals.push({ kind: "date", field: "eventDate", prompt: "When is the jam?" });
      return {
        status: "shown",
        note: "The organizer can now pick a date or say it is undecided. Ask in a few words. Undecided is a perfectly good answer — a jam can be created without a date.",
      };
    },
  });

  const askPublish = new FunctionTool({
    name: "ask_publish",
    description:
      "Ask whether to publish the jam now or keep it as a draft. Call this immediately before create_jam. Publishing puts a public page up with their chapter's name on it, so it must be their explicit choice — never assume either way.",
    parameters: z.object({}),
    execute: () =>
      offer("status", "Publish it now, or keep it as a draft?", [
        {
          value: "published",
          label: "Publish it now",
          hint: "The page goes live and the jam appears on the site",
        },
        {
          value: "draft",
          label: "Keep it a draft",
          hint: "Saved and editable; nobody else can see it yet",
        },
      ]),
  });

  const createJamTool = new FunctionTool({
    name: "create_jam",
    description:
      "Create the jam. Call this ONCE, at the very end, after the organizer has confirmed the details back to you. It saves as a draft — the page is not public until they set it to Published — but it is a real record, so never call it on a guess.",
    parameters: z.object({
      title: z.string().describe("The event name, e.g. 'GDG Brooklyn Coding Jam — March'."),
      chapter: z.string().describe("Exactly as returned by find_chapter, or what they typed for a non-GDG group."),
      chapterType: z.enum(["gdg", "campus", "other"]),
      country: z.string(),
      eventDate: z.string().optional().describe("YYYY-MM-DD from ask_date. Omit if undecided."),
      locationNote: z.string().optional().describe("e.g. '6:30pm, Room 401' or 'Online'."),
      rsvpUrl: z.string().optional().describe("Full https:// link, or omit."),
      status: z
        .enum(["draft", "published"])
        .describe("Exactly what they chose in ask_publish. Never decide this yourself."),
      trackSlug: z.string().optional().describe("A slug from list_tracks, for a built-in track."),
      customTitle: z.string().optional().describe("Title of their own topic, if not using a track."),
      customTagline: z.string().optional().describe("One line on what the room builds."),
      customMmv: z.string().optional().describe("2-3 sentences on what ships in the session."),
    }),
    execute: async (input) => {
      const over = budget();
      if (over) return over;

      const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
      const topic = str(input.trackSlug)
        ? { kind: "track", trackSlug: str(input.trackSlug) }
        : {
            kind: "custom",
            title: str(input.customTitle),
            tagline: str(input.customTagline),
            mmv: str(input.customMmv),
            color: "blue",
            emoji: "✨",
            links: {},
          };

      // The same validator the API route uses, so nothing reaches the store
      // through the agent that could not have come through the form.
      /* The validator wants the BARE directory entry ("Brooklyn") plus a type,
         not the display label ("GDG Brooklyn") the pickers hand out. Split the
         label rather than trusting the model to have kept both in step. */
      const label = str(input.chapter) ?? "";
      const split = parseChapter(label);
      const chapterType = str(input.chapterType) ?? split.type;
      const chapterName =
        chapterType === split.type ? split.name : label.replace(/^GDG (on Campus )?/i, "").trim();

      const parsed = parseJamInput(
        {
          title: str(input.title),
          chapterType,
          chapterName,
          country: str(input.country),
          eventDate: str(input.eventDate),
          locationNote: str(input.locationNote),
          rsvpUrl: str(input.rsvpUrl),
          status: input.status === "published" ? "published" : "draft",
          topic,
        },
        { requireAll: true },
      );
      if ("error" in parsed) {
        return { status: "invalid", reason: parsed.error, note: "Fix this with the organizer, then call create_jam once more." };
      }

      const mine = await listJamsByOrganizer(organizer.email);
      if (mine.length >= MAX_JAMS_PER_ORGANIZER) {
        return { status: "limit_reached", note: `They already have ${MAX_JAMS_PER_ORGANIZER} jams. Ask them to archive an old one first.` };
      }

      const { fields } = parsed;
      const draft = {
        title: fields.title!,
        organizerEmail: organizer.email,
        organizerName: organizer.displayName,
        organizerIsGde: organizer.isGde ?? false,
        chapter: fields.chapter!,
        chapterType: fields.chapterType,
        chapterName: fields.chapterName,
        country: fields.country!,
        eventDate: fields.eventDate ?? undefined,
        locationNote: fields.locationNote ?? undefined,
        rsvpUrl: fields.rsvpUrl ?? undefined,
        status: fields.status!,
        topic: fields.topic!,
      };

      // The URL is drawn, not chosen. A taken draw is retried, as in the route.
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          const jam = await createJam({ ...draft, slug: newSlug() });
          signals.push({
            kind: "created",
            slug: jam.slug,
            title: jam.title,
            status: jam.status === "published" ? "published" : "draft",
          });
          return {
            status: "created",
            slug: jam.slug,
            published: jam.status === "published",
            note: `The jam is saved${jam.status === "published" ? " and live" : " as a draft"} and its link is on screen. Say so in one line, remind them about Google Cloud credits if you have not already, and stop. Do not call this tool again.`,
          };
        } catch (err) {
          if (!(err instanceof SlugTakenError) || attempt === 5) {
            console.error("[agent] createJam failed", err);
            return { status: "failed", note: "Saving failed. Apologise, and suggest they use the form below instead." };
          }
        }
      }
      return { status: "failed", note: "Saving failed. Suggest the form below." };
    },
  });

  return [listChapterTypes, findChapter, confirmCountry, listCountries, askTopicKind, listTracks, describeTrack, askDate, askPublish, createJamTool];
}
