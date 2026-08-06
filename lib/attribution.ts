/**
 * Jam attribution display helpers.
 *
 * Free of any storage import on purpose: ProjectCard renders inside a client
 * boundary (app/me/OwnerProjectCard.tsx), so importing these from lib/projects
 * would pull its dynamic Firestore import into the browser bundle. Same reason
 * lib/slug.ts exists. lib/projects re-exports both, so server code has one
 * import site.
 */

/** Shown wherever a build has no jam behind it — which is most of them. */
export const NO_ORGANIZER = "NA";

/** Public credit for whoever ran the jam a build came from. */
export function organizerCredit(p: { organizerName?: string }): string {
  return p.organizerName?.trim() || NO_ORGANIZER;
}
