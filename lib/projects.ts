/**
 * Storage dispatcher.
 *
 * Default backend selection:
 *   - production (NODE_ENV=production)  → Firestore
 *   - everything else (dev / test)       → local JSON file in data/projects.json
 *
 * Override with the STORAGE_BACKEND env var:
 *   STORAGE_BACKEND=local      → force JSON file (no Firestore SDK loaded)
 *   STORAGE_BACKEND=firestore  → force Firestore (handy for testing prod path locally)
 *
 * Each backend module is dynamic-imported so the Firestore SDK is never
 * pulled into the runtime when local mode is active.
 */

import { canonicalChapterName, formatChapter } from "./chapters";

export type Project = {
  id: string;
  trackNumber: number;
  projectName: string;
  builderName: string;
  builderImage?: string;
  /** Private — verified Google email of the submitter. Never displayed publicly. */
  submittedByEmail?: string;
  /** Private — optional collaborator emails (lowercased, deduped). Powers /me badge credit. */
  collaboratorEmails?: string[];
  /** Public — opaque hash of submittedByEmail. Used as the /u/[id] slug. */
  submitterProfileId?: string;
  /** Public — opaque hashes of collaborator emails. Used to credit collaborators on /u/[id]. */
  collaboratorProfileIds?: string[];
  /** Display label, e.g. "GDG Chicago" or "GDG on Campus Stanford University". */
  chapter: string;
  /** Which directory the chapter came from. Absent on pre-directory submissions. */
  chapterType?: "gdg" | "campus" | "other";
  /** The bare directory entry, e.g. "Chicago". Absent on pre-directory submissions. */
  chapterName?: string;
  country: string;
  repoUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  screenshotUrl?: string;
  description?: string;
  surprise: string;
  /** ISO 8601 string. Sorts lexicographically the same way real dates do. */
  submittedAt: string;
  /** Ids from lib/google-tech.ts. Absent on submissions from before the field existed. */
  googleTech?: string[];

  /* ── Jam attribution. All absent on a free-standing submission, which is
        why every surface renders "NA" rather than assuming a jam. Denormalized
        at submit time so counts and credits survive the jam being edited or
        deleted later. ── */
  /** Slug of the jam this was submitted through. */
  jamSlug?: string;
  /** The jam's name at submit time. */
  jamTitle?: string;
  /** Public — the organizer who ran that jam. */
  organizerName?: string;
  /** Private — the organizer's email, for per-organizer aggregation. */
  organizerEmail?: string;
  /** The jam's topic label at submit time, for topics that aren't built-in tracks. */
  topicLabel?: string;
};

/** Public-safe view of a project — strips fields that should never reach the client. */
export type PublicProject = Omit<
  Project,
  "submittedByEmail" | "collaboratorEmails" | "organizerEmail"
>;

export type CountryStat = {
  country: string;
  /** Projects shipped from this country. */
  count: number;
  /** Distinct chapters in this country that have shipped at least one project. */
  chapters: number;
};

export type ChapterStat = {
  chapter: string;
  country: string;
  count: number;
};

/** Jam attribution can be removed entirely, so these accept null to mean "clear". */
type ClearableFields = "jamSlug" | "jamTitle" | "organizerName" | "organizerEmail" | "topicLabel";

export type ProjectPatch = Partial<
  Omit<Project, "id" | "submittedAt" | ClearableFields | "googleTech">
> &
  Partial<Record<ClearableFields, string | null>> &
  /** Same clearing convention, but it's a list — untagging a build sends null. */
  Partial<{ googleTech: string[] | null }>;

export type StorageBackend = "firestore" | "local";

type BackendModule = {
  listProjectsRaw: () => Promise<Project[]>;
  addProject: (p: Omit<Project, "id" | "submittedAt">) => Promise<Project>;
  listProjectsByEmail: (email: string) => Promise<Project[]>;
  listProjectsByProfileId: (id: string) => Promise<Project[]>;
  getProjectById: (id: string) => Promise<Project | null>;
  updateProject: (id: string, patch: ProjectPatch) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
};

function pickBackend(): StorageBackend {
  const explicit = process.env.STORAGE_BACKEND?.toLowerCase();
  if (explicit === "local") return "local";
  if (explicit === "firestore") return "firestore";
  return process.env.NODE_ENV === "production" ? "firestore" : "local";
}

const ACTIVE_BACKEND: StorageBackend = pickBackend();

// Log once on first load so the active backend is obvious in dev/CI.
if (typeof window === "undefined" && !process.env.__PROJECTS_BACKEND_LOGGED__) {
  process.env.__PROJECTS_BACKEND_LOGGED__ = "1";
  console.log(`[projects] storage backend: ${ACTIVE_BACKEND}`);
}

