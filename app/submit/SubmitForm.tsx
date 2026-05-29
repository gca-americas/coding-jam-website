"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type TrackOption = { number: number; project: string };

type Builder = {
  name: string;
  email: string;
  image: string | null;
};

// Sovereign states in North & South America. Add as needed — order is North
// (US/Canada first as the most common), then alphabetical Latin America &
// Caribbean, then South America.
const COUNTRIES: string[] = [
  "United States",
  "Canada",
  "Mexico",
  "Antigua and Barbuda",
  "Bahamas",
  "Barbados",
  "Belize",
  "Costa Rica",
  "Cuba",
  "Dominica",
  "Dominican Republic",
  "El Salvador",
  "Grenada",
  "Guatemala",
  "Haiti",
  "Honduras",
  "Jamaica",
  "Nicaragua",
  "Panama",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Trinidad and Tobago",
  "Argentina",
  "Bolivia",
  "Brazil",
  "Chile",
  "Colombia",
  "Ecuador",
  "Guyana",
  "Paraguay",
  "Peru",
  "Suriname",
  "Uruguay",
  "Venezuela",
];

export default function SubmitForm({ tracks, builder }: { tracks: TrackOption[]; builder: Builder }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [screenshotUrl, setScreenshotUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(j.error || "Upload failed");
      }
      const j = (await res.json()) as { url: string };
      setScreenshotUrl(j.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  }

  function clearScreenshot() {
    setScreenshotUrl("");
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const country = String(form.get("country") || COUNTRIES[0]);
    const safeCountry = COUNTRIES.includes(country) ? country : COUNTRIES[0];
    const payload = {
      // Identity stamped server-side from the verified session — fields below are NOT trusted.
      trackNumber: Number(form.get("trackNumber")),
      projectName: String(form.get("projectName") || "").trim(),
      chapter: String(form.get("chapter") || "").trim(),
      country: safeCountry,
      repoUrl: String(form.get("repoUrl") || "").trim(),
      demoUrl: String(form.get("demoUrl") || "").trim(),
      videoUrl: String(form.get("videoUrl") || "").trim(),
      screenshotUrl,
      description: String(form.get("description") || "").trim(),
      surprise: String(form.get("surprise") || "").trim(),
    };

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Submission failed" }));
        throw new Error(j.error || "Submission failed");
      }
      setSuccess(true);
      setTimeout(() => router.push("/showcase"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="card p-10 text-center">
        <div className="text-5xl">🎉</div>
        <h3 className="font-display font-bold text-2xl text-ink mt-4">You&rsquo;re on the board.</h3>
        <p className="text-ash mt-2">Redirecting to the showcase…</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 sm:p-8 space-y-8">
      {/* Signed-in identity (locked, server-stamped) */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-cloud/60 border border-line">
        {builder.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={builder.image}
            alt=""
            referrerPolicy="no-referrer"
            className="h-11 w-11 rounded-full ring-2 ring-white shadow-soft shrink-0"
          />
        ) : (
          <div className="h-11 w-11 rounded-full bg-white border border-line flex items-center justify-center font-semibold text-ink shrink-0">
            {builder.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink truncate">{builder.name}</span>
            <span className="chip bg-ggreen/10 text-ggreen ring-1 ring-ggreen/30 shrink-0">✓ Verified</span>
          </div>
          <div className="text-xs text-ash mt-0.5">
            Posting as your Google identity — your email stays private.
          </div>
        </div>
      </div>

      {/* The build */}
      <Section title="The build" eyebrow="Step 1">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Which track?" hint="Pick the track this project comes from — or choose 'I built my own' for an off-track build.">
            <select name="trackNumber" required className="input" defaultValue="1">
              {tracks.map((t) => (
                <option key={t.number} value={t.number}>
                  Track {t.number.toString().padStart(2, "0")} — {t.project}
                </option>
              ))}
              <option value="0">✨ I built my own</option>
            </select>
          </Field>
          <Field label="Project name" hint="What you called it. Make it sing.">
            <input name="projectName" required placeholder="Berliner Stimmung" className="input" />
          </Field>
        </div>
      </Section>

      {/* The chapter */}
      <Section title="Your GDG chapter" eyebrow="Step 2">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="GDG city chapter" hint="e.g. GDG NYC, GDG Toronto, GDG Seattle">
            <input name="chapter" required placeholder="GDG Seattle" className="input" />
          </Field>
          <Field label="Country" hint="North & South America only.">
            <select name="country" required defaultValue="United States" className="input">
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* The links */}
      <Section title="The links" eyebrow="Step 3">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Repo URL" hint="GitHub, GitLab, Codeberg — anywhere public.">
            <input type="url" name="repoUrl" required placeholder="https://github.com/you/your-build" className="input" />
          </Field>
          <Field label="Video / walkthrough URL" hint="YouTube, Loom, anything embeddable.">
            <input type="url" name="videoUrl" placeholder="https://youtu.be/..." className="input" />
          </Field>
        </div>

        <Field label="Screenshot" hint="A hero image for your project card. PNG, JPG, WebP, or GIF — up to 8 MB.">
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={onFileChange}
              disabled={uploading}
              className="block w-full text-sm text-ash file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gblue/10 file:text-gblue hover:file:bg-gblue/20 disabled:opacity-60"
            />
            {uploading && <p className="text-xs text-ash">Uploading…</p>}
            {uploadError && (
              <p className="text-xs text-gred">{uploadError}</p>
            )}
            {screenshotUrl && !uploading && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-cloud/60 border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenshotUrl}
                  alt="Screenshot preview"
                  className="h-20 w-32 object-cover rounded-md border border-line"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <div className="font-medium text-ink">Uploaded</div>
                  <div className="text-ash truncate" title={screenshotUrl}>
                    {screenshotUrl}
                  </div>
                  <button
                    type="button"
                    onClick={clearScreenshot}
                    className="mt-1 text-gred hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </Field>

        <Field label="Live demo URL (optional)" hint="Cloud Run / Vercel / wherever it's running.">
          <input type="url" name="demoUrl" placeholder="https://your-build.run.app" className="input" />
        </Field>
      </Section>

      {/* The pitch */}
      <Section title="The pitch" eyebrow="Step 4">
        <Field
          label="What does your project do?"
          hint="2–4 sentences. What it is, who it&rsquo;s for, the cool part. Skip the build story — that&rsquo;s the next field."
        >
          <textarea
            name="description"
            rows={4}
            maxLength={500}
            placeholder="Mood Jar lets you type how you're feeling and drops a tiny kawaii token into a glass jar. The jar fills up over the week — a quiet, visual mood log without the journaling pressure."
            className="input resize-none"
          />
        </Field>
      </Section>

      {/* The reflection */}
      <Section title="The reflection" eyebrow="Step 5">
        <Field
          label="What surprised you?"
          hint="1–2 sentences. The thing you didn&rsquo;t expect. This is the most-read field on the showcase."
        >
          <textarea
            name="surprise"
            required
            rows={4}
            maxLength={400}
            placeholder="I assumed I'd have to coach Gemini into being empathetic. Turns out it already was — and the instruction I deleted was the one telling it to be kind."
            className="input resize-none"
          />
        </Field>
      </Section>

      {error && (
        <div className="rounded-xl bg-gred/10 text-gred border border-gred/30 p-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-line">
        <p className="text-xs text-ash">
          By submitting, you confirm the links you&rsquo;re sharing are public and don&rsquo;t contain secrets.
        </p>
        <button disabled={submitting || uploading} className="btn-google disabled:opacity-60">
          {submitting ? "Submitting…" : "Ship it →"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="section-eyebrow">{eyebrow}</div>
        <h3 className="font-display font-bold text-xl text-ink mt-1">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}
