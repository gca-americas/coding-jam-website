/**
 * Jam topics — the two ways an organizer can decide what their room builds.
 *
 *   track   Pick one of the built-in TRACKS. Zero authoring; the jam page
 *           renders the canonical track content and links back to it. An open
 *           jam with no set topic is Track 09 ("Your Own Idea") — it already
 *           exists as a real track page, so there's no separate "open" kind.
 *   custom  Your own topic. Title and tagline are all that's required — fill in
 *           as much or as little of the rest as you want. Bringing an existing
 *           codelab or dataset is just this kind with the links filled in and
 *           the prose left blank; writing a topic from scratch is the same kind
 *           with the prose filled in. A hero image can be uploaded to this
 *           project's bucket under jams/<slug>/. Use this when you want an open
 *           jam framed in your own words rather than Track 09's.
 *
 * Everything an organizer types here is rendered on a public page, so
 * parseTopic() is the trust boundary: it length-caps every string, rejects
 * non-https URLs, and refuses hero images that don't live in our own bucket.
 * Callers must never persist a Topic that didn't come back from it.
 */
import { getTrack, type GColor, type Track } from "./tracks";

/**
 * Renamed or retired track slugs, mapped to what replaced them.
 *
 * A jam stores the slug it was created with, so a jam outlives any rename. The
 * old numbered catalogue's Track 09 became "your-own-idea" when the catalogue
 * merged; without this, every jam created against it renders the
 * "topic unavailable" placeholder on a real event page.
 *
 * Add a line here whenever a track's slug changes. Removing a track without a
 * successor is fine — those fall through to the placeholder, which is honest.
 */
const TRACK_SLUG_ALIASES: Record<string, string> = {
  "build-your-own-idea": "your-own-idea",
};


/** A built-in topic rendered through the same shape as a track. */
export function topicViewFromOpenTrack(topic: Track): TopicView {
  return {
    kind: "track",
    title: topic.name,
    tagline: topic.summary,
    color: topic.color,
    emoji: topic.emoji,
    mmv: topic.requirement ?? topic.mmv ?? "",
    thinkAbout: topic.guidance ?? topic.thinkAbout ?? [],
    tech: topic.tech,
    polished: topic.examples ?? topic.polished ?? [],
    links: {
      codelabUrl: topic.codelab?.url,
      videoUrl: topic.video?.url,
    },
    youtubeId: topic.video?.youtubeId,
  };
}

export const TOPIC_KINDS = ["track", "custom"] as const;
export type TopicKind = (typeof TOPIC_KINDS)[number];

export const G_COLORS: GColor[] = ["blue", "red", "yellow", "green"];

export type TopicLinks = {
  codelabUrl?: string;
  starterRepo?: string;
  datasetUrl?: string;
  videoUrl?: string;
  slidesUrl?: string;
};

/** `hint` is shown on the public jam page; `example` is a form placeholder only. */
export const LINK_FIELDS: Array<{
  key: keyof TopicLinks;
  label: string;
  hint: string;
  example: string;
}> = [
  {
    key: "codelabUrl",
    label: "Codelab / instructions",
    hint: "The step-by-step guide your room follows.",
    example: "https://codelabs.developers.google.com/your-codelab",
  },
  {
    key: "starterRepo",
    label: "Starter repo",
    hint: "A GitHub repo participants clone to begin.",
    example: "https://github.com/your-chapter/jam-starter",
  },
  {
    key: "datasetUrl",
    label: "Dataset",
    hint: "The data your topic is built around.",
    example: "https://storage.googleapis.com/your-bucket/data.csv",
  },
  {
    key: "videoUrl",
    label: "Demo video",
    hint: "A YouTube link showing the finished thing.",
    example: "https://youtu.be/dQw4w9WgXcQ",
  },
  {
    key: "slidesUrl",
    label: "Slides",
    hint: "Your intro deck, if you have one.",
    example: "https://docs.google.com/presentation/d/…",
  },
];

export type Topic =
  | { kind: "track"; trackSlug: string; color?: GColor; heroImageUrl?: string }
  | {
      kind: "custom";
      title: string;
      tagline: string;
      mmv?: string;
      thinkAbout?: string[];
      tech?: string[];
      polished?: string[];
      heroImageUrl?: string;
      color: GColor;
      emoji: string;
      links: TopicLinks;
    };

/* ── Limits ─────────────────────────────────────────────────────────────────
   Caps are generous enough that no honest organizer hits them, and tight
   enough that a jam page can't be turned into a wall of text. */
export const LIMITS = {
  title: 80,
  tagline: 140,
  mmv: 1500,
  thinkAbout: { items: 6, chars: 300 },
  tech: { items: 8, chars: 40 },
  polished: { items: 10, chars: 120 },
  url: 500,
  emoji: 4,
} as const;

