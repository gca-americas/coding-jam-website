/**
 * Jam slug rules.
 *
 * A jam's URL is assigned, not chosen: five digits, e.g. /jam/48213. Organizers
 * run a jam most weeks, so anything derived from the title collides constantly
 * and pushes them into inventing `-week-2` / `-nov` / `-v2` variations. A short
 * number is the thing you actually want at the end of this — it fits on a slide,
 * it reads aloud cleanly, and there's no URL for anyone to get wrong.
 *
 * Deliberately free of any storage import: /api/upload validates the jam slug in
 * its request path, and lib/jams.ts re-exports everything here, so server code
 * can keep importing from one place without dragging Firestore anywhere new.
 *
 * validateSlug() still accepts the older word slugs — jams created before this
 * keep their URLs, and nothing here rewrites them.
 */
export const SLUG_MIN = 3;
export const SLUG_MAX = 40;

/**
 * Top-level route names a jam slug must not shadow. /jam/<slug> is namespaced
 * so these can't actually collide today, but reserving them keeps the door open
 * to promoting jams to top-level URLs later, and stops slugs that read like
 * site chrome ("admin", "login") from being used to impersonate it. Generated
 * slugs are all-numeric and can never land on one; this guards the older word
 * slugs and anything arriving over the API.
 */
const RESERVED_SLUGS = new Set([
  "about", "admin", "api", "auth", "banned", "edit", "favicon", "help", "jam", "jams",
  "login", "logout", "me", "new", "organizer", "organizers", "preview", "public",
  "robots", "settings", "showcase", "signin", "signout", "sitemap", "static",
  "submit", "tracks", "try", "u", "_next",
]);

/**
 * Digits in a generated jam URL.
 *
 * Five gives 90,000 addresses. That is not enough to draw blind forever — by a
 * few thousand jams, repeat draws are common — so newSlug() is always paired
 * with a retry against the store rather than trusted on its own.
 */
export const SLUG_DIGITS = 5;
const SLUG_FLOOR = 10 ** (SLUG_DIGITS - 1);
const SLUG_SPAN = 9 * SLUG_FLOOR;

/** A candidate jam URL. Never leading-zero, so every one is the same length. */
export function newSlug(): string {
  return String(SLUG_FLOOR + Math.floor(Math.random() * SLUG_SPAN));
}

export function validateSlug(raw: string): { slug: string } | { error: string } {
  const slug = raw.trim().toLowerCase();
  if (!slug) return { error: "Missing jam URL." };
  if (slug.length < SLUG_MIN) return { error: `The URL needs at least ${SLUG_MIN} characters.` };
  if (slug.length > SLUG_MAX) return { error: `The URL is limited to ${SLUG_MAX} characters.` };
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
    return { error: "Use lowercase letters, numbers and hyphens — starting and ending with a letter or number." };
  }
  if (slug.includes("--")) return { error: "Use single hyphens between words." };
  if (RESERVED_SLUGS.has(slug)) return { error: `"${slug}" is reserved.` };
  return { slug };
}
