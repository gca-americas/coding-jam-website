import { promises as fs } from "fs";
import path from "path";
import type { Admin } from "./admins";

const DATA_FILE = path.join(process.cwd(), "data", "admins.json");

async function readAll(): Promise<Admin[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Admin[];
  } catch {
    return [];
  }
}

async function writeAll(admins: Admin[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(admins, null, 2), "utf-8");
}

export async function isAdmin(email: string): Promise<boolean> {
  const all = await readAll();
  return all.some((a) => a.email === email);
}

export async function listAdmins(): Promise<Admin[]> {
  const all = await readAll();
  return [...all].sort((a, b) => (a.addedAt < b.addedAt ? -1 : 1));
}

export async function addAdmin(email: string, addedBy: string): Promise<Admin> {
  const all = await readAll();
  const existing = all.find((a) => a.email === email);
  if (existing) return existing;
  const admin: Admin = { email, addedAt: new Date().toISOString(), addedBy };
  all.push(admin);
  await writeAll(all);
  return admin;
}

export async function removeAdmin(email: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((a) => a.email !== email);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}
