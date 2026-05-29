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

export type Project = {
  id: string;
  trackNumber: number;
  projectName: string;
  builderName: string;
  builderImage?: string;
  /** Private — verified Google email of the submitter. Never displayed publicly. */
  submittedByEmail?: string;
  chapter: string;
  country: string;
  repoUrl: string;
  demoUrl?: string;
  videoUrl?: string;
  screenshotUrl?: string;
  description?: string;
  surprise: string;
  /** ISO 8601 string. Sorts lexicographically the same way real dates do. */
  submittedAt: string;
};

/** Public-safe view of a project — strips fields that should never reach the client. */
export type PublicProject = Omit<Project, "submittedByEmail">;

export type ChapterStat = {
  chapter: string;
  country: string;
  count: number;
};

export type StorageBackend = "firestore" | "local";

type BackendModule = {
  listProjectsRaw: () => Promise<Project[]>;
  addProject: (p: Omit<Project, "id" | "submittedAt">) => Promise<Project>;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { submittedByEmail, ...rest } = p;
  return rest;
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

export function chapterStats(projects: ReadonlyArray<PublicProject | Project>): ChapterStat[] {
  const map = new Map<string, ChapterStat>();
  for (const p of projects) {
    const key = chapterMatchKey(p.chapter, p.country);
    const cur = map.get(key);
    if (cur) {
      cur.count += 1;
    } else {
      // First sighting wins the display label — keeps the canonical form stable
      // even if later submissions arrive with messier casing.
      map.set(key, { chapter: normalizeChapter(p.chapter), country: p.country, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}
