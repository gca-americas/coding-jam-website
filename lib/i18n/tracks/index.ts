import "server-only";
import type { Track } from "@/lib/tracks";
import { topicView, topicViewFromTrack, type Topic, type TopicView } from "@/lib/topic";
import { getLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { TrackMessages } from "./types";
import ptBR from "./pt-BR";
import esMX from "./es-MX";
import zhHant from "./zh-Hant";
import zhHans from "./zh-Hans";
import ja from "./ja";

const CATALOGUES: Partial<Record<Locale, TrackMessages>> = {
  "pt-BR": ptBR,
  "es-MX": esMX,
  "zh-Hant": zhHant,
  "zh-Hans": zhHans,
  ja,
};

/** One track with its translated prose overlaid. English fields survive gaps. */
export function localizeTrack(track: Track, locale: Locale): Track {
  const t = CATALOGUES[locale]?.[track.slug];
  if (!t) return track;
  return {
    ...track,
    ...t,
    facilitator: { ...track.facilitator, ...(t.facilitator ?? {}) },
  };
}

export async function localizeTracks(tracks: Track[]): Promise<Track[]> {
  const locale = await getLocale();
  return tracks.map((t) => localizeTrack(t, locale));
}

/** A single track, localized for this request. */
export async function getLocalizedTrack(track: Track): Promise<Track> {
  const locale = await getLocale();
  return localizeTrack(track, locale);
}

/**
 * A topic view with the track's prose translated.
 *
 * topicView() is a pure function shared with client components, so it can't
 * read the request locale itself. Server callers run their view through this
 * before rendering. A custom topic is organizer-authored prose in whatever
 * language they wrote it, so it passes through untouched.
 */
export async function localizeTopicView(view: TopicView): Promise<TopicView> {
  if (!view.track) return view;
  const locale = await getLocale();
  return topicViewFromTrack(localizeTrack(view.track, locale), {
    color: view.color,
    heroImageUrl: view.heroImageUrl,
  });
}

/** Convenience: resolve a stored topic straight to a localized view. */
export async function getLocalizedTopicView(topic: Topic): Promise<TopicView> {
  return localizeTopicView(topicView(topic));
}