/* ── Normalized render shape ────────────────────────────────────────────────
   Both a built-in Track and any Topic collapse into this, so /jam/[slug]
   renders every kind through one set of components instead of four. */
export type TopicView = {
  kind: TopicKind;
  title: string;
  tagline: string;
  color: GColor;
  emoji: string;
  /** What ships in the session. Empty when the kind doesn't define one. */
  mmv: string;
  thinkAbout: string[];
  tech: string[];
  polished: string[];
  links: TopicLinks;
  heroImageUrl?: string;
  youtubeId?: string;
  /** Present only for kind "track" — lets the jam page link to the canonical page. */
  track?: Track;
};

export function topicViewFromTrack(
  track: Track,
  overrides?: { color?: GColor; heroImageUrl?: string },
): TopicView {
  return {
    kind: "track",
    title: track.name,
    tagline: track.summary,
    color: overrides?.color ?? track.color,
    emoji: track.emoji,
    mmv: track.requirement ?? track.mmv ?? "",
    thinkAbout: track.guidance ?? track.thinkAbout ?? [],
    tech: track.tech,
    polished: track.examples ?? track.polished ?? [],
    links: {
      codelabUrl: track.codelab?.url,
      starterRepo: track.starterRepo || undefined,
      videoUrl: track.video?.url,
    },
    heroImageUrl: overrides?.heroImageUrl,
    youtubeId: track.video?.youtubeId,
    track,
  };
}

/** 11-char YouTube id out of the usual link shapes, or undefined. */
export function youtubeIdFrom(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : undefined;
}

export function topicView(topic: Topic): TopicView {
  switch (topic.kind) {
    case "track": {
      const track =
        getTrack(topic.trackSlug) ??
        getTrack(TRACK_SLUG_ALIASES[topic.trackSlug] ?? "");
      if (!track) {
        // Retired track with a successor — render the topic that replaced it.
      }
      // A stored slug can outlive a rename. Degrade to a readable placeholder
      // rather than throwing on a page render.
      if (!track) {
        return {
          kind: "track",
          title: "Topic unavailable",
          tagline: "This jam points at a track that no longer exists.",
          color: "blue",
          emoji: "❓",
          mmv: "",
          thinkAbout: [],
          tech: [],
          polished: [],
          links: {},
        };
      }
      return topicViewFromTrack(track, { color: topic.color, heroImageUrl: topic.heroImageUrl });
    }

    case "custom":
      return {
        kind: "custom",
        title: topic.title,
        tagline: topic.tagline,
        color: topic.color,
        emoji: topic.emoji,
        mmv: topic.mmv ?? "",
        thinkAbout: topic.thinkAbout ?? [],
        tech: topic.tech ?? [],
        polished: topic.polished ?? [],
        links: topic.links,
        heroImageUrl: topic.heroImageUrl,
        youtubeId: youtubeIdFrom(topic.links.videoUrl),
      };

  }
}

/** Short label for cards, admin tables, and the project's stored topicLabel. */
export function topicLabel(topic: Topic): string {
  return topicView(topic).title;
}

/* ── Validation ─────────────────────────────────────────────────────────── */

export type TopicParse = { topic: Topic } | { error: string };

function str(v: unknown): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";
}

/** Multi-line fields keep their newlines; only trailing space is squeezed. */
function multiline(v: unknown): string {
  if (typeof v !== "string") return "";
  return v
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function capped(value: string, max: number, field: string): string | { error: string } {
  if (value.length > max) return { error: `${field} is too long (max ${max} characters).` };
  return value;
}

/**
 * https only. http is rejected rather than upgraded — a jam page is served over
 * https, so an http subresource would be blocked anyway, and silently rewriting
 * an organizer's link is worse than telling them. Also blocks javascript:,
 * data:, and anything else that isn't a plain web link.
 */
export function safeUrl(v: unknown): string | null {
  const raw = str(v);
  if (!raw) return null;
  if (raw.length > LIMITS.url) return null;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  return parsed.toString();
}

/**
 * A hero image must live in our own uploads bucket under jams/. Organizers
 * would otherwise be able to point the tag at any remote host, which turns a
 * jam page into a tracking beacon for whoever owns that host — and leaves us
 * rendering an image nobody here can moderate or take down.
 */
export function isOwnedUploadUrl(url: string, prefix = "jams/"): boolean {
  if (url.startsWith("/uploads/")) return true;
  const bucket = process.env.GCS_UPLOADS_BUCKET;
  if (!bucket) return false;
  return url.startsWith(`https://storage.googleapis.com/${bucket}/${prefix}`);
}

function parseList(
  v: unknown,
  { items, chars }: { items: number; chars: number },
  field: string,
): string[] | { error: string } {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) return { error: `${field} must be a list.` };
  const out: string[] = [];
  for (const raw of v) {
    const s = str(raw);
    if (!s) continue;
    if (s.length > chars) return { error: `Each ${field} entry is limited to ${chars} characters.` };
    out.push(s);
    if (out.length > items) return { error: `${field} is limited to ${items} entries.` };
  }
  return out;
}

