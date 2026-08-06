import { promises as fs } from "fs";
import path from "path";
import type { BlockedUser } from "./blocklist";

const DATA_FILE = path.join(process.cwd(), "data", "blocklist.json");

async function readAll(): Promise<BlockedUser[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as BlockedUser[];
  } catch {
    return [];
  }
}

async function writeAll(rows: BlockedUser[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(rows, null, 2), "utf-8");
}

export async function isBlocked(email: string): Promise<boolean> {
  const all = await readAll();
  return all.some((b) => b.email === email);
}

export async function listBlocked(): Promise<BlockedUser[]> {
  const all = await readAll();
  return [...all].sort((a, b) => (a.blockedAt < b.blockedAt ? -1 : 1));
}

export async function addBlocked(
  email: string,
  reason: string,
  blockedBy: string,
): Promise<BlockedUser> {
  const all = await readAll();
  const existing = all.find((b) => b.email === email);
  if (existing) return existing;
  const row: BlockedUser = { email, reason, blockedAt: new Date().toISOString(), blockedBy };
  all.push(row);
  await writeAll(all);
  return row;
}

export async function removeBlocked(email: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((b) => b.email !== email);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}

export async function recordAttempt(email: string): Promise<void> {
  const all = await readAll();
  const row = all.find((b) => b.email === email);
  if (!row) return;
  row.attempts = (row.attempts ?? 0) + 1;
  row.lastAttemptAt = new Date().toISOString();
  await writeAll(all);
}
