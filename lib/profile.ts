import { createHash } from "crypto";

/**
 * Opaque, stable, irreversible identifier derived from an email. Used as the
 * /u/[id] slug for public builder profiles — never expose the raw email.
 *
 * SHA-256 truncated to 12 hex chars (~48 bits). That's plenty of room for any
 * realistic active builder count without collisions, and short enough to fit
 * in a URL without being ugly.
 */
export function emailToProfileId(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return "";
  return createHash("sha256").update(normalized).digest("hex").slice(0, 12);
}
