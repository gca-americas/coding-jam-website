/**
 * Shared request validation for the organizer roster endpoints.
 *
 * Colocated with the routes rather than in lib/ because it is HTTP-shaped —
 * it turns an untrusted JSON body into the exact fields lib/organizers.ts
 * expects, and nothing else calls it. `requireAll` is the only difference
 * between the create (POST) and edit (PATCH) contracts.
 */
import { isChapterType, resolveChapter } from "@/lib/chapters";
import { canonicalCountry } from "@/lib/countries";
import type { OrganizerChapterType } from "@/lib/organizers";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_DISPLAY_NAME = 60;

export type OrganizerFields = {
  displayName?: string;
  isGde?: boolean;
  chapter?: string;
  chapterType?: OrganizerChapterType;
  chapterName?: string;
  country?: string;
};

export type ParseResult =
  | { email: string; fields: OrganizerFields }
  | { error: string };

function str(v: unknown): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";
}

export function parseOrganizerInput(
  body: Record<string, unknown>,
  { requireAll }: { requireAll: boolean },
): ParseResult {
  const email = str(body.email).toLowerCase();
  if (requireAll && !EMAIL_RE.test(email)) {
    return { error: "Not a valid email." };
  }

  const fields: OrganizerFields = {};

  const hasDisplayName = body.displayName !== undefined;
  if (requireAll || hasDisplayName) {
    const displayName = str(body.displayName);
    if (!displayName) return { error: "Display name is required." };
    if (displayName.length > MAX_DISPLAY_NAME) {
      return { error: `Display name is too long (max ${MAX_DISPLAY_NAME} characters).` };
    }
    fields.displayName = displayName;
  }

  // Chapter is a (type, name) pair that has to resolve against the directory —
  // the stored `chapter` is the display label the pair produces.
  const hasChapter = body.chapterType !== undefined || body.chapterName !== undefined;
  if (requireAll || hasChapter) {
    const chapterType = str(body.chapterType);
    if (!isChapterType(chapterType)) {
      return { error: "Pick a chapter type." };
    }
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

  // Checkbox: absent means "leave alone" on a patch, false on a create.
  if (requireAll || body.isGde !== undefined) {
    fields.isGde = body.isGde === true;
  }

  if (!requireAll && Object.keys(fields).length === 0) {
    return { error: "Nothing to update." };
  }

  return { email, fields };
}