let backendPromise: Promise<BackendModule> | null = null;

function getBackend(): Promise<BackendModule> {
  if (backendPromise) return backendPromise;
  backendPromise =
    ACTIVE_BACKEND === "firestore"
      ? (import("./projects-firestore") as Promise<BackendModule>)
      : (import("./projects-fs") as Promise<BackendModule>);
  return backendPromise;
}

export function toPublic(p: Project): PublicProject {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { submittedByEmail, collaboratorEmails, organizerEmail, ...rest } = p;
  /* eslint-enable @typescript-eslint/no-unused-vars */
  return rest;
}

/** How far back the homepage's featured sample reaches. */
export const FEATURED_POOL_SIZE = 100;

/**
 * A random handful drawn from the most recent submissions.
 *
 * The homepage used to show the newest six, which meant the same builds sat
 * there until someone else submitted — a chapter that shipped this morning
 * crowded out everyone from last week. Sampling a recent window keeps the
 * section different on every load while still favouring fresh work.
 *
 * Callers must be dynamically rendered, or the sample freezes at build time.
 */
export function sampleRecent<T>(
  items: ReadonlyArray<T>,
  count: number,
  poolSize: number = FEATURED_POOL_SIZE,
): T[] {
  const pool = items.slice(0, poolSize);
  const n = Math.min(count, pool.length);
  // Partial Fisher-Yates — shuffle only the prefix we're going to keep.
  const order = [...pool.keys()];
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(Math.random() * (order.length - i));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.slice(0, n).map((i) => pool[i]);
}

/**
 * The jams that actually have builds, for the showcase filter. Derived from the
 * projects rather than the jam list so a jam that was deleted still appears
 * while its builds do — the label comes from what was stamped at submit time.
 */
export function jamOptions(
  projects: ReadonlyArray<PublicProject | Project>,
): Array<{ slug: string; title: string; count: number }> {
  const map = new Map<string, { slug: string; title: string; count: number }>();
  for (const p of projects) {
    if (!p.jamSlug) continue;
    const row = map.get(p.jamSlug);
    if (row) row.count += 1;
    else map.set(p.jamSlug, { slug: p.jamSlug, title: p.jamTitle ?? p.jamSlug, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, "en"));
}

/**
 * Submissions per jam slug. Both the organizer console and the admin dashboard
 * read from this — one pass over the project list rather than a query per jam.
 */
export function jamSubmissionCounts(
  projects: ReadonlyArray<PublicProject | Project>,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of projects) {
    if (!p.jamSlug) continue;
    counts.set(p.jamSlug, (counts.get(p.jamSlug) ?? 0) + 1);
  }
  return counts;
}

// Re-exported from lib/attribution.ts so server code has one import site. They
// live there because ProjectCard renders inside a client boundary and must not
// pull this module's Firestore import into the browser bundle.
export { NO_ORGANIZER, organizerCredit } from "./attribution";

/**
 * All projects where the given email matches either the submitter or a credited
 * collaborator. Used by the /me page. Email comparison is case-insensitive —
 * we lowercase on write, but be defensive on read too.
 */
export async function listProjectsByEmail(email: string): Promise<Project[]> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];
  try {
    const backend = await getBackend();
    return await backend.listProjectsByEmail(normalized);
  } catch (err) {
    console.error(`[projects] listProjectsByEmail from ${ACTIVE_BACKEND} failed — returning empty.`, err);
    return [];
  }
}

/**
 * All projects where the given opaque profile-id matches either the submitter
 * or a credited collaborator. Used by /u/[id] public profile pages.
 */
export async function listProjectsByProfileId(id: string): Promise<Project[]> {
  const normalized = id.trim().toLowerCase();
  if (!normalized) return [];
  try {
    const backend = await getBackend();
    return await backend.listProjectsByProfileId(normalized);
  } catch (err) {
    console.error(`[projects] listProjectsByProfileId from ${ACTIVE_BACKEND} failed — returning empty.`, err);
    return [];
  }
}

/** Public view — for surfaces rendered to anyone (home, showcase, track pages). */
export async function listProjects(): Promise<PublicProject[]> {
  const raw = await listProjectsRaw();
  return raw.map(toPublic);
}

