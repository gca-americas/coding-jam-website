import { promises as fs } from "fs";
import path from "path";
import { SlugTakenError, type Jam, type JamPatch } from "./jams";

const DATA_FILE = path.join(process.cwd(), "data", "jams.json");

async function readAll(): Promise<Jam[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Jam[];
  } catch {
    return [];
  }
}

async function writeAll(rows: Jam[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(rows, null, 2), "utf-8");
}

export async function getJam(slug: string): Promise<Jam | null> {
  const all = await readAll();
  return all.find((j) => j.slug === slug) ?? null;
}

export async function listJams(): Promise<Jam[]> {
  return readAll();
}

export async function listJamsByOrganizer(email: string): Promise<Jam[]> {
  const all = await readAll();
  return all.filter((j) => j.organizerEmail === email);
}

export async function listPublishedJams(): Promise<Jam[]> {
  const all = await readAll();
  return all.filter((j) => j.status === "published");
}

export async function createJam(jam: Omit<Jam, "createdAt" | "updatedAt">): Promise<Jam> {
  const all = await readAll();
  if (all.some((j) => j.slug === jam.slug)) throw new SlugTakenError(jam.slug);
  const now = new Date().toISOString();
  const row: Jam = { ...jam, createdAt: now, updatedAt: now };
  all.push(row);
  await writeAll(all);
  return row;
}

export async function updateJam(slug: string, patch: JamPatch): Promise<Jam | null> {
  const all = await readAll();
  const row = all.find((j) => j.slug === slug);
  if (!row) return null;
  // Matches the Firestore backend: undefined leaves a field alone, null clears it.
  const target = row as unknown as Record<string, unknown>;
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    if (v === null) delete target[k];
    else target[k] = v;
  }
  row.updatedAt = new Date().toISOString();
  await writeAll(all);
  return row;
}

export async function deleteJam(slug: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((j) => j.slug !== slug);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}
