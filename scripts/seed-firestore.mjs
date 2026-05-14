#!/usr/bin/env node
// One-shot seeder: pushes data/projects.json into Firestore.
// Idempotent — uses the existing `id` field as the doc ID, so re-running just overwrites.
//
// Run:
//   gcloud auth application-default login   # one time, locally
//   npm run seed
//
// Override the project with:
//   GOOGLE_CLOUD_PROJECT=other-project npm run seed
//
// Add --wipe to delete every existing project before seeding (DESTRUCTIVE):
//   npm run seed -- --wipe

import { Firestore } from "@google-cloud/firestore";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "codingjam-americas";
const COLLECTION = "projects";
const SEED_FILE = path.join(__dirname, "..", "data", "projects.json");
const WIPE = process.argv.includes("--wipe");

async function main() {
  console.log(`→ Project: ${PROJECT_ID}`);
  console.log(`→ Collection: ${COLLECTION}`);
  console.log(`→ Seed file: ${SEED_FILE}`);

  const db = new Firestore({ projectId: PROJECT_ID });
  const col = db.collection(COLLECTION);

  if (WIPE) {
    console.log("→ --wipe flag set, deleting existing docs first…");
    const snap = await col.get();
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    console.log(`  deleted ${snap.size} existing doc(s)`);
  }

  const raw = await readFile(SEED_FILE, "utf-8");
  const seeds = JSON.parse(raw);
  console.log(`→ Loaded ${seeds.length} seed project(s)`);

  const batch = db.batch();
  for (const p of seeds) {
    const { id, ...rest } = p;
    if (!id) {
      console.warn(`  skipping seed with no id:`, rest.projectName);
      continue;
    }
    // Strip empty-string optional URL fields so Firestore stays clean.
    const cleaned = Object.fromEntries(
      Object.entries(rest).filter(([k, v]) => {
        if (v === "" && /Url$/.test(k)) return false;
        return v !== undefined && v !== null;
      }),
    );
    batch.set(col.doc(id), cleaned);
  }
  await batch.commit();

  console.log(`✓ Seeded ${seeds.length} project(s) into ${PROJECT_ID}/${COLLECTION}`);

  // Quick sanity read
  const after = await col.orderBy("submittedAt", "desc").limit(3).get();
  console.log(`✓ Verification — newest 3 in collection:`);
  after.docs.forEach((d) => {
    const x = d.data();
    console.log(`    ${x.submittedAt}  ${x.chapter.padEnd(18)}  ${x.projectName}`);
  });
}

main().catch((err) => {
  const msg = String(err.message || err);
  console.error("✗ Seeding failed.");
  console.error(msg);
  console.error();

  // Diagnose the cause and print a single actionable next step.
  if (msg.includes("Could not load the default credentials")) {
    console.error("Cause: no Application Default Credentials on this machine.");
    console.error("Fix:   gcloud auth application-default login");
  } else if (msg.includes("has not been used in project") || msg.includes("API has not been used")) {
    console.error("Cause: Firestore API is not enabled on this project.");
    console.error(`Fix:   gcloud services enable firestore.googleapis.com --project=${PROJECT_ID}`);
    console.error("       (then wait ~30s and retry)");
  } else if (msg.includes("NOT_FOUND") || msg.includes("does not exist") || msg.includes("database (default)")) {
    console.error("Cause: no Firestore Native database exists in this project yet.");
    console.error(`Fix:   gcloud firestore databases create --location=us-central1 --project=${PROJECT_ID}`);
  } else if (msg.includes("PERMISSION_DENIED") || msg.includes("403")) {
    console.error("Cause: the active credential lacks Firestore access.");
    console.error("Fix:   grant `roles/datastore.user` on this project to your user / service account.");
  }
  process.exit(1);
});
