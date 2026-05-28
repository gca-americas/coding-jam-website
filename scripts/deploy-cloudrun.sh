#!/usr/bin/env bash
# Deploy GDG Coding Jams to Cloud Run.
# Idempotent — safe to re-run. Creates only what's missing.
#
# Usage:
#   bash scripts/deploy-cloudrun.sh
#
# Overrides (env vars):
#   GOOGLE_CLOUD_PROJECT  default: codingjam-americas
#   REGION                default: us-central1
#   SERVICE               default: codingjam-web
#
# The service is deployed PUBLIC (--allow-unauthenticated). Sign-in via
# Google OAuth is only required to POST a new project — reads stay open.

set -euo pipefail

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-codingjam-americas}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-codingjam-web}"
RUNTIME_SA_NAME="${SERVICE}-runtime"
RUNTIME_SA="${RUNTIME_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
UPLOADS_BUCKET="${GCS_UPLOADS_BUCKET:-${PROJECT_ID}-uploads}"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
dim()  { printf '\033[2m%s\033[0m\n' "$*"; }

bold "==> Project:  ${PROJECT_ID}"
bold "==> Region:   ${REGION}"
bold "==> Service:  ${SERVICE}"
echo

# ---------------------------------------------------------------------------
# 1. Enable required APIs (idempotent — no-op if already enabled)
# ---------------------------------------------------------------------------
bold "==> Enabling required APIs…"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  --project="${PROJECT_ID}"
echo

# ---------------------------------------------------------------------------
# 2. Runtime service account (Cloud Run will run as this identity)
# ---------------------------------------------------------------------------
if gcloud iam service-accounts describe "${RUNTIME_SA}" --project="${PROJECT_ID}" &>/dev/null; then
  dim "==> Runtime service account exists: ${RUNTIME_SA}"
else
  bold "==> Creating runtime service account…"
  gcloud iam service-accounts create "${RUNTIME_SA_NAME}" \
    --display-name="GDG Coding Jams Cloud Run runtime" \
    --project="${PROJECT_ID}"
fi
echo

# ---------------------------------------------------------------------------
# 3. IAM — Firestore + Secret Manager access for the runtime SA
# ---------------------------------------------------------------------------
bold "==> Granting IAM…"
for ROLE in roles/datastore.user roles/secretmanager.secretAccessor; do
  dim "    ${ROLE}"
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${RUNTIME_SA}" \
    --role="${ROLE}" \
    --condition=None \
    --quiet >/dev/null
done
echo

# ---------------------------------------------------------------------------
# 3b. Cloud Storage bucket for screenshot uploads
# ---------------------------------------------------------------------------
# Public-read, uniform bucket-level access. The runtime SA gets object-admin
# scoped to this bucket so we never widen permissions beyond what's needed.
bold "==> Cloud Storage uploads bucket: ${UPLOADS_BUCKET}"
if gcloud storage buckets describe "gs://${UPLOADS_BUCKET}" --project="${PROJECT_ID}" &>/dev/null; then
  dim "    bucket exists"
else
  dim "    creating bucket…"
  gcloud storage buckets create "gs://${UPLOADS_BUCKET}" \
    --project="${PROJECT_ID}" \
    --location="${REGION}" \
    --uniform-bucket-level-access \
    --quiet >/dev/null
fi

dim "    granting public read (allUsers → objectViewer)"
gcloud storage buckets add-iam-policy-binding "gs://${UPLOADS_BUCKET}" \
  --member=allUsers \
  --role=roles/storage.objectViewer \
  --project="${PROJECT_ID}" \
  --quiet >/dev/null

dim "    granting runtime SA write (objectAdmin on this bucket)"
gcloud storage buckets add-iam-policy-binding "gs://${UPLOADS_BUCKET}" \
  --member="serviceAccount:${RUNTIME_SA}" \
  --role=roles/storage.objectAdmin \
  --project="${PROJECT_ID}" \
  --quiet >/dev/null
echo

