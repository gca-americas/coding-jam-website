#!/usr/bin/env node
/**
 * Bootstrap the first admin — chicken-and-egg solver for the /admin page.
 * After running this once, all further admin changes happen through the UI.
 *
 * Usage:
 *   node scripts/seed-admin.mjs <email>                  # local file backend
 *   STORAGE_BACKEND=firestore node scripts/seed-admin.mjs <email>   # prod Firestore
 *
 * Idempotent. If the admin already exists, nothing is written.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const email = (process.argv[2] || "").trim().toLowerCase();
if (!email) {
  console.error("Usage: node scripts/seed-admin.mjs <email>");
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error(`Not a valid email: ${email}`);
  process.exit(1);
}

const backend = (process.env.STORAGE_BACKEND || "").toLowerCase() === "firestore" ? "firestore" : "local";
console.log(`→ backend: ${backend}  email: ${email}`);

if (backend === "local") {
  const file = path.join(process.cwd(), "data", "admins.json");
  let rows = [];
  try {
    rows = JSON.parse(await fs.readFile(file, "utf-8"));
  } catch {
    // missing file is fine
  }
  if (rows.some((a) => a.email === email)) {
    console.log(`✓ ${email} is already an admin (no change).`);
    process.exit(0);
  }
  rows.push({ email, addedAt: new Date().toISOString(), addedBy: "bootstrap" });
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(rows, null, 2) + "\n", "utf-8");
  console.log(`✓ wrote ${file}`);
} else {
  const { Firestore } = await import("@google-cloud/firestore");
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || "codingjam-americas";
  const db = new Firestore({ projectId });
  const ref = db.collection("admins").doc(email);
  const existing = await ref.get();
  if (existing.exists) {
    console.log(`✓ ${email} is already an admin in ${projectId} (no change).`);
    process.exit(0);
  }
  await ref.set({ email, addedAt: new Date().toISOString(), addedBy: "bootstrap" });
  console.log(`✓ wrote admins/${email} in ${projectId}`);
}