function parseLinks(v: unknown): TopicLinks | { error: string } {
  if (v === undefined || v === null) return {};
  if (typeof v !== "object" || Array.isArray(v)) return { error: "Links must be an object." };
  const src = v as Record<string, unknown>;
  const links: TopicLinks = {};
  for (const { key, label } of LINK_FIELDS) {
    const raw = str(src[key]);
    if (!raw) continue;
    const url = safeUrl(raw);
    if (!url) return { error: `${label} must be a full https:// link.` };
    links[key] = url;
  }
  return links;
}

function isGColor(v: unknown): v is GColor {
  return typeof v === "string" && (G_COLORS as string[]).includes(v);
}

export function isTopicKind(v: unknown): v is TopicKind {
  return typeof v === "string" && (TOPIC_KINDS as readonly string[]).includes(v);
}

export function parseTopic(input: unknown): TopicParse {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { error: "Pick a topic for this jam." };
  }
  const src = input as Record<string, unknown>;
  const kind = str(src.kind);
  if (!isTopicKind(kind)) return { error: "Pick a topic for this jam." };

  if (kind === "track") {
    const trackSlug = str(src.trackSlug);
    if (!trackSlug) return { error: "Pick a topic." };
    if (!getTrack(trackSlug)) return { error: "That track doesn't exist." };
    const color: GColor | undefined = isGColor(src.color) ? src.color : undefined;
    let heroImageUrl: string | undefined;
    const rawHero = str(src.heroImageUrl);
    if (rawHero) {
      const url = safeUrl(rawHero);
      if (!url) return { error: "Hero image must be a full https:// link." };
      if (!isOwnedUploadUrl(url)) {
        return { error: "Hero image must be uploaded here rather than linked from another site." };
      }
      heroImageUrl = url;
    }
    return {
      topic: {
        kind: "track",
        trackSlug,
        ...(color ? { color } : {}),
        ...(heroImageUrl ? { heroImageUrl } : {}),
      },
    };
  }

  // kind === "custom" — a headline the room can read off a projector is the
  // only hard requirement. Everything below is optional, so an organizer who
  // just wants to point at their own codelab fills in three fields and stops.
  const title = capped(str(src.title), LIMITS.title, "Title");
  if (typeof title !== "string") return title;
  if (!title) return { error: "Give your topic a title." };
  const tagline = capped(str(src.tagline), LIMITS.tagline, "Tagline");
  if (typeof tagline !== "string") return tagline;
  if (!tagline) return { error: "Give your topic a one-line tagline." };

  const links = parseLinks(src.links);
  if ("error" in links) return links;

  const mmv = capped(multiline(src.mmv), LIMITS.mmv, "What ships today");
  if (typeof mmv !== "string") return mmv;

  const thinkAbout = parseList(src.thinkAbout, LIMITS.thinkAbout, "Think about");
  if ("error" in thinkAbout) return thinkAbout;
  const tech = parseList(src.tech, LIMITS.tech, "Tech");
  if ("error" in tech) return tech;
  const polished = parseList(src.polished, LIMITS.polished, "Polished version");
  if ("error" in polished) return polished;

  const color: GColor = isGColor(src.color) ? src.color : "blue";

  const rawEmoji = str(src.emoji);
  if (rawEmoji && [...rawEmoji].length > LIMITS.emoji) {
    return { error: `Emoji is limited to ${LIMITS.emoji} characters.` };
  }
  const emoji = rawEmoji || "✨";

  let heroImageUrl: string | undefined;
  const rawHero = str(src.heroImageUrl);
  if (rawHero) {
    const url = safeUrl(rawHero);
    if (!url) return { error: "Hero image must be a full https:// link." };
    if (!isOwnedUploadUrl(url)) {
      return { error: "Hero image must be uploaded here rather than linked from another site." };
    }
    heroImageUrl = url;
  }

  return {
    topic: {
      kind: "custom",
      title,
      tagline,
      ...(mmv ? { mmv } : {}),
      ...(thinkAbout.length ? { thinkAbout } : {}),
      ...(tech.length ? { tech } : {}),
      ...(polished.length ? { polished } : {}),
      ...(heroImageUrl ? { heroImageUrl } : {}),
      color,
      emoji,
      links,
    },
  };
}
