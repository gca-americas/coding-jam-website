/**
 * Jams — one event instance, owned by an organizer, carrying one Topic.
 *
 * Firestore-backed in prod, file-backed in dev, same dispatcher shape as
 * lib/admins.ts and lib/organizers.ts. The slug is the doc id, so lookups by
 * URL are a single point read and uniqueness is enforced by the store itself
 * rather than by a query-then-write race.
 *
 * A jam does NOT replace the built-in TRACKS. Tracks stay the static catalog;
 * a jam either points at one (kind "track") or carries its own topic.
 */
import type { Topic } from "./topic";
import { topicLabel } from "./topic";

/** Local copy of lib/chapters' ChapterType — see the note in lib/organizers.ts. */
export type JamChapterType = "gdg" | "campus" | "other";

export type JamStatus = "draft" | "published" | "archived";

export const JAM_STATUSES: JamStatus[] = ["draft", "published", "archived"];

export type Jam = {
  /** URL slug. Also the doc id. Immutable once created. */
  slug: string;
  /** The event's name, e.g. "GDG Seattle Coding Jam — Week 3". */
  title: string;
  /** Private — the owning organizer. Never send this to a client. */
  organizerEmail: string;
  /** Public — who's hosting, copied from the organizer record at create time. */
  organizerName: string;
  /** Public — whether that organizer is a Google Developer Expert, copied at create time. */
  organizerIsGde?: boolean;
  chapter: string;
  chapterType?: JamChapterType;
  chapterName?: string;
  country: string;
  /** YYYY-MM-DD. Absent for jams with no date set yet. */
  eventDate?: string;
  /** YYYY-MM-DD. Optional submission deadline; open through the end of this day. */
  deadline?: string;
  /** Free text: "6:30pm, Room 401" or "Online". */
  locationNote?: string;
  rsvpUrl?: string;
  status: JamStatus;
  topic: Topic;
  createdAt: string;
  updatedAt: string;
};

/** Public-safe view — strips the owner's email, mirroring toPublic() in lib/projects.ts. */
export type PublicJam = Omit<Jam, "organizerEmail">;

export function toPublicJam(jam: Jam): PublicJam {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { organizerEmail, ...rest } = jam;
  return rest;
}

/** Guard rail on a runaway account — an organizer runs weekly events, not hundreds. */
export const MAX_JAMS_PER_ORGANIZER = 50;

/** How far back the submit form offers jams to attribute a build to. */
export const SUBMISSION_WINDOW_DAYS = 14;

/**
 * Whether the jam's optional submission deadline has passed.
 *
 * A deadline is inclusive of the entire day set by the organizer (open through
 * the end of `jam.deadline`). Once `today` (YYYY-MM-DD) is strictly after
 * `jam.deadline`, the jam is closed for submissions.
 */
export function isPastDeadline(
  jam: Pick<Jam, "deadline">,
  today: Date = new Date(),
): boolean {
  if (!jam.deadline) return false;
  const currentDay = today.toISOString().slice(0, 10);
  return currentDay > jam.deadline;
}

/**
 * The jams a build can be credited to today: published, dated, and held within
 * the last two weeks (today inclusive) — or with an active submission deadline
 * that has not yet passed.
 *
 * When a jam has an explicit `deadline`, it remains open through the end of
 * that day and closes immediately on the following day.
 */
export function jamsOpenForSubmission(jams: ReadonlyArray<Jam>, today: Date = new Date()): Jam[] {
  const end = today.toISOString().slice(0, 10);
  const start = new Date(today.getTime() - SUBMISSION_WINDOW_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 10);
  return jams.filter((j) => {
    if (j.status !== "published") return false;
    if (j.deadline) {
      if (end > j.deadline) return false;
      return !j.eventDate || j.eventDate <= end;
    }
    return Boolean(j.eventDate && j.eventDate >= start && j.eventDate <= end);
  });
}

/* ── Slugs ──────────────────────────────────────────────────────────────── */

// Re-exported from lib/slug.ts so server code has one import site. They live
// there to stay free of this module's dynamic Firestore import.
export { SLUG_MIN, SLUG_MAX, SLUG_DIGITS, newSlug, validateSlug } from "./slug";

/* ── Permissions ────────────────────────────────────────────────────────── */

/**
 * Owner-or-admin. Admins can edit any jam so a topic can be corrected or a page
 * pulled down without chasing the organizer.
 */
export function canEditJam(jam: Jam, email: string | null | undefined, isAdmin: boolean): boolean {
  if (isAdmin) return true;
  if (!email) return false;
  return jam.organizerEmail === email.trim().toLowerCase();
}

