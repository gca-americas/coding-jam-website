/**
 * Admin storage — Firestore-backed in prod, file-backed in dev.
 *
 * The collection is keyed by lowercased email (also the doc id), so
 * isAdmin(email) is always a single point lookup. Add/remove happens through
 * the /admin UI itself; bootstrapping the very first admin happens via
 * `scripts/seed-admin.mjs`.
 */
export type Admin = {
  /** Lowercased email. Also the doc id. */
  email: string;
  /** ISO timestamp when this admin was added. */
  addedAt: string;
  /** Email of the admin who added this one, or "bootstrap" for the seed run. */
  addedBy: string;
};

type AdminsBackend = {
  isAdmin: (email: string) => Promise<boolean>;
  listAdmins: () => Promise<Admin[]>;
  addAdmin: (email: string, addedBy: string) => Promise<Admin>;
  removeAdmin: (email: string) => Promise<boolean>;
};

function pickBackend(): "firestore" | "local" {
  const explicit = process.env.STORAGE_BACKEND?.toLowerCase();
  if (explicit === "local") return "local";
  if (explicit === "firestore") return "firestore";
  return process.env.NODE_ENV === "production" ? "firestore" : "local";
}

const ACTIVE_BACKEND = pickBackend();

let backendPromise: Promise<AdminsBackend> | null = null;

function getBackend(): Promise<AdminsBackend> {
  if (backendPromise) return backendPromise;
  backendPromise =
    ACTIVE_BACKEND === "firestore"
      ? (import("./admins-firestore") as Promise<AdminsBackend>)
      : (import("./admins-fs") as Promise<AdminsBackend>);
  return backendPromise;
}

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

export async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const n = normalize(email);
  if (!n) return false;
  try {
    const backend = await getBackend();
    return await backend.isAdmin(n);
  } catch (err) {
    // Fail closed — if we can't tell, deny access.
    console.error(`[admins] isAdmin check failed — denying.`, err);
    return false;
  }
}

export async function listAdmins(): Promise<Admin[]> {
  try {
    const backend = await getBackend();
    return await backend.listAdmins();
  } catch (err) {
    console.error(`[admins] listAdmins failed.`, err);
    return [];
  }
}

export async function addAdmin(email: string, addedBy: string): Promise<Admin> {
  const backend = await getBackend();
  return backend.addAdmin(normalize(email), normalize(addedBy));
}

export async function removeAdmin(email: string): Promise<boolean> {
  const backend = await getBackend();
  return backend.removeAdmin(normalize(email));
}
