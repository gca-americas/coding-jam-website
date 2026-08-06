import { FieldValue } from "@google-cloud/firestore";
import { db } from "./firestore";
import type { BlockedUser } from "./blocklist";

const COLLECTION = "blocklist";

export async function isBlocked(email: string): Promise<boolean> {
  const snap = await db.collection(COLLECTION).doc(email).get();
  return snap.exists;
}

export async function listBlocked(): Promise<BlockedUser[]> {
  const snap = await db.collection(COLLECTION).get();
  const rows = snap.docs.map((d) => ({ ...(d.data() as BlockedUser), email: d.id }));
  return rows.sort((a, b) => (a.blockedAt < b.blockedAt ? -1 : 1));
}

export async function addBlocked(
  email: string,
  reason: string,
  blockedBy: string,
): Promise<BlockedUser> {
  const ref = db.collection(COLLECTION).doc(email);
  const existing = await ref.get();
  if (existing.exists) return { ...(existing.data() as BlockedUser), email };
  const row: BlockedUser = { email, reason, blockedAt: new Date().toISOString(), blockedBy };
  await ref.set(row);
  return row;
}

export async function removeBlocked(email: string): Promise<boolean> {
  const ref = db.collection(COLLECTION).doc(email);
  const existing = await ref.get();
  if (!existing.exists) return false;
  await ref.delete();
  return true;
}

export async function recordAttempt(email: string): Promise<void> {
  const ref = db.collection(COLLECTION).doc(email);
  // Atomic increment — concurrent retries from the same account won't race.
  await ref.update({
    attempts: FieldValue.increment(1),
    lastAttemptAt: new Date().toISOString(),
  });
}
