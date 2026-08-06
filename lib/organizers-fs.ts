import { promises as fs } from "fs";
import path from "path";
import type { Organizer, OrganizerPatch } from "./organizers";

const DATA_FILE = path.join(process.cwd(), "data", "organizers.json");

async function readAll(): Promise<Organizer[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Organizer[];
  } catch {
    return [];
  }
}

async function writeAll(rows: Organizer[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(rows, null, 2), "utf-8");
}

export async function isOrganizer(email: string): Promise<boolean> {
  const all = await readAll();
  return all.some((o) => o.email === email);
}

export async function getOrganizer(email: string): Promise<Organizer | null> {
  const all = await readAll();
  return all.find((o) => o.email === email) ?? null;
}

export async function listOrganizers(): Promise<Organizer[]> {
  const all = await readAll();
  return [...all].sort((a, b) => (a.addedAt < b.addedAt ? -1 : 1));
}

export async function addOrganizer(organizer: Omit<Organizer, "addedAt">): Promise<Organizer> {
  const all = await readAll();
  const existing = all.find((o) => o.email === organizer.email);
  if (existing) return existing;
  const row: Organizer = { ...organizer, addedAt: new Date().toISOString() };
  all.push(row);
  await writeAll(all);
  return row;
}

export async function updateOrganizer(
  email: string,
  patch: OrganizerPatch,
): Promise<Organizer | null> {
  const all = await readAll();
  const row = all.find((o) => o.email === email);
  if (!row) return null;
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) (row as unknown as Record<string, unknown>)[k] = v;
  }
  row.updatedAt = new Date().toISOString();
  await writeAll(all);
  return row;
}

export async function removeOrganizer(email: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((o) => o.email !== email);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}
