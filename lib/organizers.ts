/**
 * Organizer roster — Firestore-backed in prod, file-backed in dev.
 *
 * Mirrors lib/admins.ts: the collection is keyed by lowercased email (also the
 * doc id), so isOrganizer(email) is always a single point lookup. Admins add and
 * remove organizers through the /admin UI — there is no self-serve signup.
 *
 * An organizer is someone trusted to publish a jam page under this domain. The
 * record carries the public attribution (display name, chapter, country) so jam
 * pages can credit them without ever exposing the email.
 */
import { isAdmin } from "./admins";

/** Local copy of lib/chapters' ChapterType. Importing it from there would pull
 *  the ~1,500-entry directory JSON into anything that touches this module. */
export type OrganizerChapterType = "gdg" | "campus" | "other";

export type Organizer = {
  /** Lowercased email. Also the doc id. */
  email: string;
  /** Public — shown as the lead on jam pages. */
  displayName: string;
  /** Display label, e.g. "GDG Seattle". Seeds the chapter field on new jams. */
  chapter: string;
  /** Which directory the chapter came from. */
  chapterType?: OrganizerChapterType;
  /** The bare directory entry, e.g. "Seattle". */
  chapterName?: string;
  country: string;
  /**
   * Google Developer Expert. Stored as a flag; every surface spells it out as
   * "Google Developer Expert" rather than the acronym, since it's a credential
   * shown to participants who won't know what GDE means.
   */
  isGde?: boolean;
  /** ISO timestamp when this organizer was added. */
  addedAt: string;
  /** Email of the admin who added them. */
  addedBy: string;
  /** ISO timestamp of the last edit, absent if never edited. */
  updatedAt?: string;
};

/** The fields an admin can change after the fact. Email is the key, so it isn't one. */
export type OrganizerPatch = Partial<
  Pick<Organizer, "displayName" | "chapter" | "chapterType" | "chapterName" | "country" | "isGde">
>;

type OrganizersBackend = {
  isOrganizer: (email: string) => Promise<boolean>;
  getOrganizer: (email: string) => Promise<Organizer | null>;
  listOrganizers: () => Promise<Organizer[]>;
  addOrganizer: (organizer: Omit<Organizer, "addedAt">) => Promise<Organizer>;
  updateOrganizer: (email: string, patch: OrganizerPatch) => Promise<Organizer | null>;
  removeOrganizer: (email: string) => Promise<boolean>;
};

function pickBackend(): "firestore" | "local" {
  const explicit = process.env.STORAGE_BACKEND?.toLowerCase();
  if (explicit === "local") return "local";
  if (explicit === "firestore") return "firestore";
  return process.env.NODE_ENV === "production" ? "firestore" : "local";
}

const ACTIVE_BACKEND = pickBackend();

let backendPromise: Promise<OrganizersBackend> | null = null;

function getBackend(): Promise<OrganizersBackend> {
  if (backendPromise) return backendPromise;
  backendPromise =
    ACTIVE_BACKEND === "firestore"
      ? (import("./organizers-firestore") as Promise<OrganizersBackend>)
      : (import("./organizers-fs") as Promise<OrganizersBackend>);
  return backendPromise;
}

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

export async function isOrganizer(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const n = normalize(email);
  if (!n) return false;
  try {
    const backend = await getBackend();
    return await backend.isOrganizer(n);
  } catch (err) {
    // Fail closed — same posture as isAdmin(). If we can't tell, deny.
    console.error(`[organizers] isOrganizer check failed — denying.`, err);
    return false;
  }
}

/**
 * The single gate for every jam-authoring surface. Admins are implicitly
 * organizers so they can fix a jam without adding themselves to the roster —
 * routing every check through here keeps that rule in one place instead of
 * scattering `isAdmin || isOrganizer` across pages and route handlers.
 */
export async function canManageJams(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const n = normalize(email);
  if (!n) return false;
  if (await isAdmin(n)) return true;
  return isOrganizer(n);
}

export async function getOrganizer(email: string | null | undefined): Promise<Organizer | null> {
  if (!email) return null;
  const n = normalize(email);
  if (!n) return null;
  try {
    const backend = await getBackend();
    return await backend.getOrganizer(n);
  } catch (err) {
    console.error(`[organizers] getOrganizer failed.`, err);
    return null;
  }
}

export async function listOrganizers(): Promise<Organizer[]> {
  try {
    const backend = await getBackend();
    return await backend.listOrganizers();
  } catch (err) {
    console.error(`[organizers] listOrganizers failed.`, err);
    return [];
  }
}

export async function addOrganizer(
  organizer: Omit<Organizer, "addedAt" | "email" | "addedBy"> & { email: string; addedBy: string },
): Promise<Organizer> {
  const backend = await getBackend();
  return backend.addOrganizer({
    ...organizer,
    email: normalize(organizer.email),
    addedBy: normalize(organizer.addedBy),
  });
}

export async function updateOrganizer(
  email: string,
  patch: OrganizerPatch,
): Promise<Organizer | null> {
  const backend = await getBackend();
  return backend.updateOrganizer(normalize(email), patch);
}

export async function removeOrganizer(email: string): Promise<boolean> {
  const backend = await getBackend();
  return backend.removeOrganizer(normalize(email));
}
