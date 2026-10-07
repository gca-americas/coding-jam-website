import { TRACKS } from "@/lib/tracks";
import type { TrackOption } from "./JamForm";

/**
 * The built-in catalog, trimmed to what the topic picker renders. Kept out of
 * the page files because Next.js only allows a fixed set of exports there.
 */
export const trackOptions: TrackOption[] = TRACKS.map((t) => ({
  slug: t.slug,
  number: t.number,
  project: t.project,
  tagline: t.tagline,
  emoji: t.emoji,
  color: t.color,
}));
