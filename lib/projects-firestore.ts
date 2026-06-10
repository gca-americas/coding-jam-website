import { Filter } from "@google-cloud/firestore";
import { db, PROJECTS_COLLECTION } from "./firestore";
import type { Project } from "./projects";

export async function listProjectsRaw(): Promise<Project[]> {
  const snap = await db
    .collection(PROJECTS_COLLECTION)
    .orderBy("submittedAt", "desc")
    .get();
  return snap.docs.map((doc) => {
    const data = doc.data() as Omit<Project, "id">;
    return { id: doc.id, ...data };
  });
}

export async function addProject(p: Omit<Project, "id" | "submittedAt">): Promise<Project> {
  const submittedAt = new Date().toISOString();
  // Strip undefined fields — Firestore rejects them.
  const payload: Record<string, unknown> = { submittedAt };
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined) payload[k] = v;
  }
  const ref = await db.collection(PROJECTS_COLLECTION).add(payload);
  return { id: ref.id, submittedAt, ...p };
}

/** Sort newest-first by ISO submittedAt — works lex-on-string. */
function sortByDateDesc(rows: Project[]): Project[] {
  return rows.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

export async function listProjectsByEmail(email: string): Promise<Project[]> {
  // Firestore disjunction across two fields. Emails are stored lowercased
  // on write so exact match is enough. We avoid orderBy() here because pairing
  // OR + array-contains + orderBy requires multiple composite indexes; for
  // one user's submissions the dataset is tiny so we sort in memory instead.
  const snap = await db
    .collection(PROJECTS_COLLECTION)
    .where(
      Filter.or(
        Filter.where("submittedByEmail", "==", email),
        Filter.where("collaboratorEmails", "array-contains", email),
      ),
    )
    .get();
  const rows = snap.docs.map((doc) => {
    const data = doc.data() as Omit<Project, "id">;
    return { id: doc.id, ...data };
  });
  return sortByDateDesc(rows);
}

export async function listProjectsByProfileId(id: string): Promise<Project[]> {
  // Same as listProjectsByEmail — skip orderBy() and sort in JS to avoid
  // composite-index requirements for the OR + array-contains query.
  const snap = await db
    .collection(PROJECTS_COLLECTION)
    .where(
      Filter.or(
        Filter.where("submitterProfileId", "==", id),
        Filter.where("collaboratorProfileIds", "array-contains", id),
      ),
    )
    .get();
  const rows = snap.docs.map((doc) => {
    const data = doc.data() as Omit<Project, "id">;
    return { id: doc.id, ...data };
  });
  return sortByDateDesc(rows);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const snap = await db.collection(PROJECTS_COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data() as Omit<Project, "id">;
  return { id: snap.id, ...data };
}

export async function updateProject(
  id: string,
  patch: Partial<Omit<Project, "id" | "submittedAt">>,
): Promise<Project | null> {
  const ref = db.collection(PROJECTS_COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  // Strip undefined — Firestore rejects undefined values.
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) clean[k] = v;
  }
  await ref.update(clean);
  const after = await ref.get();
  const data = after.data() as Omit<Project, "id">;
  return { id: after.id, ...data };
}

export async function deleteProject(id: string): Promise<boolean> {
  const ref = db.collection(PROJECTS_COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return false;
  await ref.delete();
  return true;
}
