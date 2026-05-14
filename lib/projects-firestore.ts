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
