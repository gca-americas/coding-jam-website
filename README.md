# GDG Coding Jams

A turnkey landing site for the GDG Coding Jams — eight independent 2-hour AI build sessions ("tracks") driven by an Antigravity codelab, an organizer playbook, and a community project showcase with a chapter hero board.

> **The Build phase IS the codelab.** Participants run the [Antigravity codelab](https://github.com/cuppibla/coding-jam-codelab/blob/main/coding-jam/codelab.md) — Antigravity writes the code, they direct it via three spec docs (PRD / UI / Engineering). Six sub-phases inside ~75 min: Setup → Plan → Review → Build → API → Verify. "Fix the doc, not the code."

## Run it

```bash
cp .env.local.example .env.local   # then fill in the auth values (see below)
npm install
npm run dev
```

Open `http://localhost:3000`.

> **Without `.env.local` set, the site still loads** — but clicking "Sign in with Google" will fail. All read-only routes (home, lineup, tracks, showcase, about, organizer) work without any auth setup.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Landing — hero + **The Lineup** (8 independent tracks), chapter hero board, featured community builds |
| `/about` | What a Coding Jam is — concept, value props, 2-hour rhythm, the **Spec Talk** skill + 5 questions |
| `/tracks/[slug]` | Per-track deep dive — what to build in 45 minutes, the aha moment, polished-version pulls, the 5-phase rhythm |
| `/organizer` | How to run a Jam — kit, schedule, **per-track facilitator notes** (Spec Talk emphasis + polished tease) |
| `/showcase` | Community builds, filterable by track + chapter |
| `/submit` | Sign in with Google → in-site form to submit a build |
| `/api/projects` | `GET` lists projects · `POST` creates one (requires session) |
| `/api/upload` | `POST` uploads a screenshot to Cloud Storage (requires session) |
| `/api/auth/*` | Auth.js (NextAuth v5) handlers |

## Setting up Google sign-in

Sign-in is required to submit a build. Reads stay public.

> **Use a brand-new GCP project for this app** — do *not* reuse your everyday `@gmail.com` GCP work. Keeps the OAuth consent screen scoped, and any future workshop traffic isolated from your personal projects.

1. Create a fresh project at [console.cloud.google.com](https://console.cloud.google.com/projectcreate). Name it something like `gdg-coding-jams-web`.
2. Set up the **OAuth consent screen** (External, in Testing mode is fine for development).
3. Under **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - Authorized JavaScript origin: `http://localhost:3000`
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy the Client ID and Client secret into `.env.local`:
   ```bash
   AUTH_SECRET=$(openssl rand -base64 32)   # paste the result
   AUTH_GOOGLE_ID=...
   AUTH_GOOGLE_SECRET=...
   ```
5. Restart `npm run dev`.

For production, repeat with your production origin (e.g. `https://codingjams.example.com`) and set `AUTH_URL` to match.

## Identity model

- **Builder name** on every submission is taken from the verified Google profile — *never* from the request body. The form has no name field.
- **Builder avatar** comes from the Google profile picture, displayed publicly on the project card and Nav.
- **Email** is verified at sign-in and stored privately on the submission (`submittedByEmail`). Stripped before any data leaves the server. Used only for moderation.
- The `Project` type splits public from private via `PublicProject`. Server code uses `listProjects()` (public) by default; `listProjectsRaw()` exists for moderation paths only.

## Data

- `lib/tracks.ts` — single source of truth for the 8 tracks (project, tagline, 45-min build, the moment it clicks, Spec Talk emphasis, polished pull-ins, codelab URL). Submissions may also use `trackNumber=0` for **"I built my own"** (off-track / custom builds).
- `lib/projects.ts` — storage **dispatcher** + types + helpers. `listProjects()` + `addProject()` are the only entry points the rest of the app uses. Also exports `normalizeChapter()` and `chapterMatchKey()` so chapter strings group case-insensitively ("GDG Boston" and "gdg boston" are one chapter on the hero board).
- `lib/projects-fs.ts` — local JSON-file backend (reads/writes `data/projects.json`).
- `lib/projects-firestore.ts` — Firestore backend.
- `lib/firestore.ts` — Firestore client singleton, only loaded when the Firestore backend is active.
- `lib/uploads.ts` — Cloud Storage upload helper. Accepts `image/png|jpeg|webp|gif` up to 8 MB, returns a public `https://storage.googleapis.com/<bucket>/<object>` URL. Reads `GCS_UPLOADS_BUCKET` at request time.
- `data/projects.json` — seed data + the live store when running in local mode.

### Storage backend selection

| Environment | Default backend | Why |
| --- | --- | --- |
| `npm run dev` (local) | **local JSON file** | No GCP setup needed. Firestore SDK is never loaded. |
| `npm run start` / Cloud Run (`NODE_ENV=production`) | **Firestore** | Persists across restarts and instances. |

**To use it: just `npm run dev`** — no env changes needed. If you want to test against your real Firestore from local, add `STORAGE_BACKEND=firestore` to `.env.local` (or run `STORAGE_BACKEND=firestore npm run dev`). The `.env.local.example` has both lines commented for reference.

```bash
STORAGE_BACKEND=local       npm run dev    # explicit local mode (default in dev)
STORAGE_BACKEND=firestore   npm run dev    # test prod path locally (requires ADC)
```

The dispatcher dynamic-imports the chosen backend, so when `STORAGE_BACKEND=local` is active the Firestore SDK is not loaded at all.

> **Tracks are independent.** They share the Spec Talk skill — but no code dependencies. Drop in for one; start anywhere; come back next month for another.

## Setting up Firestore (one-time)

The site stores community project submissions in Firestore Native mode on GCP project **`codingjam-americas`** (override with the `GOOGLE_CLOUD_PROJECT` env var).

1. **Create the Firestore database.** Open [Firestore console](https://console.cloud.google.com/firestore/databases?project=codingjam-americas) → **Create database** → **Native mode** → pick a region (e.g. `us-central1`). Only do this once per project.
2. **Grant your user the right IAM role** (or use a service account with `roles/datastore.user`). For local dev you typically have Owner via gcloud.
3. **Authenticate locally** (one time, for ADC):
   ```bash
   gcloud auth application-default login
   ```
   The Firestore SDK auto-picks up these credentials. No service-account JSON file needed.
4. **Seed the database** with the 12 sample projects:
   ```bash
   npm run seed
   ```
   Re-run any time — it's idempotent (uses the seed IDs). Pass `-- --wipe` to delete everything first.
5. **Run the dev server.** The home, lineup, showcase, and track pages now read live from Firestore. Submissions via `/submit` write to it.

### On Cloud Run / Cloud Functions / GKE

No `.env` needed — the runtime service account is auto-picked up by ADC. Just make sure the runtime SA has `roles/datastore.user` on `codingjam-americas`. The `GOOGLE_CLOUD_PROJECT` env var is set automatically on GCP runtimes.

## Screenshot uploads (Cloud Storage)

The submit form uploads a hero image directly to a public-read GCS bucket via `/api/upload` (server-relay, session-gated). The deploy script provisions the bucket and IAM automatically; for **local** dev:

1. Set `GCS_UPLOADS_BUCKET` in `.env.local` (default in prod: `codingjam-americas-uploads`).
2. `gcloud auth application-default login` so the SDK can write as your user.
3. Your account needs `roles/storage.objectAdmin` on the bucket (the runtime SA already has it).

Without these, the rest of the form still works — only the upload returns a clear `Upload bucket is not configured` error.

## Deploying to Cloud Run

The site ships as a standalone Next.js container, deployed via Cloud Build → Artifact Registry → Cloud Run. The service is **public** (anyone can browse); Google sign-in only gates the `/submit` form.

**One-time setup before first deploy:**
- `.env.local` populated with `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — the script pushes these to Secret Manager.
- `gcloud auth login` (CLI logged in to your GCP account).
- Firestore database already created (you've done this).

**Deploy:**

```bash
bash scripts/deploy-cloudrun.sh
```

That single command:
1. Enables `run`, `cloudbuild`, `artifactregistry`, `secretmanager`, `firestore`, `storage` APIs (no-op if already on).
2. Creates a runtime service account `codingjam-web-runtime@…` if missing.
3. Grants it `roles/datastore.user` (Firestore) + `roles/secretmanager.secretAccessor`.
4. Creates the **uploads bucket** (`<project>-uploads`) with uniform bucket-level access, grants `allUsers:objectViewer` (public read) + the runtime SA `roles/storage.objectAdmin` scoped to the bucket.
5. Pushes / updates the 3 auth values from `.env.local` into Secret Manager (`auth-secret`, `auth-google-id`, `auth-google-secret`).
6. Builds the Docker image via Cloud Build (uses our `Dockerfile`).
7. Deploys to Cloud Run, mounts the secrets as env vars, sets `GOOGLE_CLOUD_PROJECT` + `GCS_UPLOADS_BUCKET`, sets `--allow-unauthenticated`.
8. Pins `AUTH_URL` to the **project-number** URL form (`https://<service>-<project-number>.<region>.run.app`) so the OAuth redirect URI is stable across re-deploys. Auth.js v5 inside the Cloud Run container can't infer the public URL reliably (the standalone Next.js image sets `HOSTNAME=0.0.0.0`, which poisons the guess even with `trustHost=true`).
9. Prints the service URL and the OAuth callback you need to register.

**Last manual step (after first deploy):**
Add the printed `https://<service>-<hash>.run.app/api/auth/callback/google` to the **Authorized redirect URIs** of your Google OAuth client at [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials?project=codingjam-americas). Required only once per service URL.

**Override deploy params** with env vars:
```bash
REGION=us-east1 SERVICE=codingjam-staging bash scripts/deploy-cloudrun.sh
```

The script is idempotent — re-run to redeploy after code changes or to push updated secrets.

## Brand

- Colors: `#4285F4` blue, `#EA4335` red, `#FBBC04` yellow, `#34A853` green (defined as `gblue / gred / gyellow / ggreen` in Tailwind).
- Type: Google Sans (Display + Text) loaded from Google Fonts.
- Each track is themed with one of the four colors.
- **Material 3 styling** — color is an accent, not a fill. Track cards have a neutral white surface, colored eyebrow + tinted icon plate + a thin colored bottom bar. Buttons follow M3 hierarchy: `.btn-google` (filled primary, solid blue), `.btn-tonal` (light-color background + dark-color text), `.btn-ghost` (outlined), `.btn-text` (no background until hover). The "Together." word in the hero is per-letter Google-colored, like the Google logo.
