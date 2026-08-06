import { db } from "./firestore";
import type { Organizer, OrganizerPatch } from "./organizers";

const COLLECTION = "organizers";

/** Firestore rejects undefined values — chapterType/chapterName are optional. */
function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) clean[k] = v;
  }
  return clean;
}

export async function isOrganizer(email: string): Promise<boolean> {
  const snap = await db.collection(COLLECTION).doc(email).get();
  return snap.exists;
}

export async function getOrganizer(email: string): Promise<Organizer | null> {
  const snap = await db.collection(COLLECTION).doc(email).get();
  if (!snap.exists) return null;
  return { ...(snap.data() as Organizer), email: snap.id };
}

export async function listOrganizers(): Promise<Organizer[]> {
  const snap = await db.collection(COLLECTION).get();
  const rows = snap.docs.map((d) => ({ ...(d.data() as Organizer), email: d.id }));
  return rows.sort((a, b) => (a.addedAt < b.addedAt ? -1 : 1));
}

export async function addOrganizer(organizer: Omit<Organizer, "addedAt">): Promise<Organizer> {
  const ref = db.collection(COLLECTION).doc(organizer.email);
  const existing = await ref.get();
  // Re-adding an existing organizer is a no-op rather than an error, so the
  // admin UI stays idempotent — same contract as addAdmin().
  if (existing.exists) return { ...(existing.data() as Organizer), email: organizer.email };
  const row: Organizer = { ...organizer, addedAt: new Date().toISOString() };
  await ref.set(stripUndefined(row as unknown as Record<string, unknown>));
  return row;
}

export async function updateOrganizer(
  email: string,
  patch: OrganizerPatch,
): Promise<Organizer | null> {
  const ref = db.collection(COLLECTION).doc(email);
  const existing = await ref.get();
  if (!existing.exists) return null;
  await ref.update(
    stripUndefined({ ...patch, updatedAt: new Date().toISOString() } as Record<string, unknown>),
  );
  const after = await ref.get();
  return { ...(after.data() as Organizer), email: after.id };
}

export async function removeOrganizer(email: string): Promise<boolean> {
  const ref = db.collection(COLLECTION).doc(email);
  const existing = await ref.get();
  if (!existing.exists) return false;
  await ref.delete();
  return true;
}
