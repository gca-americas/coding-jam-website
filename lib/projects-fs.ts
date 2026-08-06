import { promises as fs } from "fs";
import path from "path";
import type { Project, ProjectPatch } from "./projects";

const DATA_FILE = path.join(process.cwd(), "data", "projects.json");

async function readAll(): Promise<Project[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

async function writeAll(projects: Project[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2), "utf-8");
}

export async function listProjectsRaw(): Promise<Project[]> {
  const all = await readAll();
  return [...all].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

export async function addProject(p: Omit<Project, "id" | "submittedAt">): Promise<Project> {
  const all = await readAll();
  const project: Project = {
    ...p,
    id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4),
    submittedAt: new Date().toISOString(),
  };
  all.unshift(project);
  await writeAll(all);
  return project;
}

export async function listProjectsByEmail(email: string): Promise<Project[]> {
  const all = await listProjectsRaw();
  return all.filter(
    (p) =>
      p.submittedByEmail?.toLowerCase() === email ||
      p.collaboratorEmails?.some((e) => e.toLowerCase() === email),
  );
}

export async function listProjectsByProfileId(id: string): Promise<Project[]> {
  const all = await listProjectsRaw();
  return all.filter(
    (p) =>
      p.submitterProfileId === id ||
      p.collaboratorProfileIds?.includes(id),
  );
}

export async function getProjectById(id: string): Promise<Project | null> {
  const all = await readAll();
  return all.find((p) => p.id === id) ?? null;
}

export async function updateProject(id: string, patch: ProjectPatch): Promise<Project | null> {
  const all = await readAll();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  // `undefined` leaves a field alone so `{ foo: undefined }` can't blow away an
  // existing value; `null` removes it — that's how jam attribution is cleared.
  const updated = { ...all[idx] } as Record<string, unknown>;
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    if (v === null) delete updated[k];
    else updated[k] = v;
  }
  all[idx] = updated as Project;
  await writeAll(all);
  return all[idx];
}

export async function deleteProject(id: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((p) => p.id !== id);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}
