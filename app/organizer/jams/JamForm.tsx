"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ChapterPicker, { type ChapterType } from "@/components/ChapterPicker";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { G_COLORS, LIMITS, LINK_FIELDS, type TopicKind, type TopicLinks } from "@/lib/topic";
import { TOPIC_EXAMPLES } from "@/lib/topic-examples";
import type { Jam } from "@/lib/jams";

export type TrackOption = {
  slug: string;
  number: number;
  project: string;
  tagline: string;
  emoji: string;
  color?: string;
};

/* Per-kind state is kept side by side rather than in one shared bag, so
   flipping between topic kinds to compare them never destroys typed work. */
type CustomDraft = {
  title: string; tagline: string; mmv: string;
  thinkAbout: string[]; tech: string[]; polished: string[];
  color: string; emoji: string; heroImageUrl: string; links: TopicLinks;
};
type Draft = {
  slug: string;
  title: string;
  chapterType: ChapterType;
  chapterName: string;
  country: string;
  eventDate: string;
  locationNote: string;
  rsvpUrl: string;
  status: "draft" | "published" | "archived";
  kind: TopicKind;
  trackSlug: string;
  custom: CustomDraft;
};

const KIND_TABS: Array<{ value: TopicKind; label: string; blurb: string }> = [
  { value: "track", label: "Pick a track", blurb: "Use one of the ten built-in jams. Nothing to write — your page pulls the brief, codelab, starter repo and demo video. Running an open jam with no set topic? That's Track 09. Running a civic sprint? Pick Track 10." },
  { value: "custom", label: "Your own topic", blurb: "Bring your own codelab or dataset, write a topic from scratch, or both. Only the title and tagline are required — fill in as much of the rest as you want." },
];

function emptyDraft(defaults: { chapterType: ChapterType; chapterName: string; country: string }): Draft {
  return {
    slug: "", title: "",
    chapterType: defaults.chapterType, chapterName: defaults.chapterName, country: defaults.country,
    eventDate: "", locationNote: "", rsvpUrl: "", status: "draft",
    kind: "track", trackSlug: "",
    custom: {
      title: "", tagline: "", mmv: "", thinkAbout: [""], tech: [""], polished: [""],
      color: "blue", emoji: "✨", heroImageUrl: "", links: {},
    },
  };
}

/**
 * A copy carries the topic and the venue — the parts that took work to write —
 * and drops the parts that are specific to the run that already happened: its
 * URL, its date, and its published state. So "run it again" lands on an unlisted
 * draft you set a new date on, never a second live page duplicating the first.
 */
function draftForCopy(
  jam: Jam,
  defaults: Parameters<typeof emptyDraft>[0],
  tracks: TrackOption[],
): Draft {
  return { ...draftFromJam(jam, defaults, tracks), slug: "", eventDate: "", status: "draft" };
}

function draftFromJam(
  jam: Jam,
  defaults: Parameters<typeof emptyDraft>[0],
  tracks: TrackOption[],
): Draft {
  const base = emptyDraft(defaults);
  const d: Draft = {
    ...base,
    slug: jam.slug,
    title: jam.title,
    chapterType: (jam.chapterType as ChapterType) ?? "other",
    chapterName: jam.chapterName ?? jam.chapter,
    country: jam.country,
    eventDate: jam.eventDate ?? "",
    locationNote: jam.locationNote ?? "",
    rsvpUrl: jam.rsvpUrl ?? "",
    status: jam.status,
    kind: jam.topic.kind,
  };
  const t = jam.topic;
  if (t.kind === "track") {
    d.trackSlug = t.trackSlug;
    const trackDefaultColor = tracks.find((tr) => tr.slug === t.trackSlug)?.color ?? "blue";
    d.custom = {
      ...d.custom,
      color: t.color ?? trackDefaultColor,
      heroImageUrl: t.heroImageUrl ?? "",
    };
  }
  if (t.kind === "custom") {
    d.custom = {
      title: t.title, tagline: t.tagline, mmv: t.mmv ?? "",
      thinkAbout: t.thinkAbout?.length ? t.thinkAbout : [""],
      tech: t.tech?.length ? t.tech : [""],
      polished: t.polished?.length ? t.polished : [""],
      color: t.color, emoji: t.emoji, heroImageUrl: t.heroImageUrl ?? "", links: t.links ?? {},
    };
  }
  return d;
}

