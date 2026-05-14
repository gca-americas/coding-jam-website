import { promises as fs } from "fs";
import path from "path";
import type { Project } from "./projects";

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
