import { TRACKS } from "@/lib/tracks";
import type { TrackOption } from "./JamForm";

/**
 * What the topic picker offers, trimmed to the fields it renders. Kept out of
 * the page files because Next.js only allows a fixed set of exports there.
 *
 * A jam stores whichever slug is picked as `{kind: "track", trackSlug}`.
 */
export const trackOptions: TrackOption[] = TRACKS.map((t) => ({
  slug: t.slug,
  number: t.number,
  project: t.name,
  tagline: t.summary,
  emoji: t.emoji,
  color: t.color,
}));