/** Mirrors the shape parseTopic() expects on the server. */
function topicPayload(d: Draft, heroImageUrl = d.custom.heroImageUrl) {
  switch (d.kind) {
    case "track":
      return {
        kind: "track",
        trackSlug: d.trackSlug,
        color: d.custom.color,
        heroImageUrl,
      };
    case "custom":
      return {
        kind: "custom", title: d.custom.title, tagline: d.custom.tagline, mmv: d.custom.mmv,
        thinkAbout: d.custom.thinkAbout.filter((s) => s.trim()),
        tech: d.custom.tech.filter((s) => s.trim()),
        polished: d.custom.polished.filter((s) => s.trim()),
        color: d.custom.color, emoji: d.custom.emoji,
        heroImageUrl, links: d.custom.links,
      };
  }
}

/** Kept in step with lib/uploads.ts so bad files fail instantly, not after a round trip. */
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export default function JamForm({
  mode,
  jam,
  copyFrom,
  tracks,
  defaults,
  initialError,
}: {
  mode: "create" | "edit";
  jam?: Jam;
  /** Create mode only — pre-fills the form from a jam already run. */
  copyFrom?: Jam;
  tracks: TrackOption[];
  defaults: { chapterType: ChapterType; chapterName: string; country: string };
  /** Carried over from a create where the jam saved but its image didn't. */
  initialError?: string;
}) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(() =>
    jam ? draftFromJam(jam, defaults, tracks)
      : copyFrom ? draftForCopy(copyFrom, defaults, tracks)
      : emptyDraft(defaults),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  /* The chosen image is held here and uploaded as part of Save, not on pick.
     That's what lets a jam be created in one go: there's no bucket folder to
     write into until the jam exists, so the bytes wait client-side until it
     does. It also means abandoning the form leaves nothing behind in the
     bucket. `heroPreview` is a local object URL purely for the thumbnail. */
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState("");

  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));
  const setCustom = (patch: Partial<CustomDraft>) => setD((p) => ({ ...p, custom: { ...p.custom, ...patch } }));

  /** Loads an example over the custom fields, keeping any links already typed. */
  function loadExample(id: string) {
    const ex = TOPIC_EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    const filled = d.custom.title || d.custom.tagline || d.custom.mmv;
    if (filled && !window.confirm(`Replace what you've written with the "${ex.title}" example?`)) return;
    setCustom({
      title: ex.title, tagline: ex.tagline, mmv: ex.mmv,
      thinkAbout: [...ex.thinkAbout], tech: [...ex.tech], polished: [...ex.polished],
      color: ex.color, emoji: ex.emoji,
    });
  }

  /** Uploads the held image into this jam's folder and returns its public URL. */
  async function uploadHero(slug: string, file: File): Promise<string> {
    const body = new FormData();
    body.append("file", file);
    body.append("kind", "jam");
    body.append("jam", slug);
    const res = await fetch("/api/upload", { method: "POST", body });
    const j = await res.json().catch(() => ({ error: "Upload failed." }));
    if (!res.ok) throw new Error(j.error || "Upload failed.");
    return j.url as string;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setBusy(true);

    const build = (heroImageUrl: string) => ({
      title: d.title,
      chapterType: d.chapterType,
      chapterName: d.chapterName,
      country: d.country,
      eventDate: d.eventDate,
      locationNote: d.locationNote,
      rsvpUrl: d.rsvpUrl,
      status: d.status,
      topic: topicPayload(d, heroImageUrl),
    });

    try {
      let heroUrl = d.custom.heroImageUrl;
      const wantsUpload = Boolean(heroFile);

      // Editing: the jam already owns a folder, so the image can go up first
      // and the save carries its URL in one write.
      if (mode === "edit" && wantsUpload) {
        heroUrl = await uploadHero(d.slug, heroFile!);
      }

      const res = await fetch(
        mode === "create" ? "/api/jams" : `/api/jams/${encodeURIComponent(d.slug)}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(build(heroUrl)),
        },
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Save failed." }));
        throw new Error(j.error || "Save failed.");
      }

      if (mode === "create") {
        // A slug already in use gets a fresh tail server-side, so the jam may
        // not live at the URL the form asked for. Everything after this point —
        // the image folder, the patch, the redirect — follows what came back.
        const created = await res.json().catch(() => null);
        const slug: string = created?.jam?.slug || d.slug;

        // Creating: the folder only exists now, so the image goes up after the
        // jam and is attached with a follow-up patch. If that second step
        // fails, the jam itself is still safely saved — say so plainly rather
        // than looking like the whole submit failed.
        if (wantsUpload) {
          try {
            const url = await uploadHero(slug, heroFile!);
            const patch = await fetch(`/api/jams/${encodeURIComponent(slug)}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ topic: topicPayload(d, url) }),
            });
            if (!patch.ok) throw new Error("Could not attach the image.");
          } catch (imgErr) {
            const why = imgErr instanceof Error ? imgErr.message : "Upload failed.";
            router.push(`/organizer/jams/${slug}/edit?imageError=${encodeURIComponent(why)}`);
            return;
          }
        }
        router.push(`/organizer/jams/${slug}/edit`);
        return;
      }

      setHeroFile(null);
      if (heroPreview) URL.revokeObjectURL(heroPreview);
      setHeroPreview("");
      setCustom({ heroImageUrl: heroUrl });
      setSaved(true);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  function pickHero(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(`Unsupported image type: ${file.type || "unknown"}. Use PNG, JPEG, WebP or GIF.`);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`That image is ${(file.size / 1024 / 1024).toFixed(1)} MiB — the limit is 8 MiB.`);
      return;
    }
    setError(null);
    if (heroPreview) URL.revokeObjectURL(heroPreview);
    setHeroFile(file);
    setHeroPreview(URL.createObjectURL(file));
  }

  function clearHero() {
    if (heroPreview) URL.revokeObjectURL(heroPreview);
    setHeroFile(null);
    setHeroPreview("");
    setCustom({ heroImageUrl: "" });
  }

  async function onDelete() {
    if (!window.confirm(`Delete "${d.title}"?\n\nThe page at /jam/${d.slug} stops working. This can't be undone.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/jams/${encodeURIComponent(d.slug)}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Delete failed." }));
        throw new Error(j.error || "Delete failed.");
      }
      router.push("/organizer/jams");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-gred/10 text-gred border border-gred/30 p-3 text-sm">{error}</div>
      )}
      {saved && !error && (
        <div className="rounded-lg bg-ggreen/10 text-ggreen border border-ggreen/30 p-3 text-sm">
          Saved.{" "}
          {d.status === "published" ? (
            <a href={`/jam/${d.slug}`} className="underline font-medium">View the live page →</a>
          ) : (
            <>Still a draft — set it to Published when you&rsquo;re ready to share the link.</>
          )}
        </div>
      )}

      {/* ── The event ── */}
      <Section title="The event" eyebrow="Step 1">
        <Field label="Jam name" hint="What you'd put on the meetup listing.">
          <input
            required maxLength={90} className="input" placeholder="GDG Seattle Coding Jam — Week 3"
            value={d.title} onChange={(e) => set({ title: e.target.value })}
          />
        </Field>
        {/* The URL is assigned, not chosen — on create there's nothing to show
            yet, so this only appears once the jam has one. */}
        <Field label="Page URL" hint={mode === "create"
          ? "Assigned when you save — a short link you can read out to the room."
          : "Short enough to put on a slide. This is the link to share."}>
          {mode === "create" ? (
            <div className="input flex items-center gap-1 text-ash bg-cloud/50 font-mono">
              <span>codingjam.dev/jam/</span>
              <span className="tracking-widest">·····</span>
            </div>
          ) : (
            <div className="input flex items-center justify-between gap-3 bg-cloud/50">
              <span className="font-mono text-ink truncate">codingjam.dev/jam/{d.slug}</span>
              <a href={`/jam/${d.slug}`} target="_blank" rel="noreferrer"
                className="text-xs font-medium text-gblue hover:underline shrink-0">
                Open ↗
              </a>
            </div>
          )}
        </Field>
        <Field label="Chapter">
          <ChapterPicker
            type={d.chapterType} name={d.chapterName}
            onChange={(next) => set({ chapterType: next.type, chapterName: next.name })}
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Country">
            <select required className="input" value={d.country} onChange={(e) => set({ country: e.target.value })}>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Event date" hint="Optional — leave blank if you haven't picked one.">
            <input type="date" className="input" value={d.eventDate} onChange={(e) => set({ eventDate: e.target.value })} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Where / when" hint="Optional. e.g. “6:30pm · Room 401” or “Online”.">
            <input maxLength={120} className="input" value={d.locationNote} onChange={(e) => set({ locationNote: e.target.value })} />
          </Field>
          <Field label="RSVP link" hint="Optional. Your Meetup or Luma page.">
            <input type="url" className="input" placeholder="https://…" value={d.rsvpUrl} onChange={(e) => set({ rsvpUrl: e.target.value })} />
          </Field>
        </div>
      </Section>

      {/* ── The topic ── */}
      <Section title="This week's topic" eyebrow="Step 2">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {KIND_TABS.map((t) => {
            const active = t.value === d.kind;
            return (
              <button
                key={t.value} type="button" onClick={() => set({ kind: t.value })} aria-pressed={active}
                className={[
                  "px-3 py-2 rounded-xl border text-sm font-medium transition-colors text-left",
                  active ? "border-gblue bg-gblue/10 text-gblue" : "border-line bg-white text-ash hover:border-gblue/40 hover:text-ink",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <p className="hint">{KIND_TABS.find((t) => t.value === d.kind)?.blurb}</p>

        {d.kind === "track" && (
          <Field label="Which track?" hint="Your jam page shows this track's brief, codelab and demo. Track 09 is the open one — no set topic, everyone brings their own idea.">
            <select
              required
              className="input"
              value={d.trackSlug}
              onChange={(e) => {
                const slug = e.target.value;
                const trackColor = tracks.find((tr) => tr.slug === slug)?.color;
                setD((prev) => ({
                  ...prev,
                  trackSlug: slug,
                  custom: {
                    ...prev.custom,
                    ...(trackColor ? { color: trackColor } : {}),
                  },
                }));
              }}
            >
              <option value="">Pick a track…</option>
              {tracks.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.emoji} Track {String(t.number).padStart(2, "0")} — {t.project}
                </option>
              ))}
            </select>
          </Field>
        )}

        {d.kind === "custom" && (
          <>
            <div className="rounded-xl border border-line bg-cloud/60 p-4">
              <div className="text-sm font-medium text-ink">Start from an example</div>
              <p className="hint">
                Four topics built on different corners of Google&rsquo;s stack. Load one and edit it —
                or ignore these entirely and write your own.
              </p>
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                {TOPIC_EXAMPLES.map((ex) => (
                  <button
                    key={ex.id} type="button" onClick={() => loadExample(ex.id)}
                    className="text-left px-3 py-2 rounded-xl border border-line bg-white hover:border-gblue/40 transition-colors"
                  >
                    <div className="text-sm font-medium text-ink">
                      {ex.emoji} {ex.title}
                    </div>
                    <div className="text-xs text-ash mt-0.5">{ex.label} · {ex.blurb}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-[5rem,1fr] gap-4">
              <Field label="Emoji">
                <input maxLength={8} className="input text-center text-xl" value={d.custom.emoji}
                  onChange={(e) => setCustom({ emoji: e.target.value })} />
              </Field>
              <Field label="Topic title">
                <input required maxLength={LIMITS.title} className="input" placeholder="Receipt Whisperer"
                  value={d.custom.title} onChange={(e) => setCustom({ title: e.target.value })} />
              </Field>
            </div>
            <Field label="Tagline" hint="One line the room can read off the projector.">
              <input required maxLength={LIMITS.tagline} className="input" placeholder="Snap a receipt → a tidy row in your spreadsheet."
                value={d.custom.tagline} onChange={(e) => setCustom({ tagline: e.target.value })} />
            </Field>
            <Field
              label="What ships today"
              hint="Optional — but it's the field that keeps a room on scope. The smallest version that still works, and what you're explicitly not building."
            >
              <textarea rows={5} maxLength={LIMITS.mmv} className="input"
                placeholder={"Upload a photo of a receipt. Gemini reads it and returns merchant, date and total. One row appends to a Google Sheet.\n\nOne receipt at a time. No batch upload, no charts."}
                value={d.custom.mmv} onChange={(e) => setCustom({ mmv: e.target.value })} />
            </Field>
            <ListEditor
              label="Think about" hint={`Optional. Up to ${LIMITS.thinkAbout.items} prompts to keep builders on scope.`}
              max={LIMITS.thinkAbout.items} maxLen={LIMITS.thinkAbout.chars}
              placeholders={[
                "Ask Gemini for JSON and give it the exact shape you want.",
                "One receipt at a time — batch upload is the polished version.",
                "Try a crumpled receipt early. That's the real test.",
              ]}
              items={d.custom.thinkAbout} onChange={(thinkAbout) => setCustom({ thinkAbout })} />
            <ListEditor
              label="Tech" hint={`Optional. Up to ${LIMITS.tech.items} short labels — what they'll actually touch.`}
              max={LIMITS.tech.items} maxLen={LIMITS.tech.chars}
              placeholders={["Gemini API", "Firestore", "Cloud Run", "Maps JavaScript API", "Imagen on Vertex AI"]}
              items={d.custom.tech} onChange={(tech) => setCustom({ tech })} />
            <ListEditor
              label="The polished version" hint={`Optional. Up to ${LIMITS.polished.items} ideas for the at-home build.`}
              max={LIMITS.polished.items} maxLen={LIMITS.polished.chars}
              placeholders={["Batch upload a shoebox of receipts", "Monthly summary with charts", "Export to BigQuery"]}
              items={d.custom.polished} onChange={(polished) => setCustom({ polished })} />

            <LinksEditor links={d.custom.links} onChange={(links) => setCustom({ links })}
              note="All optional. If you're bringing an existing codelab or dataset, this is the only section you need." />
          </>
        )}

        <Field label="Accent colour" hint="Sets the banner colour on your jam page and card.">
          <div className="flex gap-2">
            {G_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setCustom({ color: c })} aria-pressed={d.custom.color === c}
                className={[
                  "h-9 w-9 rounded-full border-2 transition-transform",
                  d.custom.color === c ? "border-ink scale-110" : "border-line",
                  c === "blue" ? "bg-gblue" : c === "red" ? "bg-gred" : c === "yellow" ? "bg-gyellow" : "bg-ggreen",
                ].join(" ")}
                title={c}
              />
            ))}
          </div>
        </Field>

        <Field
          label="Hero image"
          hint="Optional. Shown at the top of your jam page. PNG, JPEG, WebP or GIF, up to 8 MiB — it uploads when you save."
        >
          <div className="space-y-2">
            {(heroPreview || d.custom.heroImageUrl) && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={heroPreview || d.custom.heroImageUrl}
                alt=""
                className="rounded-xl border border-line max-h-48"
              />
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) pickHero(f); }}
                className="text-sm text-ash file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-cloud file:text-ink file:text-sm"
              />
              {heroFile && <span className="text-xs text-ash">Uploads when you save.</span>}
              {(heroPreview || d.custom.heroImageUrl) && (
                <button type="button" onClick={clearHero} className="text-xs text-gred hover:underline">
                  Remove image
                </button>
              )}
            </div>
          </div>
        </Field>

      </Section>

      {/* ── Publish ── */}
      <Section title="Visibility" eyebrow="Step 3">
        <Field label="Status" hint="Drafts are only visible to you. Published jams appear on /jams and anyone with the link can see them.">
          <select className="input sm:max-w-xs" value={d.status} onChange={(e) => set({ status: e.target.value as Draft["status"] })}>
            <option value="draft">Draft — only me</option>
            <option value="published">Published — live</option>
            <option value="archived">Archived — hidden, kept for the record</option>
          </select>
        </Field>
      </Section>

      <div className="flex items-center gap-3 flex-wrap">
        <button type="submit" disabled={busy || pending} className="btn-google disabled:opacity-60">
          {busy ? "Saving…" : mode === "create" ? "Create jam" : "Save changes"}
        </button>
        {mode === "edit" && (
          <>
            <a href={`/jam/${d.slug}`} className="btn-ghost" target="_blank" rel="noreferrer">Preview page ↗</a>
            <button type="button" onClick={onDelete} disabled={busy} className="ml-auto text-sm text-gred hover:underline disabled:opacity-60">
              Delete this jam
            </button>
          </>
        )}
      </div>
    </form>
  );
}

