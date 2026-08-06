"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ChapterPicker, { type ChapterType } from "@/components/ChapterPicker";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { GOOGLE_TECH, GOOGLE_TECH_GROUPS } from "@/lib/google-tech";

/** A jam this build can be credited to — recent, published, and dated. */
export type JamChoice = {
  slug: string;
  title: string;
  chapter: string;
  eventDate?: string;
};

type Builder = {
  name: string;
  email: string;
  image: string | null;
};

/** Set when the builder arrived from a published jam page via ?jam=<slug>. */
export type JamContext = {
  slug: string;
  title: string;
  organizerName: string;
  chapter: string;
  country: string;
  chapterType?: ChapterType;
  chapterName?: string;
  topicTitle: string;
  topicEmoji: string;
};

export type SubmitFormInitial = {
  trackNumber?: number;
  /** The jam this build is already credited to, when editing. */
  jamSlug?: string;
  projectName?: string;
  chapterType?: ChapterType;
  chapterName?: string;
  country?: string;
  repoUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  screenshotUrl?: string;
  description?: string;
  surprise?: string;
  collaboratorEmails?: string[];
  googleTech?: string[];
};

export default function SubmitForm({
  jamChoices,
  builder,
  initial,
  editId,
  jam,
}: {
  jamChoices: JamChoice[];
  builder: Builder;
  initial?: SubmitFormInitial;
  editId?: string;
  jam?: JamContext | null;
}) {
  const router = useRouter();
  const isEdit = Boolean(editId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // Set on a successful new submission so the success screen can offer sharing.
  const [shared, setShared] = useState<{ name: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // A jam seeds the chapter too — most people submitting from a jam page were
  // in that room. It stays editable for anyone who wasn't.
  const [chapter, setChapter] = useState<{ type: ChapterType; name: string }>({
    type: initial?.chapterType ?? jam?.chapterType ?? "gdg",
    name: initial?.chapterName ?? jam?.chapterName ?? "",
  });

  // "" means NA — not from a jam. Most builds are, so it's the default.
  const [jamSlug, setJamSlug] = useState<string>(initial?.jamSlug ?? "");

  // Ids from lib/google-tech.ts. Optional — a build that used none of it still
  // belongs on the showcase, so nothing here blocks a submission.
  const [googleTech, setGoogleTech] = useState<string[]>(initial?.googleTech ?? []);
  const toggleTech = (id: string) =>
    setGoogleTech((cur) => (cur.includes(id) ? cur.filter((t) => t !== id) : [...cur, id]));

  const [screenshotUrl, setScreenshotUrl] = useState<string>(initial?.screenshotUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // One row per collaborator. Seed from `initial` when editing; otherwise one
  // empty row so the field is visible. Stable ids let React keep focus on the
  // right input after rows are added/removed.
  const initialCollabs = initial?.collaboratorEmails?.length
    ? initial.collaboratorEmails.map((email, i) => ({ id: i, email }))
    : [{ id: 0, email: "" }];
  const collaboratorIdRef = useRef(initialCollabs.length);
  const [collaborators, setCollaborators] = useState<{ id: number; email: string }[]>(initialCollabs);

  function updateCollaborator(id: number, email: string) {
    setCollaborators((rows) => rows.map((r) => (r.id === id ? { ...r, email } : r)));
  }
  function addCollaborator() {
    setCollaborators((rows) => [...rows, { id: collaboratorIdRef.current++, email: "" }]);
  }
  function removeCollaborator(id: number) {
    setCollaborators((rows) => {
      const next = rows.filter((r) => r.id !== id);
      // Always keep at least one (empty) row so the field is visible.
      return next.length ? next : [{ id: collaboratorIdRef.current++, email: "" }];
    });
  }

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
    if (!chapter.name.trim()) {
      setError(
        chapter.type === "other"
          ? "Tell us where you're building from."
          : "Pick your chapter from the directory in Step 2.",
      );
      return;
    }
    if (!screenshotUrl) {
      setError("A screenshot is required — upload one in Step 3.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const country = String(form.get("country") || DEFAULT_COUNTRY);
    const safeCountry = COUNTRIES.includes(country) ? country : DEFAULT_COUNTRY;
    const payload = {
      // Identity stamped server-side from the verified session — fields below are NOT trusted.
      // The jam decides the track server-side. A build with no jam lands on 0,
      // which renders as "Built their own".
      trackNumber: 0,
      jamSlug: jam?.slug ?? jamSlug ?? undefined,
      projectName: String(form.get("projectName") || "").trim(),
      // The server re-validates this against the directory and builds the label.
      chapterType: chapter.type,
      chapter: chapter.name.trim(),
      country: safeCountry,
      repoUrl: String(form.get("repoUrl") || "").trim(),
      demoUrl: String(form.get("demoUrl") || "").trim(),
      videoUrl: String(form.get("videoUrl") || "").trim(),
      screenshotUrl,
      description: String(form.get("description") || "").trim(),
      surprise: String(form.get("surprise") || "").trim(),
      collaboratorEmails: collaborators.map((r) => r.email.trim()).filter(Boolean),
      googleTech,
    };

    try {
      const url = isEdit ? `/api/projects/${editId}` : "/api/projects";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Submission failed" }));
        throw new Error(j.error || "Submission failed");
      }
      if (isEdit) {
        setSuccess(true);
        setTimeout(() => router.push("/me"), 800);
        router.refresh();
      } else {
        // Hold on the success screen instead of redirecting — the share links
        // are the whole point of this step, and a redirect would yank them away.
        const body = (await res.json().catch(() => null)) as
          | { project?: { projectName?: string; submitterProfileId?: string } }
          | null;
        const profileId = body?.project?.submitterProfileId;
        setShared({
          name: body?.project?.projectName || payload.projectName,
          // The builder's profile page shows the build with the site's framing.
          // Falls back to the showcase if the id somehow didn't come back.
          url: `${window.location.origin}${profileId ? `/u/${profileId}` : "/showcase"}`,
        });
        setSuccess(true);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  if (success) {
    if (isEdit || !shared) {
      return (
        <div className="card p-10 text-center">
          <div className="text-5xl">🎉</div>
          <h3 className="font-display font-bold text-2xl text-ink mt-4">
            {isEdit ? "Saved." : "You’re on the board."}
          </h3>
          <p className="text-ash mt-2">Redirecting to your profile…</p>
        </div>
      );
    }

    const message = jam
      ? `I just shipped ${shared.name} at ${jam.title} — a GDG Coding Jam. Two hours, one working app.`
      : `I just shipped ${shared.name} at a GDG Coding Jam. Two hours, one working app.`;
    const xHref = `https://x.com/intent/post?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shared.url)}`;
    // LinkedIn ignores any text parameter and reads the page's own OG tags.
    const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shared.url)}`;

    async function copy() {
      try {
        await navigator.clipboard.writeText(shared!.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setCopied(false);
      }
    }

    return (
      <div className="card p-10 text-center">
        <div className="text-5xl">🎉</div>
        <h3 className="font-display font-bold text-2xl text-ink mt-4">You’re on the board.</h3>
        <p className="text-ash mt-2">
          <span className="font-medium text-ink">{shared.name}</span> is live on the showcase.
        </p>

        <div className="mt-7">
          <div className="text-xs uppercase tracking-widest font-semibold text-ash">Tell people</div>
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            <a
              href={xHref}
              target="_blank"
              rel="noreferrer"
              className="btn bg-ink text-white hover:shadow-pop !py-2 !px-4 text-sm"
            >
              Share on X
            </a>
            <a
              href={liHref}
              target="_blank"
              rel="noreferrer"
              className="btn bg-[#0A66C2] text-white hover:shadow-pop !py-2 !px-4 text-sm"
            >
              Share on LinkedIn
            </a>
            <button type="button" onClick={copy} className="btn-ghost !py-2 !px-4 text-sm">
              {copied ? "Copied ✓" : "Copy link"}
            </button>
          </div>
          <p className="text-xs text-ash mt-3 break-all">{shared.url}</p>
        </div>

        <div className="mt-8 pt-6 border-t border-line flex flex-wrap gap-3 justify-center">
          <a href="/me" className="btn-google !py-2 !px-4 text-sm">Go to my profile</a>
          <a href="/showcase" className="btn-ghost !py-2 !px-4 text-sm">See all builds</a>
        </div>
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

      {/* Content rules — shown before the first field so it's read, not skipped. */}
      <div className="rounded-xl bg-gyellow/10 border border-gyellow/40 p-4 text-sm">
        <div className="font-medium text-ink">Submit real builds only</div>
        <p className="text-ash mt-1">
          Keep submissions relevant to the track you pick, and share one project per
          submission. Irrelevant, duplicated, or spam entries will be removed and the
          account banned from the jam. You can submit one project per day.
        </p>
      </div>

      {/* The build */}
      <Section title="The build" eyebrow="Step 1">
        {jam ? (
          <>
            <div className="rounded-xl border border-gblue/40 bg-gblue/5 p-4">
              <div className="text-xs uppercase tracking-widest font-semibold text-ash">
                Submitting to a jam
              </div>
              <div className="flex items-start gap-3 mt-2">
                <span className="text-2xl leading-none">{jam.topicEmoji}</span>
                <div className="min-w-0">
                  <div className="font-medium text-ink">{jam.title}</div>
                  <p className="text-sm text-ash mt-0.5">
                    {jam.topicTitle} · led by {jam.organizerName}
                  </p>
                </div>
              </div>
              <p className="text-xs text-ash mt-3">
                Your build will be credited to this jam.{" "}
                <a href="/submit" className="text-gblue hover:underline">
                  Not from this jam?
                </a>
              </p>
            </div>
            <Field label="Project name" hint="What you called it. Make it sing.">
              <input name="projectName" required placeholder="Berliner Stimmung" className="input" defaultValue={initial?.projectName ?? ""} />
            </Field>
          </>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Which jam?"
              hint={
                jamChoices.length > 0
                  ? "Jams held in the last two weeks. Built this on your own? Leave it as \u201cI\u2019m not in a jam\u201d."
                  : "No jams have run in the last two weeks, so there's nothing to credit this to yet."
              }
            >
              <select
                name="jamSlug"
                className="input"
                value={jamSlug}
                onChange={(e) => setJamSlug(e.target.value)}
              >
                <option value="">I&rsquo;m not in a jam</option>
                {jamChoices.map((j) => (
                  <option key={j.slug} value={j.slug}>
                    {j.title}
                    {j.eventDate ? ` · ${j.eventDate}` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Project name" hint="What you called it. Make it sing.">
              <input name="projectName" required placeholder="Berliner Stimmung" className="input" defaultValue={initial?.projectName ?? ""} />
            </Field>
          </div>
        )}
      </Section>

      {/* The chapter */}
      <Section title="Your GDG chapter" eyebrow="Step 2">
        <Field label="Is this a GDG chapter?">
          <ChapterPicker type={chapter.type} name={chapter.name} onChange={setChapter} />
        </Field>
        <Field label="Country" hint="Where your chapter is based.">
          <select name="country" required defaultValue={initial?.country ?? DEFAULT_COUNTRY} className="input">
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Collaborator emails (optional)"
          hint="Pair-programmed with one or more people? Add their emails — they&rsquo;ll get credit toward their builder badges next time they sign in. Up to 10."
        >
          <div className="space-y-2">
            {collaborators.map((row, idx) => (
              <div key={row.id} className="flex items-center gap-2">
                <input
                  type="email"
                  value={row.email}
                  onChange={(e) => updateCollaborator(row.id, e.target.value)}
                  placeholder={idx === 0 ? "alex@example.com" : "another@example.com"}
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeCollaborator(row.id)}
                  aria-label="Remove collaborator"
                  className="shrink-0 h-10 w-10 rounded-lg text-ash hover:text-gred hover:bg-gred/10 transition-colors flex items-center justify-center text-lg leading-none"
                >
                  ×
                </button>
              </div>
            ))}
            {collaborators.length < 10 && (
              <button
                type="button"
                onClick={addCollaborator}
                className="text-sm text-gblue hover:underline font-medium"
              >
                + Add another collaborator
              </button>
            )}
          </div>
        </Field>
      </Section>

      {/* The links */}
      <Section title="The links" eyebrow="Step 3">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Repo URL" hint="Required. GitHub, GitLab, Codeberg — anywhere public.">
            <input type="url" name="repoUrl" required placeholder="https://github.com/you/your-build" className="input" defaultValue={initial?.repoUrl ?? ""} />
          </Field>
          <Field label="Video / walkthrough URL (optional)" hint="YouTube, Loom, anything embeddable.">
            <input type="url" name="videoUrl" placeholder="https://youtu.be/..." className="input" defaultValue={initial?.videoUrl ?? ""} />
          </Field>
        </div>

        <Field label="Screenshot" hint="Required. A hero image for your project card. PNG, JPG, WebP, or GIF — up to 8 MB.">
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={onFileChange}
              disabled={uploading}
              required={!screenshotUrl}
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
          <input type="url" name="demoUrl" placeholder="https://your-build.run.app" className="input" defaultValue={initial?.demoUrl ?? ""} />
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
            defaultValue={initial?.description ?? ""}
          />
        </Field>

        <Field
          label="Which Google tech did you use?"
          hint="Optional. Tap everything your build actually calls — it&rsquo;s how people find work like theirs on the showcase."
        >
          <div className="space-y-3">
            {GOOGLE_TECH_GROUPS.map((group) => (
              <div key={group}>
                <div className="text-[11px] uppercase tracking-widest font-semibold text-ash">
                  {group}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {GOOGLE_TECH.filter((t) => t.group === group).map((t) => {
                    const on = googleTech.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTech(t.id)}
                        aria-pressed={on}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                          on
                            ? "bg-gblue text-white border-gblue"
                            : "bg-white text-ink border-line hover:border-gblue hover:text-gblue"
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
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
            defaultValue={initial?.surprise ?? ""}
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
          {submitting ? (isEdit ? "Saving…" : "Submitting…") : isEdit ? "Save changes" : "Ship it →"}
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
