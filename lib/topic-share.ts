/**
 * Encoding for the no-login jam builder at /jam/try.
 *
 * The whole page is packed into the URL fragment — nothing is stored. That
 * keeps the anonymous path free of a spam surface, a moderation queue, and
 * orphaned records, at the cost of a long link.
 *
 * The fragment is chosen over a query string deliberately: fragments are never
 * sent to the server, so a jam someone is drafting stays out of access logs.
 *
 * A payload arriving here is untrusted input from whoever crafted the link, so
 * decode() re-validates everything through the same parseTopic() the real API
 * uses. Encoding is NOT encryption — it's just transport.
 */
import { parseTopic, safeUrl, type Topic } from "./topic";

export type SharedJam = {
  title: string;
  hostName?: string;
  chapter?: string;
  country?: string;
  eventDate?: string;
  locationNote?: string;
  rsvpUrl?: string;
  topic: Topic;
};

/** Fragments beyond this get unwieldy in chat apps and some browsers. */
export const MAX_FRAGMENT = 8000;

const LIMITS = { title: 90, hostName: 60, chapter: 80, country: 60, locationNote: 120 };

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSharedJam(jam: SharedJam): string {
  // Short keys — the whole thing rides in a URL.
  const payload = {
    v: 1,
    t: jam.title,
    h: jam.hostName || undefined,
    c: jam.chapter || undefined,
    n: jam.country || undefined,
    d: jam.eventDate || undefined,
    l: jam.locationNote || undefined,
    r: jam.rsvpUrl || undefined,
    p: jam.topic,
  };
  return toBase64Url(JSON.stringify(payload));
}

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export function decodeSharedJam(fragment: string): { jam: SharedJam } | { error: string } {
  const raw = fragment.replace(/^#/, "");
  if (!raw) return { error: "This link has no jam in it." };
  if (raw.length > MAX_FRAGMENT * 2) return { error: "This link is too long to read." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(fromBase64Url(raw));
  } catch {
    return { error: "This link is damaged — it may have been cut short when it was shared." };
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { error: "This link doesn't contain a jam." };
  }

  const src = parsed as Record<string, unknown>;
  const title = str(src.t, LIMITS.title);
  if (!title) return { error: "This link doesn't contain a jam." };

  // Same validation the real API applies — a hand-crafted fragment gets no
  // more trust than a hand-crafted request body.
  const topic = parseTopic(src.p);
  if ("error" in topic) return { error: topic.error };

  const eventDate = str(src.d, 10);
  const rsvp = src.r ? safeUrl(src.r) : null;

  return {
    jam: {
      title,
      hostName: str(src.h, LIMITS.hostName) || undefined,
      chapter: str(src.c, LIMITS.chapter) || undefined,
      country: str(src.n, LIMITS.country) || undefined,
      eventDate: /^\d{4}-\d{2}-\d{2}$/.test(eventDate) ? eventDate : undefined,
      locationNote: str(src.l, LIMITS.locationNote) || undefined,
      rsvpUrl: rsvp ?? undefined,
      topic: topic.topic,
    },
  };
}
