"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TrackOption = { number: number; project: string };

type Builder = {
  name: string;
  email: string;
  image: string | null;
};

const COUNTRIES: Array<{ name: string }> = [
  { name: "United States" },
  { name: "Canada" },
];

export default function SubmitForm({ tracks, builder }: { tracks: TrackOption[]; builder: Builder }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const country = String(form.get("country") || "United States");
    const safeCountry = COUNTRIES.find((c) => c.name === country)?.name ?? COUNTRIES[0].name;
    const payload = {
      // Identity stamped server-side from the verified session — fields below are NOT trusted.
      trackNumber: Number(form.get("trackNumber")),
      projectName: String(form.get("projectName") || "").trim(),
      chapter: String(form.get("chapter") || "").trim(),
      country: safeCountry,
      repoUrl: String(form.get("repoUrl") || "").trim(),
      demoUrl: String(form.get("demoUrl") || "").trim(),
      videoUrl: String(form.get("videoUrl") || "").trim(),
      screenshotUrl: String(form.get("screenshotUrl") || "").trim(),
      doctrineScreenshotUrl: String(form.get("doctrineScreenshotUrl") || "").trim(),
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
          <Field label="Which track?" hint="Pick the track this project comes from.">
            <select name="trackNumber" required className="input" defaultValue="1">
              {tracks.map((t) => (
                <option key={t.number} value={t.number}>
                  Track {t.number.toString().padStart(2, "0")} — {t.project}
                </option>
              ))}
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
          <Field label="Country">
            <div className="flex gap-2">
              {COUNTRIES.map((c, i) => (
                <label
                  key={c.name}
                  className="group flex-1 cursor-pointer rounded-xl border border-line bg-white px-4 py-3 hover:bg-cloud has-[:checked]:border-gblue has-[:checked]:ring-2 has-[:checked]:ring-gblue/20 has-[:checked]:bg-gblue/5 transition-all text-center"
                >
                  <input
                    type="radio"
                    name="country"
                    value={c.name}
                    defaultChecked={i === 0}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-ink">{c.name}</span>
                </label>
              ))}
            </div>
          </Field>
        </div>
      </Section>

      {/* The links */}
      <Section title="The links" eyebrow="Step 3">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Repo URL" hint="GitHub, GitLab, Codeberg — anywhere public.">
            <input type="url" name="repoUrl" required placeholder="https://github.com/you/your-build" className="input" />
          </Field>
          <Field label="Live demo URL" hint="Cloud Run / Vercel / wherever it's running.">
            <input type="url" name="demoUrl" placeholder="https://your-build.run.app" className="input" />
          </Field>
          <Field label="Video / walkthrough URL" hint="YouTube, Loom, anything embeddable.">
            <input type="url" name="videoUrl" placeholder="https://youtu.be/..." className="input" />
          </Field>
          <Field label="Screenshot URL" hint="A hero image for your project card.">
            <input type="url" name="screenshotUrl" placeholder="https://.../screenshot.png" className="input" />
          </Field>
        </div>
        <Field label="Doctrine moment screenshot" hint="The drift-refusal, the &lsquo;pet remembers me&rsquo;, or whatever the doctrine made click.">
          <input type="url" name="doctrineScreenshotUrl" placeholder="https://.../doctrine-moment.png" className="input" />
        </Field>
      </Section>

      {/* The reflection */}
      <Section title="The reflection" eyebrow="Step 4">
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
        <button disabled={submitting} className="btn-google disabled:opacity-60">
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