/** The label stored on a project submitted through this jam. */
export function jamTopicLabel(jam: Jam): string {
  return topicLabel(jam.topic);
}

/* ── Storage dispatch ───────────────────────────────────────────────────── */

/**
 * Editable fields. `undefined` leaves a field alone; `null` clears it — which is
 * how an organizer removes an RSVP link or a date they'd previously set. Slug,
 * owner and timestamps are not editable.
 */
export type JamPatch = Partial<{
  title: string;
  organizerName: string;
  chapter: string;
  chapterType: JamChapterType | null;
  chapterName: string | null;
  country: string;
  eventDate: string | null;
  deadline: string | null;
  locationNote: string | null;
  rsvpUrl: string | null;
  status: JamStatus;
  topic: Topic;
}>;

export class SlugTakenError extends Error {
  constructor(slug: string) {
    super(`The URL "${slug}" is already taken.`);
    this.name = "SlugTakenError";
  }
}

type JamsBackend = {
  getJam: (slug: string) => Promise<Jam | null>;
  listJams: () => Promise<Jam[]>;
  listJamsByOrganizer: (email: string) => Promise<Jam[]>;
  listPublishedJams: () => Promise<Jam[]>;
  createJam: (jam: Omit<Jam, "createdAt" | "updatedAt">) => Promise<Jam>;
  updateJam: (slug: string, patch: JamPatch) => Promise<Jam | null>;
  deleteJam: (slug: string) => Promise<boolean>;
};

function pickBackend(): "firestore" | "local" {
  const explicit = process.env.STORAGE_BACKEND?.toLowerCase();
  if (explicit === "local") return "local";
  if (explicit === "firestore") return "firestore";
  return process.env.NODE_ENV === "production" ? "firestore" : "local";
}

const ACTIVE_BACKEND = pickBackend();

let backendPromise: Promise<JamsBackend> | null = null;

function getBackend(): Promise<JamsBackend> {
  if (backendPromise) return backendPromise;
  backendPromise =
    ACTIVE_BACKEND === "firestore"
      ? (import("./jams-firestore") as Promise<JamsBackend>)
      : (import("./jams-fs") as Promise<JamsBackend>);
  return backendPromise;
}

/** Newest first, by event date when present and creation date otherwise. */
function sortForDisplay(rows: Jam[]): Jam[] {
  return rows.sort((a, b) => {
    const ka = a.eventDate ?? a.createdAt.slice(0, 10);
    const kb = b.eventDate ?? b.createdAt.slice(0, 10);
    if (ka !== kb) return ka < kb ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

export async function getJam(slug: string): Promise<Jam | null> {
  const s = slug.trim().toLowerCase();
  if (!s) return null;
  try {
    const backend = await getBackend();
    return await backend.getJam(s);
  } catch (err) {
    console.error(`[jams] getJam(${s}) from ${ACTIVE_BACKEND} failed.`, err);
    return null;
  }
}

export async function listJams(): Promise<Jam[]> {
  try {
    const backend = await getBackend();
    return sortForDisplay(await backend.listJams());
  } catch (err) {
    console.error(`[jams] listJams from ${ACTIVE_BACKEND} failed — returning empty.`, err);
    return [];
  }
}

export async function listJamsByOrganizer(email: string): Promise<Jam[]> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];
  try {
    const backend = await getBackend();
    return sortForDisplay(await backend.listJamsByOrganizer(normalized));
  } catch (err) {
    console.error(`[jams] listJamsByOrganizer from ${ACTIVE_BACKEND} failed — returning empty.`, err);
    return [];
  }
}

/** Everything on the public /jams directory. Drafts and archives stay hidden. */
export async function listPublishedJams(): Promise<Jam[]> {
  try {
    const backend = await getBackend();
    return sortForDisplay(await backend.listPublishedJams());
  } catch (err) {
    console.error(`[jams] listPublishedJams from ${ACTIVE_BACKEND} failed — returning empty.`, err);
    return [];
  }
}

/** Throws SlugTakenError if the slug is in use. */
export async function createJam(jam: Omit<Jam, "createdAt" | "updatedAt">): Promise<Jam> {
  const backend = await getBackend();
  return backend.createJam({ ...jam, organizerEmail: jam.organizerEmail.trim().toLowerCase() });
}

export async function updateJam(slug: string, patch: JamPatch): Promise<Jam | null> {
  const backend = await getBackend();
  return backend.updateJam(slug.trim().toLowerCase(), patch);
}

export async function deleteJam(slug: string): Promise<boolean> {
  const backend = await getBackend();
  return backend.deleteJam(slug.trim().toLowerCase());
}
