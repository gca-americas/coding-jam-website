import { Firestore } from "@google-cloud/firestore";

/**
 * Firestore client singleton.
 *
 * Auth is via Application Default Credentials (ADC):
 *   - Locally:   `gcloud auth application-default login`
 *   - On GCP:    the runtime service account is used automatically
 *                (Cloud Run / Cloud Functions / GKE Workload Identity)
 *
 * Project ID resolution order:
 *   1. GOOGLE_CLOUD_PROJECT env var (auto-set on GCP runtimes)
 *   2. Hardcoded fallback "codingjam-americas"
 *
 * The IAM role you need on the runtime service account is `roles/datastore.user`
 * (which covers Firestore Native mode reads + writes).
 */
const projectId = process.env.GOOGLE_CLOUD_PROJECT || "codingjam-americas";

// Reuse the same client across hot-reloads in dev so we don't leak connections.
declare global {
  // eslint-disable-next-line no-var
  var __firestore: Firestore | undefined;
}

export const db: Firestore =
  globalThis.__firestore ?? new Firestore({ projectId, preferRest: true });

if (process.env.NODE_ENV !== "production") {
  globalThis.__firestore = db;
}

export const PROJECTS_COLLECTION = "projects";
