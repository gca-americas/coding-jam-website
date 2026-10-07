/**
 * Shared request validation for the jam endpoints.
 *
 * Colocated with the routes for the same reason as the organizer validator:
 * it turns an untrusted JSON body into exactly the fields lib/jams.ts expects.
 * The topic itself is handed off to parseTopic() in lib/topic.ts.
 *
 * Clearing semantics: a form that submits an empty optional field means "remove
 * it", so "" becomes null (which the store deletes) rather than "". Required
 * fields reject empty instead.
 */
import { isChapterType, resolveChapter } from "@/lib/chapters";
import { canonicalCountry } from "@/lib/countries";
import { JAM_STATUSES, type JamChapterType, type JamStatus } from "@/lib/jams";
import { parseTopic, safeUrl, type Topic } from "@/lib/topic";

const MAX_TITLE = 90;
const MAX_LOCATION = 120;

export type JamFields = {
  title?: string;
  chapter?: string;
  chapterType?: JamChapterType;
  chapterName?: string;
  country?: string;
  eventDate?: string | null;
  deadline?: string | null;
  locationNote?: string | null;
  rsvpUrl?: string | null;
  status?: JamStatus;
  topic?: Topic;
};

/**
 * No slug here on purpose. A jam's URL is generated server-side at create time
 * (lib/slug.ts), never taken from the request — so a client can't claim a
 * specific address, and there's no slug field to keep in sync with the form.
 */
export type JamParse = { fields: JamFields } | { error: string };

function str(v: unknown): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";
}

/** Calendar-date shape plus a real-date check, so "2026-02-31" is rejected. */
function isCalendarDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function parseJamInput(
  body: Record<string, unknown>,
  { requireAll }: { requireAll: boolean },
): JamParse {
  const fields: JamFields = {};

  const hasTitle = body.title !== undefined;
  if (requireAll || hasTitle) {
    const title = str(body.title);
    if (!title) return { error: "Give this jam a name." };
    if (title.length > MAX_TITLE) {
      return { error: `The jam name is too long (max ${MAX_TITLE} characters).` };
    }
    fields.title = title;
  }

  const hasChapter = body.chapterType !== undefined || body.chapterName !== undefined;
  if (requireAll || hasChapter) {
    const chapterType = str(body.chapterType);
    if (!isChapterType(chapterType)) return { error: "Pick a chapter type." };
    const chapterName = str(body.chapterName);
    const chapter = resolveChapter(chapterType, chapterName);
    if (!chapter) {
      return { error: "That chapter isn't in the directory. Pick one from the list." };
    }
    fields.chapterType = chapterType;
    fields.chapterName = chapterName;
    fields.chapter = chapter;
  }

  const hasCountry = body.country !== undefined;
  if (requireAll || hasCountry) {
    const country = canonicalCountry(str(body.country));
    if (!country) return { error: "Pick a country from the list." };
    fields.country = country;
  }

  // ── Optional event details. Empty string clears. ──
  if (body.eventDate !== undefined) {
    const raw = str(body.eventDate);
    if (!raw) fields.eventDate = null;
    else if (!isCalendarDate(raw)) return { error: "Event date must be a real date (YYYY-MM-DD)." };
    else fields.eventDate = raw;
  }

  if (body.deadline !== undefined) {
    const raw = str(body.deadline);
    if (!raw) fields.deadline = null;
    else if (!isCalendarDate(raw)) return { error: "Deadline must be a real date (YYYY-MM-DD)." };
    else fields.deadline = raw;
  }

  if (body.locationNote !== undefined) {
    const raw = str(body.locationNote);
    if (!raw) fields.locationNote = null;
    else if (raw.length > MAX_LOCATION) {
      return { error: `Location note is too long (max ${MAX_LOCATION} characters).` };
    } else fields.locationNote = raw;
  }

  if (body.rsvpUrl !== undefined) {
    const raw = str(body.rsvpUrl);
    if (!raw) fields.rsvpUrl = null;
    else {
      const url = safeUrl(raw);
      if (!url) return { error: "The RSVP link must be a full https:// link." };
      fields.rsvpUrl = url;
    }
  }

  const hasStatus = body.status !== undefined;
  if (requireAll || hasStatus) {
    const status = str(body.status) || "draft";
    if (!(JAM_STATUSES as string[]).includes(status)) {
      return { error: "Unknown status." };
    }
    fields.status = status as JamStatus;
  }

  const hasTopic = body.topic !== undefined;
  if (requireAll || hasTopic) {
    const parsed = parseTopic(body.topic);
    if ("error" in parsed) return parsed;
    fields.topic = parsed.topic;
  }

  if (!requireAll && Object.keys(fields).length === 0) {
    return { error: "Nothing to update." };
  }

  return { fields };
}
