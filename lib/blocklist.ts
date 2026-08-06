/**
 * Blocklist storage — Firestore-backed in prod, file-backed in dev.
 *
 * Mirrors lib/admins.ts: the collection is keyed by lowercased email (also the
 * doc id), so isBlocked(email) is always a single point lookup. Entries are
 * managed through the /admin UI.
 *
 * A blocked email is rejected at two layers:
 *   1. auth.ts signIn callback — they can't get a session at all.
 *   2. POST /api/projects — defense in depth for anyone holding a live cookie
 *      issued before the block landed.
 */
export type BlockedUser = {
  /** Lowercased email. Also the doc id. */
  email: string;
  /** Free-text reason, shown only to admins. */
  reason: string;
  /** ISO timestamp when this block was applied. */
  blockedAt: string;
  /** Email of the admin who applied the block. */
  blockedBy: string;
  /** How many times this account has tried to sign in since being blocked. */
  attempts?: number;
  /** ISO timestamp of the most recent blocked sign-in attempt. */
  lastAttemptAt?: string;
};

type BlocklistBackend = {
  isBlocked: (email: string) => Promise<boolean>;
  listBlocked: () => Promise<BlockedUser[]>;
  addBlocked: (email: string, reason: string, blockedBy: string) => Promise<BlockedUser>;
  removeBlocked: (email: string) => Promise<boolean>;
  recordAttempt: (email: string) => Promise<void>;
};

function pickBackend(): "firestore" | "local" {
  const explicit = process.env.STORAGE_BACKEND?.toLowerCase();
  if (explicit === "local") return "local";
  if (explicit === "firestore") return "firestore";
  return process.env.NODE_ENV === "production" ? "firestore" : "local";
}

const ACTIVE_BACKEND = pickBackend();

let backendPromise: Promise<BlocklistBackend> | null = null;

function getBackend(): Promise<BlocklistBackend> {
  if (backendPromise) return backendPromise;
  backendPromise =
    ACTIVE_BACKEND === "firestore"
      ? (import("./blocklist-firestore") as Promise<BlocklistBackend>)
      : (import("./blocklist-fs") as Promise<BlocklistBackend>);
  return backendPromise;
}

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Fails OPEN — the opposite of isAdmin(), deliberately. This gates every
 * sign-in, so treating a Firestore blip as "everyone is blocked" would take the
 * whole site down. A banned spammer slipping through during an outage is the
 * cheaper failure. The error is logged loudly so the outage is still visible.
 */
export async function isBlocked(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const n = normalize(email);
  if (!n) return false;
  try {
    const backend = await getBackend();
    return await backend.isBlocked(n);
  } catch (err) {
    console.error(`[blocklist] isBlocked check failed — allowing through.`, err);
    return false;
  }
}

export async function listBlocked(): Promise<BlockedUser[]> {
  try {
    const backend = await getBackend();
    return await backend.listBlocked();
  } catch (err) {
    console.error(`[blocklist] listBlocked failed.`, err);
    return [];
  }
}

export async function addBlocked(
  email: string,
  reason: string,
  blockedBy: string,
): Promise<BlockedUser> {
  const backend = await getBackend();
  return backend.addBlocked(normalize(email), reason.trim(), normalize(blockedBy));
}

export async function removeBlocked(email: string): Promise<boolean> {
  const backend = await getBackend();
  return backend.removeBlocked(normalize(email));
}

/**
 * Records a blocked sign-in attempt on the moderation record so organizers can
 * see repeat attempts in /admin. Best-effort: a failure here must never turn
 * into a 500 on the auth path, so it swallows and logs.
 */
export async function recordAttempt(email: string | null | undefined): Promise<void> {
  if (!email) return;
  try {
    const backend = await getBackend();
    await backend.recordAttempt(normalize(email));
  } catch (err) {
    console.error(`[blocklist] recordAttempt failed for ${email}.`, err);
  }
}
