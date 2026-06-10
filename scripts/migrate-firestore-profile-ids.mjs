#!/usr/bin/env node
/**
 * One-shot Firestore migration: backfill submitterProfileId and
 * collaboratorProfileIds on existing project docs.
 *
 * Idempotent — safe to re-run. Skips docs that already have the fields set.
 * Also normalizes lowercase on submittedByEmail / collaboratorEmails.
 *
 * Run with:
 *   node scripts/migrate-firestore-profile-ids.mjs           # dry-run (default)
 *   node scripts/migrate-firestore-profile-ids.mjs --apply   # actually writes
 *
 * Override project via env var:
 *   GOOGLE_CLOUD_PROJECT=foo node scripts/migrate-firestore-profile-ids.mjs --apply
 */
import { createHash } from "node:crypto";
import { Firestore } from "@google-cloud/firestore";

const APPLY = process.argv.includes("--apply");
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "codingjam-americas";
const COLLECTION = "projects";

function emailToProfileId(email) {
  const n = String(email).trim().toLowerCase();
  if (!n) return "";
  return createHash("sha256").update(n).digest("hex").slice(0, 12);
}

const db = new Firestore({ projectId: PROJECT_ID });

console.log(`${APPLY ? "→ APPLYING" : "→ DRY RUN"}  project=${PROJECT_ID}  collection=${COLLECTION}`);

const snap = await db.collection(COLLECTION).get();
console.log(`✓ Loaded ${snap.size} doc(s)`);

let touched = 0;
let skipped = 0;

for (const doc of snap.docs) {
  const v = doc.data();
  const patch = {};

  // submittedByEmail → lowercase + submitterProfileId
  if (v.submittedByEmail) {
    const lower = String(v.submittedByEmail).trim().toLowerCase();
    if (lower !== v.submittedByEmail) patch.submittedByEmail = lower;
    if (!v.submitterProfileId) patch.submitterProfileId = emailToProfileId(lower);
  }

  // legacy singular collaboratorEmail → plural array + collaboratorProfileIds
  if (v.collaboratorEmail && !Array.isArray(v.collaboratorEmails)) {
    const lower = String(v.collaboratorEmail).trim().toLowerCase();
    patch.collaboratorEmails = [lower];
    patch.collaboratorProfileIds = [emailToProfileId(lower)];
    // Drop the legacy field — null tells Firestore to delete it on update().
    // Use FieldValue.delete() for that — but we'd need to import it. Simpler:
    // leave the legacy field in place; new queries ignore it.
  }

  // plural collaboratorEmails → backfill collaboratorProfileIds
  if (Array.isArray(v.collaboratorEmails) && !Array.isArray(v.collaboratorProfileIds)) {
    const lower = v.collaboratorEmails.map((e) => String(e).trim().toLowerCase());
    patch.collaboratorEmails = lower;
    patch.collaboratorProfileIds = lower.map(emailToProfileId);
  }

  if (Object.keys(patch).length === 0) {
    skipped++;
    continue;
  }

  touched++;
  console.log(`  ${doc.id}: ${Object.keys(patch).join(", ")}`);
  if (APPLY) {
    await doc.ref.update(patch);
  }
}

console.log();
console.log(`✓ ${touched} doc(s) ${APPLY ? "updated" : "would be updated"}`);
console.log(`✓ ${skipped} doc(s) already up to date`);
if (!APPLY) {
  console.log();
  console.log("Re-run with --apply to actually write the changes.");
}
