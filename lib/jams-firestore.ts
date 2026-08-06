import { FieldValue, type DocumentSnapshot } from "@google-cloud/firestore";
import { db } from "./firestore";
import { SlugTakenError, type Jam, type JamPatch } from "./jams";

const COLLECTION = "jams";

/** Firestore rejects undefined values — most jam fields are optional. */
function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) clean[k] = v;
  }
  return clean;
}

/**
 * Patch semantics: `undefined` leaves a field alone, `null` clears it. Without
 * the null case an organizer could never remove an optional field — dropping
 * the RSVP link from the form would silently keep the old one forever.
 */
function preparePatch(patch: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    out[k] = v === null ? FieldValue.delete() : v;
  }
  return out;
}

function fromDoc(d: DocumentSnapshot): Jam {
  return { ...(d.data() as Jam), slug: d.id };
}

export async function getJam(slug: string): Promise<Jam | null> {
  const snap = await db.collection(COLLECTION).doc(slug).get();
  return snap.exists ? fromDoc(snap) : null;
}

export async function listJams(): Promise<Jam[]> {
  const snap = await db.collection(COLLECTION).get();
  return snap.docs.map(fromDoc);
}

export async function listJamsByOrganizer(email: string): Promise<Jam[]> {
  // No orderBy here — pairing a where() with orderBy on a different field wants
  // a composite index, and one organizer's jams are few enough to sort in JS.
  // lib/jams.ts sorts the result. Same tradeoff as projects-firestore.ts.
  const snap = await db.collection(COLLECTION).where("organizerEmail", "==", email).get();
  return snap.docs.map(fromDoc);
}

export async function listPublishedJams(): Promise<Jam[]> {
  const snap = await db.collection(COLLECTION).where("status", "==", "published").get();
  return snap.docs.map(fromDoc);
}

export async function createJam(jam: Omit<Jam, "createdAt" | "updatedAt">): Promise<Jam> {
  const now = new Date().toISOString();
  const row: Jam = { ...jam, createdAt: now, updatedAt: now };
  const ref = db.collection(COLLECTION).doc(jam.slug);
  try {
    // create() fails if the doc exists — atomic, unlike get-then-set.
    await ref.create(stripUndefined(row as unknown as Record<string, unknown>));
  } catch (err) {
    // 6 = ALREADY_EXISTS
    if ((err as { code?: number }).code === 6) throw new SlugTakenError(jam.slug);
    throw err;
  }
  return row;
}

export async function updateJam(slug: string, patch: JamPatch): Promise<Jam | null> {
  const ref = db.collection(COLLECTION).doc(slug);
  const existing = await ref.get();
  if (!existing.exists) return null;
  await ref.update(
    preparePatch({ ...patch, updatedAt: new Date().toISOString() } as Record<string, unknown>),
  );
  const after = await ref.get();
  return fromDoc(after);
}

export async function deleteJam(slug: string): Promise<boolean> {
  const ref = db.collection(COLLECTION).doc(slug);
  const existing = await ref.get();
  if (!existing.exists) return false;
  await ref.delete();
  return true;
}