/** Internal raw view — keep for moderation / admin code paths. Never pass to a client component. */
export async function listProjectsRaw(): Promise<Project[]> {
  try {
    const backend = await getBackend();
    return await backend.listProjectsRaw();
  } catch (err) {
    // Fall back to empty so the site still renders if the backend is unreachable
    // (e.g. Firestore: missing ADC, IAM gone, no DB yet). Log every field we can
    // pry off the error — gRPC's default `.message` is often unhelpful on its own.
    const e = err as { message?: string; code?: number | string; details?: string; metadata?: unknown };
    console.error(
      `[projects] read from ${ACTIVE_BACKEND} backend failed — returning empty list.`,
      JSON.stringify(
        {
          message: e?.message ?? String(err),
          code: e?.code,
          details: e?.details,
        },
        null,
        2,
      ),
    );
    return [];
  }
}

export async function addProject(p: Omit<Project, "id" | "submittedAt">): Promise<Project> {
  const backend = await getBackend();
  return backend.addProject(p);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const backend = await getBackend();
  return backend.getProjectById(id);
}

export async function updateProject(id: string, patch: ProjectPatch): Promise<Project | null> {
  const backend = await getBackend();
  return backend.updateProject(id, patch);
}

export async function deleteProject(id: string): Promise<boolean> {
  const backend = await getBackend();
  return backend.deleteProject(id);
}

/**
 * Display normalization: trim, collapse whitespace, and force the "GDG " prefix
 * to uppercase. Preserves the rest of the user's casing (so "GDG NYC" stays
 * "GDG NYC", not "Gdg Nyc"). Use this on write so new submissions look clean.
 */
export function normalizeChapter(input: string): string {
  const collapsed = input.replace(/\s+/g, " ").trim();
  return collapsed.replace(/^gdg\b/i, "GDG");
}

/**
 * Match key for grouping chapters case-insensitively. Two chapters that
 * normalize to the same key are treated as the same chapter, regardless of
 * how each submitter typed it.
 */
export function chapterMatchKey(chapter: string, country: string): string {
  return `${chapter.replace(/\s+/g, " ").trim().toLowerCase()}__${country.trim().toLowerCase()}`;
}

/** The single row everything unrecognised is folded into. */
export const OTHER_CHAPTER = "Other";

/**
 * The directory entry a submitted chapter label refers to, or null.
 *
 * Submitters type the label freehand on older submissions, so the board sees
 * "nyc" and "GDG NYC" as different chapters, alongside genuine noise like
 * "abc" and "HOME". Resolving against the directory does two things: it folds
 * the variants of a real chapter together under one canonical name, and it
 * tells us what is not a chapter at all.
 */
function resolveChapterLabel(label: string): string | null {
  const bare = label
    .replace(/^\s*gdg on campus\s*/i, "")
    .replace(/^\s*gdg\s*/i, "")
    .trim();
  if (!bare) return null;
  for (const type of ["gdg", "campus"] as const) {
    const canonical = canonicalChapterName(type, bare);
    if (canonical) return formatChapter(type, canonical);
  }
  return null;
}

export function chapterStats(projects: ReadonlyArray<PublicProject | Project>): ChapterStat[] {
  const map = new Map<string, ChapterStat>();
  let other = 0;

  for (const p of projects) {
    const resolved = resolveChapterLabel(p.chapter ?? "");
    if (!resolved) {
      // Not in either directory — a one-off, a typo, or a placeholder. It is a
      // real build either way, so it is counted, just not named on the board.
      other += 1;
      continue;
    }
    const key = chapterMatchKey(resolved, p.country);
    const cur = map.get(key);
    if (cur) cur.count += 1;
    else map.set(key, { chapter: resolved, country: p.country, count: 1 });
  }

  const rows = [...map.values()].sort((a, b) => b.count - a.count);
  // Always last, however many it holds — it is a remainder, not a ranking.
  if (other > 0) rows.push({ chapter: OTHER_CHAPTER, country: "", count: other });
  return rows;
}

/**
 * Projects grouped by country, most projects first. Ties break alphabetically
 * so the ordering is stable across renders rather than depending on insertion
 * order (which changes as new projects arrive).
 */
export function countryStats(projects: ReadonlyArray<PublicProject | Project>): CountryStat[] {
  const counts = new Map<string, number>();
  const chapters = new Map<string, Set<string>>();
  for (const p of projects) {
    const country = p.country.trim();
    if (!country) continue;
    counts.set(country, (counts.get(country) ?? 0) + 1);
    const set = chapters.get(country) ?? new Set<string>();
    set.add(chapterMatchKey(p.chapter, country));
    chapters.set(country, set);
  }
  return [...counts.entries()]
    .map(([country, count]) => ({ country, count, chapters: chapters.get(country)?.size ?? 0 }))
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country, "en"));
}