/* ── Small building blocks, matching the submit form's shapes ── */

function Section({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="card p-6 space-y-4">
      <div>
        <div className="section-eyebrow">{eyebrow}</div>
        <h2 className="font-display font-bold text-xl text-ink mt-1">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

function ListEditor({
  label, hint, items, max, maxLen, placeholders = [], onChange,
}: {
  label: string; hint: string; items: string[]; max: number; maxLen: number;
  placeholders?: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="space-y-2">
        {items.map((value, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className="input" maxLength={maxLen} value={value}
              placeholder={placeholders[i % Math.max(placeholders.length, 1)] ?? ""}
              onChange={(e) => { const next = [...items]; next[i] = e.target.value; onChange(next); }}
            />
            <button
              type="button" aria-label={`Remove ${label} entry ${i + 1}`}
              onClick={() => { const next = items.filter((_, j) => j !== i); onChange(next.length ? next : [""]); }}
              className="text-ash hover:text-gred px-2 shrink-0"
            >
              ×
            </button>
          </div>
        ))}
        {items.length < max && (
          <button type="button" onClick={() => onChange([...items, ""])} className="text-sm text-gblue hover:underline">
            + Add another
          </button>
        )}
      </div>
    </Field>
  );
}

function LinksEditor({
  links, onChange, note,
}: {
  links: TopicLinks; onChange: (next: TopicLinks) => void; note: string;
}) {
  return (
    <div>
      <span className="text-sm font-medium text-ink">Links</span>
      <p className="hint">{note}</p>
      <div className="mt-2 grid sm:grid-cols-2 gap-3">
        {LINK_FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="text-xs text-ash">{f.label}</span>
            <input
              type="url" placeholder={f.example} className="input mt-1"
              value={links[f.key] ?? ""}
              onChange={(e) => onChange({ ...links, [f.key]: e.target.value })}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
