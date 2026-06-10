import { db } from "./firestore";
import type { Admin } from "./admins";

const COLLECTION = "admins";

export async function isAdmin(email: string): Promise<boolean> {
  const snap = await db.collection(COLLECTION).doc(email).get();
  return snap.exists;
}

export async function listAdmins(): Promise<Admin[]> {
  const snap = await db.collection(COLLECTION).get();
  const rows = snap.docs.map((d) => ({ ...(d.data() as Admin), email: d.id }));
  return rows.sort((a, b) => (a.addedAt < b.addedAt ? -1 : 1));
}

export async function addAdmin(email: string, addedBy: string): Promise<Admin> {
  const ref = db.collection(COLLECTION).doc(email);
  const existing = await ref.get();
  if (existing.exists) return { ...(existing.data() as Admin), email };
  const admin: Admin = { email, addedAt: new Date().toISOString(), addedBy };
  await ref.set(admin);
  return admin;
}

export async function removeAdmin(email: string): Promise<boolean> {
  const ref = db.collection(COLLECTION).doc(email);
  const existing = await ref.get();
  if (!existing.exists) return false;
  await ref.delete();
  return true;
}
