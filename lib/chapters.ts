import GDG_CHAPTERS from "@/data/gdg-chapters.json";
import GDG_CAMPUSES from "@/data/gdg-campus.json";

/**
 * Chapter directories.
 *
 * SERVER ONLY — these two JSON files are ~1,500 entries combined. Never import
 * this module from a client component or they land in the browser bundle. The
 * picker fetches them on demand from /api/chapters instead.
 */
export type ChapterType = "gdg" | "campus" | "other";

export const CHAPTER_TYPES: ChapterType[] = ["gdg", "campus", "other"];

export function isChapterType(v: unknown): v is ChapterType {
  return typeof v === "string" && (CHAPTER_TYPES as string[]).includes(v);
}

export function chapterList(type: ChapterType): string[] {
  if (type === "gdg") return GDG_CHAPTERS as string[];
  if (type === "campus") return GDG_CAMPUSES as string[];
  return [];
}

/**
 * Case- and accent-insensitive comparison key. Submitters type "Montreal" for
 * "Montréal" and "Sao Paulo" for "São Paulo"; both should match the directory.
 */
export function foldChapter(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Case- and accent-insensitive lookup returning the canonical entry, or null. */
export function canonicalChapterName(type: ChapterType, name: string): string | null {
  const needle = foldChapter(name);
  if (!needle) return null;
  return chapterList(type).find((c) => foldChapter(c) === needle) ?? null;
}

/** The display label stored on the project, e.g. "GDG on Campus Stanford University". */
export function formatChapter(type: ChapterType, name: string): string {
  const clean = name.replace(/\s+/g, " ").trim();
  if (type === "gdg") return `GDG ${clean}`;
  if (type === "campus") return `GDG on Campus ${clean}`;
  return clean;
}

/**
 * Reverse of formatChapter, for seeding the edit form.
 *
 * Falls back to "other" when the stored label doesn't resolve to a directory
 * entry. That keeps pre-directory submissions (e.g. "GDG Boston", which has no
 * plain "Boston" entry) editable instead of trapping them behind validation.
 */
export function parseChapter(chapter: string): { type: ChapterType; name: string } {
  const clean = chapter.replace(/\s+/g, " ").trim();

  // Tolerate a separator after the prefix: "GDG on Campus - DePauw University".
  const campusPrefix = /^GDG on Campus\s*[-–—:]?\s*/i;
  if (campusPrefix.test(clean)) {
    const canon = canonicalChapterName("campus", clean.replace(campusPrefix, ""));
    if (canon) return { type: "campus", name: canon };
  }

  const gdgPrefix = /^GDG\s*[-–—:]?\s*/i;
  if (gdgPrefix.test(clean)) {
    const canon = canonicalChapterName("gdg", clean.replace(gdgPrefix, ""));
    if (canon) return { type: "gdg", name: canon };
  }

  // Unprefixed but an exact directory entry ("Pato Branco") — common in older
  // submissions made before the picker existed.
  const bareGdg = canonicalChapterName("gdg", clean);
  if (bareGdg) return { type: "gdg", name: bareGdg };
  const bareCampus = canonicalChapterName("campus", clean);
  if (bareCampus) return { type: "campus", name: bareCampus };

  return { type: "other", name: clean };
}

/**
 * Validates a submitted (type, name) pair and returns the label to store.
 * Returns null when the name isn't in the directory for a GDG/campus type.
 */
export function resolveChapter(type: ChapterType, name: string): string | null {
  const clean = name.replace(/\s+/g, " ").trim();
  if (!clean) return null;
  if (type === "other") return clean.slice(0, 80);
  const canon = canonicalChapterName(type, clean);
  if (!canon) return null;
  return formatChapter(type, canon);
}
