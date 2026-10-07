import type { Track } from "@/lib/tracks";

/**
 * Translatable parts of a track.
 *
 * Kept apart from lib/tracks.ts, which stays the English source and the single
 * place a track is added or removed. A locale file supplies whatever it has;
 * anything missing falls back to English, so a track can be half-translated
 * without the page breaking.
 *
 * Slugs, colours, emoji, tech labels, codelab URLs and tool-fit levels are
 * deliberately NOT here: they are identifiers or data, not prose.
 */
export type TrackContent = Partial<
  Pick<Track, "name" | "summary" | "requirement" | "outcome" | "examples" | "guidance" | "mmv" | "aha" | "thinkAbout" | "polished">
> & {
  facilitator?: Partial<Track["facilitator"]>;
};

export type TrackMessages = Record<string, TrackContent>;
