"use client";

import { useT } from "@/lib/i18n/client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ChapterPicker, { type ChapterType } from "@/components/ChapterPicker";
import { parseChapter } from "@/lib/chapters";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { G_COLORS, LIMITS, LINK_FIELDS, type TopicKind, type TopicLinks } from "@/lib/topic";
import type { GColor } from "@/lib/tracks";
import type { Jam } from "@/lib/jams";

export type TrackOption = {
  slug: string;
  number?: number;
  project: string;
  tagline: string;
  emoji: string;
  color?: GColor;
};

/* Per-kind state is kept side by side rather than in one shared bag, so
   flipping between topic kinds to compare them never destroys typed work. */
type CustomDraft = {
  title: string; tagline: string; mmv: string;
  thinkAbout: string[]; tech: string[]; polished: string[];
  color: GColor; emoji: string; heroImageUrl: string; links: TopicLinks;
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
  { value: "track", label: "jfm.kind.track", blurb: "jfm.kind.track.blurb" },
  { value: "custom", label: "jfm.kind.custom", blurb: "jfm.kind.custom.blurb" },
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
function draftForCopy(jam: Jam, defaults: Parameters<typeof emptyDraft>[0]): Draft {
  return { ...draftFromJam(jam, defaults), slug: "", eventDate: "", status: "draft" };
}

function draftFromJam(jam: Jam, defaults: Parameters<typeof emptyDraft>[0]): Draft {
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
    if (t.color) d.custom.color = t.color;
    if (t.heroImageUrl) d.custom.heroImageUrl = t.heroImageUrl;
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
        ...(heroImageUrl ? { heroImageUrl } : {}),
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
  prefill,
}: {
  mode: "create" | "edit";
  jam?: Jam;
  /** Create mode only — pre-fills the form from a jam already run. */
  copyFrom?: Jam;
  tracks: TrackOption[];
  defaults: { chapterType: ChapterType; chapterName: string; country: string };
  /** Carried over from a create where the jam saved but its image didn't. */
  initialError?: string;
  /** Values proposed by the setup assistant. Merged in whenever a new one arrives. */
  prefill?: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(() => {
    if (jam) return draftFromJam(jam, defaults);
    if (copyFrom) return draftForCopy(copyFrom, defaults);
    const initial = emptyDraft(defaults);
    if (tracks.length > 0 && tracks[0].color) {
      initial.custom.color = tracks[0].color;
    }
    return initial;
  });

  /* The assistant proposes values; the organizer still reviews and submits.
     Only fields it actually returned are touched, so anything already typed
     here survives. */
  useEffect(() => {
    if (!prefill) return;
    setD((p) => {
      const next: Draft = { ...p };
      const set = (k: keyof Draft, v?: string) => {
        if (v !== undefined && v !== "") (next as Record<string, unknown>)[k] = v;
      };
      // No slug: the store assigns a five-digit URL on save.
      set("title", prefill.title);
      set("country", prefill.country);
      set("eventDate", prefill.eventDate);
      set("locationNote", prefill.locationNote);
      set("rsvpUrl", prefill.rsvpUrl);
      if (prefill.chapter) {
        const { type, name } = parseChapter(prefill.chapter);
        next.chapterType = type;
        next.chapterName = name;
      }
      if (prefill.trackSlug) {
        next.kind = "track";
        next.trackSlug = prefill.trackSlug;
      } else if (prefill.customTitle || prefill.customTagline) {
        next.kind = "custom";
        next.custom = {
          ...p.custom,
          title: prefill.customTitle ?? p.custom.title,
          tagline: prefill.customTagline ?? p.custom.tagline,
          mmv: prefill.customMmv ?? p.custom.mmv,
        };
      }
      return next;
    });
  }, [prefill]);
  const [busy, setBusy] = useState(false);
  const t = useT();
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


  /** Uploads the held image into this jam's folder and returns its public URL. */
  async function uploadHero(slug: string, file: File): Promise<string> {
    const body = new FormData();
    body.append("file", file);
    body.append("kind", "jam");
    body.append("jam", slug);
    const res = await fetch("/api/upload", { method: "POST", body });
    const j = await res.json().catch(() => ({ error: t("sf.err.uploadFailed") }));
    if (!res.ok) throw new Error(j.error || t("sf.err.uploadFailed"));
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
      // Both track and custom jams support hero image uploads
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
        const j = await res.json().catch(() => ({ error: t("jfm.err.save") }));
        throw new Error(j.error || t("jfm.err.save"));
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
            if (!patch.ok) throw new Error(t("jfm.err.image"));
          } catch (imgErr) {
            const why = imgErr instanceof Error ? imgErr.message : t("sf.err.uploadFailed");
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
      setError(err instanceof Error ? err.message : t("jfm.err.save"));
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
        const j = await res.json().catch(() => ({ error: t("jfm.err.delete") }));
        throw new Error(j.error || t("jfm.err.delete"));
      }
      router.push("/organizer/jams");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("jfm.err.delete"));
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
          {t("sf.saved")}{" "}
          {d.status === "published" ? (
            <a href={`/jam/${d.slug}`} className="underline font-medium">{t("jfm.viewLive")}</a>
          ) : (
            <>{t("jfm.stillDraft")}</>
          )}
        </div>
      )}

      {/* ── The event ── */}
      <Section title={t("jfm.sec.event")} eyebrow={t("sf.step1")}>
        <Field label={t("jfm.name")} hint={t("jfm.name.hint")}>
          <input
            required maxLength={90} className="input" placeholder="GDG Seattle Coding Jam — Week 3"
            value={d.title} onChange={(e) => set({ title: e.target.value })}
          />
        </Field>
        {/* The URL is assigned, not chosen — on create there's nothing to show
            yet, so this only appears once the jam has one. */}
        <Field label={t("jfm.url")} hint={mode === "create" ? t("jfm.url.hintNew") : t("jfm.url.hint")}>
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
        <Field label={t("jam.detail.chapter")}>
          <ChapterPicker
            type={d.chapterType} name={d.chapterName}
            onChange={(next) => set({ chapterType: next.type, chapterName: next.name })}
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t("sf.country")}>
            <select required className="input" value={d.country} onChange={(e) => set({ country: e.target.value })}>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label={t("jfm.date")} hint={t("jfm.date.hint")}>
            <input type="date" className="input" value={d.eventDate} onChange={(e) => set({ eventDate: e.target.value })} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t("jfm.where")} hint={t("jfm.where.hint")}>
            <input maxLength={120} className="input" value={d.locationNote} onChange={(e) => set({ locationNote: e.target.value })} />
          </Field>
          <Field label={t("jfm.rsvp")} hint={t("jfm.rsvp.hint")}>
            <input type="url" className="input" placeholder="https://…" value={d.rsvpUrl} onChange={(e) => set({ rsvpUrl: e.target.value })} />
          </Field>
        </div>
      </Section>

      {/* ── The topic ── */}
      <Section title={t("jfm.sec.topic")} eyebrow={t("sf.step2")}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {KIND_TABS.map((tab) => {
            const active = tab.value === d.kind;
            return (
              <button
                key={tab.value} type="button" onClick={() => set({ kind: tab.value })} aria-pressed={active}
                className={[
                  "px-3 py-2 rounded-xl border text-sm font-medium transition-colors text-left",
                  active ? "border-gblue bg-gblue/10 text-gblue" : "border-line bg-white text-ash hover:border-gblue/40 hover:text-ink",
                ].join(" ")}
              >
                {t(tab.label)}
              </button>
            );
          })}
        </div>
        <p className="hint">{t(KIND_TABS.find((tab) => tab.value === d.kind)?.blurb ?? "")}</p>

        {d.kind === "track" && (
          <Field label={t("jfm.whichTopic")} hint={t("jfm.whichTopic.hint")}>
            <select
              required
              className="input"
              value={d.trackSlug}
              onChange={(e) => {
                const slug = e.target.value;
                const tr = tracks.find((x) => x.slug === slug);
                set({
                  trackSlug: slug,
                  ...(tr && tr.color ? { custom: { ...d.custom, color: tr.color } } : {}),
                });
              }}
            >
              <option value="">{t("jfm.pickTopic")}</option>
              {tracks.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.emoji}{" "}
                  {t.project}
                </option>
              ))}
            </select>
          </Field>
        )}

        {d.kind === "custom" && (
          <>
            <div className="grid sm:grid-cols-[5rem,1fr] gap-4">
              <Field label={t("jfm.emoji")}>
                <input maxLength={8} className="input text-center text-xl" value={d.custom.emoji}
                  onChange={(e) => setCustom({ emoji: e.target.value })} />
              </Field>
              <Field label={t("jfm.topicTitle")}>
                <input required maxLength={LIMITS.title} className="input" placeholder="Receipt Whisperer"
                  value={d.custom.title} onChange={(e) => setCustom({ title: e.target.value })} />
              </Field>
            </div>
            <Field label={t("jfm.tagline")} hint={t("jfm.tagline.hint")}>
              <input required maxLength={LIMITS.tagline} className="input" placeholder="Snap a receipt → a tidy row in your spreadsheet."
                value={d.custom.tagline} onChange={(e) => setCustom({ tagline: e.target.value })} />
            </Field>
            <Field
              label={t("tb.ships.eyebrow")}
              hint={t("jfm.mmv.hint")}
            >
              <textarea rows={5} maxLength={LIMITS.mmv} className="input"
                placeholder={"Upload a photo of a receipt. Gemini reads it and returns merchant, date and total. One row appends to a Google Sheet.\n\nOne receipt at a time. No batch upload, no charts."}
                value={d.custom.mmv} onChange={(e) => setCustom({ mmv: e.target.value })} />
            </Field>
            <ListEditor
              label={t("jfm.thinkAbout")} hint={t("jfm.thinkAbout.hint").replace("{n}", String(LIMITS.thinkAbout.items))}
              max={LIMITS.thinkAbout.items} maxLen={LIMITS.thinkAbout.chars}
              placeholders={[
                "Ask Gemini for JSON and give it the exact shape you want.",
                "One receipt at a time — batch upload is the polished version.",
                "Try a crumpled receipt early. That's the real test.",
              ]}
              items={d.custom.thinkAbout} onChange={(thinkAbout) => setCustom({ thinkAbout })} />
            <ListEditor
              label={t("jfm.tech")} hint={t("jfm.tech.hint").replace("{n}", String(LIMITS.tech.items))}
              max={LIMITS.tech.items} maxLen={LIMITS.tech.chars}
              placeholders={["Gemini API", "Firestore", "Cloud Run", "Maps JavaScript API", "Imagen on Vertex AI"]}
              items={d.custom.tech} onChange={(tech) => setCustom({ tech })} />
            <ListEditor
              label={t("tb.polished.eyebrow")} hint={t("jfm.polished.hint").replace("{n}", String(LIMITS.polished.items))}
              max={LIMITS.polished.items} maxLen={LIMITS.polished.chars}
              placeholders={[
                "Batch upload a shoebox of receipts",
                "Monthly summary with charts",
                "Export to BigQuery",
              ]}
              items={d.custom.polished} onChange={(polished) => setCustom({ polished })} />

            <LinksEditor links={d.custom.links} onChange={(links) => setCustom({ links })}
              note={t("jfm.links.note")} />
          </>
        )}

        <Field label={t("jfm.accent")}>
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
          label={t("jfm.hero")}
          hint={t("jfm.hero.hint")}
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
              {heroFile && <span className="text-xs text-ash">{t("jfm.uploadsOnSave")}</span>}
              {(heroPreview || d.custom.heroImageUrl) && (
                <button type="button" onClick={clearHero} className="text-xs text-gred hover:underline">
                  {t("sf.remove")}
                </button>
              )}
            </div>
          </div>
        </Field>

      </Section>

      {/* ── Publish ── */}
      <Section title={t("jfm.sec.visibility")} eyebrow={t("sf.step3")}>
        <Field label={t("jfm.status")} hint={t("jfm.status.hint")}>
          <select className="input sm:max-w-xs" value={d.status} onChange={(e) => set({ status: e.target.value as Draft["status"] })}>
            <option value="draft">{t("jfm.status.draft")}</option>
            <option value="published">{t("jfm.status.published")}</option>
            <option value="archived">{t("jfm.status.archived")}</option>
          </select>
        </Field>
      </Section>

      <div className="flex items-center gap-3 flex-wrap">
        <button type="submit" disabled={busy || pending} className="btn-google disabled:opacity-60">
          {busy ? t("sf.saving") : mode === "create" ? t("jfm.createJam") : t("sf.saveChanges")}
        </button>
        {mode === "edit" && (
          <>
            <a href={`/jam/${d.slug}`} className="btn-ghost" target="_blank" rel="noreferrer">{t("jfm.previewPage")}</a>
            <button type="button" onClick={onDelete} disabled={busy} className="ml-auto text-sm text-gred hover:underline disabled:opacity-60">
              {t("jfm.deleteJam")}
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
  const t = useT();
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
              type="button" aria-label={`${label} ${i + 1}`}
              onClick={() => { const next = items.filter((_, j) => j !== i); onChange(next.length ? next : [""]); }}
              className="text-ash hover:text-gred px-2 shrink-0"
            >
              ×
            </button>
          </div>
        ))}
        {items.length < max && (
          <button type="button" onClick={() => onChange([...items, ""])} className="text-sm text-gblue hover:underline">
            {t("jfm.addAnother")}
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
  const t = useT();
  return (
    <div>
      <span className="text-sm font-medium text-ink">{t("jfm.links")}</span>
      <p className="hint">{note}</p>
      <div className="mt-2 grid sm:grid-cols-2 gap-3">
        {LINK_FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="text-xs text-ash">{t(`link.${f.key}.label`)}</span>
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