# ---------------------------------------------------------------------------
# 4. Sync secrets from .env.local → Secret Manager
# ---------------------------------------------------------------------------
read_env() {
  # Usage: read_env VAR_NAME  → echoes value, empty if missing.
  local key="$1"
  [[ -f .env.local ]] || return 0
  grep -E "^${key}=" .env.local | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

push_secret() {
  # Usage: push_secret SECRET_NAME VALUE
  local secret="$1" value="$2"
  if gcloud secrets describe "${secret}" --project="${PROJECT_ID}" &>/dev/null; then
    dim "    updating ${secret}…"
  else
    dim "    creating ${secret}…"
    gcloud secrets create "${secret}" \
      --replication-policy=automatic \
      --project="${PROJECT_ID}" >/dev/null
  fi
  printf '%s' "${value}" | gcloud secrets versions add "${secret}" \
    --data-file=- --project="${PROJECT_ID}" >/dev/null
}

bold "==> Syncing secrets from .env.local…"
MOUNT_SECRETS=""

declare -a PAIRS=(
  "AUTH_SECRET:auth-secret"
  "AUTH_GOOGLE_ID:auth-google-id"
  "AUTH_GOOGLE_SECRET:auth-google-secret"
)

for PAIR in "${PAIRS[@]}"; do
  ENV_NAME="${PAIR%%:*}"
  SECRET_NAME="${PAIR##*:}"
  VALUE="$(read_env "${ENV_NAME}" || true)"

  if [[ -n "${VALUE}" && "${VALUE}" != "replace-with-32-random-chars" ]]; then
    push_secret "${SECRET_NAME}" "${VALUE}"
    MOUNT_SECRETS+="${ENV_NAME}=${SECRET_NAME}:latest,"
  elif gcloud secrets describe "${SECRET_NAME}" --project="${PROJECT_ID}" &>/dev/null; then
    dim "    keeping existing ${SECRET_NAME} (no value in .env.local)"
    MOUNT_SECRETS+="${ENV_NAME}=${SECRET_NAME}:latest,"
  else
    dim "    skipping ${ENV_NAME} — no value in .env.local, no secret in SM"
  fi
done
MOUNT_SECRETS="${MOUNT_SECRETS%,}"
echo

# ---------------------------------------------------------------------------
# 5. Deploy
# ---------------------------------------------------------------------------
bold "==> Deploying to Cloud Run…"

DEPLOY_FLAGS=(
  --source .
  --region "${REGION}"
  --project "${PROJECT_ID}"
  --service-account "${RUNTIME_SA}"
  --allow-unauthenticated
  --max-instances 10
  --memory 512Mi
  --cpu 1
  --set-env-vars "GOOGLE_CLOUD_PROJECT=${PROJECT_ID},GCS_UPLOADS_BUCKET=${UPLOADS_BUCKET}"
  --quiet
)
if [[ -n "${MOUNT_SECRETS}" ]]; then
  DEPLOY_FLAGS+=(--update-secrets "${MOUNT_SECRETS}")
fi

gcloud run deploy "${SERVICE}" "${DEPLOY_FLAGS[@]}"
echo

# ---------------------------------------------------------------------------
# 6. Done — print URL and next steps
# ---------------------------------------------------------------------------
# Cloud Run exposes the service under two equivalent hostnames (project-number
# form and random-hash form). We pin to the project-number form so the OAuth
# redirect URI is stable across re-deploys.
PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" \
  --format='value(projectNumber)')"
URL="https://${SERVICE}-${PROJECT_NUMBER}.${REGION}.run.app"

# Auth.js needs an explicit AUTH_URL on Cloud Run — HOSTNAME=0.0.0.0 in the
# container otherwise poisons the inferred base URL, and trustHost alone
# isn't reliable behind Cloud Run's proxy.
bold "==> Setting AUTH_URL=${URL}…"
gcloud run services update "${SERVICE}" \
  --region "${REGION}" --project "${PROJECT_ID}" \
  --update-env-vars "AUTH_URL=${URL}" \
  --quiet >/dev/null

bold "==> Deployed:"
echo "    ${URL}"
echo

if [[ -n "${MOUNT_SECRETS}" ]]; then
  bold "==> Mounted secrets:"
  echo "    ${MOUNT_SECRETS}"
  echo
fi

bold "==> Final step — register the OAuth callback:"
echo "    Add this redirect URI to the Google OAuth client used by AUTH_GOOGLE_ID:"
echo "      ${URL}/api/auth/callback/google"
echo
echo "    Credentials console:"
echo "      https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID}"
echo
dim "Re-run this script any time — it's idempotent. Secrets, IAM, and the service"
dim "are all created-or-updated, never duplicated."
