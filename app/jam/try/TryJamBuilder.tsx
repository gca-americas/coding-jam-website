"use client";

import { useT } from "@/lib/i18n/client";
import ToolPicker from "@/app/ToolPicker";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import {
  G_COLORS,
  LIMITS,
  LINK_FIELDS,
  topicView,
  type Topic,
  type TopicKind,
  type TopicLinks,
} from "@/lib/topic";
import { colorClasses } from "@/lib/tracks";
import { decodeSharedJam, encodeSharedJam, MAX_FRAGMENT, type SharedJam } from "@/lib/topic-share";
import TopicBody from "@/components/TopicBody";
import Timeline from "@/components/Timeline";

export type TrackChoice = { slug: string; number?: number; project: string; emoji: string };

type CustomDraft = {
  title: string; tagline: string; mmv: string;
  thinkAbout: string[]; tech: string[]; polished: string[];
  color: string; emoji: string; links: TopicLinks;
};

type Draft = {
  title: string; hostName: string; chapter: string; country: string;
  eventDate: string; locationNote: string; rsvpUrl: string;
  kind: TopicKind; trackSlug: string;
  custom: CustomDraft;
};

const EMPTY: Draft = {
  title: "", hostName: "", chapter: "", country: DEFAULT_COUNTRY,
  eventDate: "", locationNote: "", rsvpUrl: "",
  kind: "track", trackSlug: "",
  custom: {
    title: "", tagline: "", mmv: "", thinkAbout: [""], tech: [""], polished: [""],
    color: "blue", emoji: "✨", links: {},
  },
};

const KIND_TABS: Array<{ value: TopicKind; label: string }> = [
  { value: "track", label: "jfm.kind.track" },
  { value: "custom", label: "jfm.kind.custom" },
];

function topicFrom(d: Draft): Topic {
  if (d.kind === "track") return { kind: "track", trackSlug: d.trackSlug };
  return {
    kind: "custom",
    title: d.custom.title, tagline: d.custom.tagline,
    ...(d.custom.mmv ? { mmv: d.custom.mmv } : {}),
    thinkAbout: d.custom.thinkAbout.filter((s) => s.trim()),
    tech: d.custom.tech.filter((s) => s.trim()),
    polished: d.custom.polished.filter((s) => s.trim()),
    color: d.custom.color as CustomDraft["color"] as never,
    emoji: d.custom.emoji || "✨",
    links: d.custom.links,
  };
}

function draftFrom(jam: SharedJam): Draft {
  const d: Draft = {
    ...EMPTY,
    title: jam.title,
    hostName: jam.hostName ?? "",
    chapter: jam.chapter ?? "",
    country: jam.country ?? DEFAULT_COUNTRY,
    eventDate: jam.eventDate ?? "",
    locationNote: jam.locationNote ?? "",
    rsvpUrl: jam.rsvpUrl ?? "",
    kind: jam.topic.kind,
  };
  const t = jam.topic;
  if (t.kind === "track") d.trackSlug = t.trackSlug;
  if (t.kind === "custom") {
    d.custom = {
      title: t.title, tagline: t.tagline, mmv: t.mmv ?? "",
      thinkAbout: t.thinkAbout?.length ? t.thinkAbout : [""],
      tech: t.tech?.length ? t.tech : [""],
      polished: t.polished?.length ? t.polished : [""],
      color: t.color, emoji: t.emoji, links: t.links ?? {},
    };
  }
  return d;
}

export default function TryJamBuilder({
  tracks,
  timelineCopy,
  pickerCopy,
}: {
  tracks: TrackChoice[];
  timelineCopy: Record<string, string>;
  pickerCopy: Record<string, string>;
}) {
  const [d, setD] = useState<Draft>(EMPTY);
  const [mode, setMode] = useState<"loading" | "edit" | "preview">("loading");
  const [linkError, setLinkError] = useState<string | null>(null);
  const t = useT();
  const [copied, setCopied] = useState(false);

  // A fragment in the URL means someone opened a shared link — decode it and
  // show the finished page. No fragment means start the builder empty.
  useEffect(() => {
    const frag = window.location.hash.slice(1);
    if (!frag) {
      setMode("edit");
      return;
    }
    const decoded = decodeSharedJam(frag);
    if ("error" in decoded) {
      setLinkError(decoded.error);
      setMode("edit");
      return;
    }
    setD(draftFrom(decoded.jam));
    setMode("preview");
  }, []);

  const set = (patch: Partial<Draft>) => setD((p) => ({ ...p, ...patch }));
  const setCustom = (patch: Partial<CustomDraft>) => setD((p) => ({ ...p, custom: { ...p.custom, ...patch } }));

  const shared: SharedJam = useMemo(
    () => ({
      title: d.title || "Untitled jam",
      hostName: d.hostName || undefined,
      chapter: d.chapter || undefined,
      country: d.country || undefined,
      eventDate: d.eventDate || undefined,
      locationNote: d.locationNote || undefined,
      rsvpUrl: d.rsvpUrl || undefined,
      topic: topicFrom(d),
    }),
    [d],
  );

  const fragment = useMemo(() => {
    try {
      return encodeSharedJam(shared);
    } catch {
      return "";
    }
  }, [shared]);

  const shareUrl =
    typeof window === "undefined" ? "" : `${window.location.origin}/jam/try#${fragment}`;
  const tooLong = fragment.length > MAX_FRAGMENT;

  const showPreview = useCallback(() => {
    window.location.hash = fragment;
    setMode("preview");
    window.scrollTo({ top: 0 });
  }, [fragment]);

  function backToEdit() {
    setMode("edit");
    window.scrollTo({ top: 0 });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }


  // The fragment is only readable after hydration, so the first paint can't know
  // whether this is a fresh builder or someone opening a shared link. Render the
  // static header either way rather than a bare spinner — it's correct for both.
  if (mode === "loading") {
    return (
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dotted-bg opacity-50" />
        <div className="container-page relative py-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-gyellow" /> {t("try.eyebrow")}
          </div>
          <h1 className="h-display text-4xl sm:text-5xl mt-5 max-w-3xl leading-[1.05]">
            {t("try.title")}
          </h1>
          <div className="mt-8 space-y-3 max-w-3xl" aria-hidden="true">
            <div className="h-24 rounded-2xl bg-cloud animate-pulse" />
            <div className="h-48 rounded-2xl bg-cloud animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (mode === "preview") {
    return (
      <Preview
        jam={shared}
        shareUrl={shareUrl}
        onEdit={backToEdit}
        onCopy={copyLink}
        copied={copied}
        timelineCopy={timelineCopy}
        pickerCopy={pickerCopy}
      />
    );
  }

  const canPreview = Boolean(
    d.title.trim() &&
      ((d.kind === "track" && d.trackSlug) ||
        (d.kind === "custom" && d.custom.title.trim() && d.custom.tagline.trim())),
  );

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dotted-bg opacity-50" />
        <div className="container-page relative py-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-gyellow" /> {t("try.eyebrow")}
          </div>
          <h1 className="h-display text-4xl sm:text-5xl mt-5 max-w-3xl leading-[1.05]">
            {t("try.title")}
          </h1>
          <p className="mt-4 text-ash max-w-2xl">
            {t("try.lede")}
          </p>
          <p className="mt-3 text-sm text-ash max-w-2xl">
            {t("try.upsell.a")}{" "}
            <Link href="/organizer" className="text-gblue hover:underline">
              {t("try.becomeOrganizer")}
            </Link>{" "}
            {t("try.upsell.b")}
          </p>
        </div>
      </section>

      <section className="container-page pb-24 max-w-3xl space-y-8">
        {linkError && (
          <div className="rounded-lg bg-gred/10 text-gred border border-gred/30 p-3 text-sm">
            {linkError} {t("try.freshOne")}
          </div>
        )}

        <Card title={t("jfm.sec.event")} eyebrow={t("sf.step1")}>
          <Field label={t("jfm.name")}>
            <input className="input" maxLength={90} placeholder="GDG Seattle Coding Jam — Week 3"
              value={d.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("try.yourName")} hint={t("try.yourName.hint")}>
              <input className="input" maxLength={60} value={d.hostName} onChange={(e) => set({ hostName: e.target.value })} />
            </Field>
            <Field label={t("try.chapterGroup")} hint={t("try.optional")}>
              <input className="input" maxLength={80} placeholder="GDG Seattle"
                value={d.chapter} onChange={(e) => set({ chapter: e.target.value })} />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("sf.country")}>
              <select className="input" value={d.country} onChange={(e) => set({ country: e.target.value })}>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label={t("jfm.date")} hint={t("try.optional")}>
              <input type="date" className="input" value={d.eventDate} onChange={(e) => set({ eventDate: e.target.value })} />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("jfm.where")} hint={t("try.optional")}>
              <input className="input" maxLength={120} placeholder="6:30pm · Room 401"
                value={d.locationNote} onChange={(e) => set({ locationNote: e.target.value })} />
            </Field>
            <Field label={t("jfm.rsvp")} hint={t("try.httpsHint")}>
              <input type="url" className="input" placeholder="https://…"
                value={d.rsvpUrl} onChange={(e) => set({ rsvpUrl: e.target.value })} />
            </Field>
          </div>
        </Card>

        <Card title={t("jfm.sec.topic")} eyebrow={t("sf.step2")}>
          <div className="grid sm:grid-cols-2 gap-2">
            {KIND_TABS.map((tab) => (
              <button key={tab.value} type="button" onClick={() => set({ kind: tab.value })} aria-pressed={tab.value === d.kind}
                className={[
                  "px-3 py-2 rounded-xl border text-sm font-medium transition-colors text-left",
                  tab.value === d.kind
                    ? "border-gblue bg-gblue/10 text-gblue"
                    : "border-line bg-white text-ash hover:border-gblue/40 hover:text-ink",
                ].join(" ")}
              >
                {t(tab.label)}
              </button>
            ))}
          </div>

          {d.kind === "track" && (
            <Field label={t("jfm.whichTopic")} hint={t("try.whichTopic.hint")}>
              <select className="input" value={d.trackSlug} onChange={(e) => set({ trackSlug: e.target.value })}>
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
                  <input className="input" maxLength={LIMITS.title} placeholder="Receipt Whisperer"
                    value={d.custom.title} onChange={(e) => setCustom({ title: e.target.value })} />
                </Field>
              </div>
              <Field label={t("jfm.tagline")}>
                <input className="input" maxLength={LIMITS.tagline} placeholder="Snap a receipt → a tidy row in your spreadsheet."
                  value={d.custom.tagline} onChange={(e) => setCustom({ tagline: e.target.value })} />
              </Field>
              <Field label={t("tb.ships.eyebrow")} hint={t("try.mmv.hint")}>
                <textarea rows={4} className="input" maxLength={LIMITS.mmv}
                  value={d.custom.mmv} onChange={(e) => setCustom({ mmv: e.target.value })} />
              </Field>
              <Field label={t("jfm.accent")}>
                <div className="flex gap-2">
                  {G_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setCustom({ color: c })} aria-pressed={d.custom.color === c}
                      title={c}
                      className={[
                        "h-9 w-9 rounded-full border-2 transition-transform",
                        d.custom.color === c ? "border-ink scale-110" : "border-line",
                        c === "blue" ? "bg-gblue" : c === "red" ? "bg-gred" : c === "yellow" ? "bg-gyellow" : "bg-ggreen",
                      ].join(" ")}
                    />
                  ))}
                </div>
              </Field>
              <ListEditor label={t("jfm.thinkAbout")} items={d.custom.thinkAbout} max={LIMITS.thinkAbout.items}
                maxLen={LIMITS.thinkAbout.chars} placeholders={["One playlist, not three."]}
                onChange={(thinkAbout) => setCustom({ thinkAbout })} />
              <ListEditor label={t("jfm.tech")} items={d.custom.tech} max={LIMITS.tech.items} maxLen={LIMITS.tech.chars}
                placeholders={["Gemini API", "Firestore", "Cloud Run"]}
                onChange={(tech) => setCustom({ tech })} />
              <ListEditor label={t("tb.polished.eyebrow")} items={d.custom.polished} max={LIMITS.polished.items}
                maxLen={LIMITS.polished.chars} placeholders={["Export to BigQuery"]}
                onChange={(polished) => setCustom({ polished })} />
              <div>
                <span className="text-sm font-medium text-ink">{t("jfm.links")}</span>
                <p className="hint">{t("try.linksHint")}</p>
                <div className="mt-2 grid sm:grid-cols-2 gap-3">
                  {LINK_FIELDS.map((f) => (
                    <label key={f.key} className="block">
                      <span className="text-xs text-ash">{t(`link.${f.key}.label`)}</span>
                      <input type="url" placeholder={f.example} className="input mt-1"
                        value={d.custom.links[f.key] ?? ""}
                        onChange={(e) => setCustom({ links: { ...d.custom.links, [f.key]: e.target.value } })} />
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

        </Card>

        {tooLong && (
          <div className="rounded-lg bg-gyellow/15 text-ink border border-gyellow/40 p-3 text-sm">
            This page is getting long for a link ({fragment.length.toLocaleString()} characters).
            Some chat apps will cut it off. Trim a section, or publish it as a real jam instead.
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <button type="button" onClick={showPreview} disabled={!canPreview}
            className="btn-google disabled:opacity-50 disabled:cursor-not-allowed">
            {t("try.seePage")}
          </button>
          {!canPreview && (
            <span className="text-sm text-ash">
              Add a jam name{d.kind === "track" ? " and pick a topic" : ", a topic title and a tagline"} to continue.
            </span>
          )}
        </div>
      </section>
    </>
  );
}

function Preview({
  jam, shareUrl, onEdit, onCopy, copied, timelineCopy, pickerCopy,
}: {
  jam: SharedJam; shareUrl: string; onEdit: () => void; onCopy: () => void; copied: boolean;
  timelineCopy: Record<string, string>;
  pickerCopy: Record<string, string>;
}) {
  const t = useT();
  const view = topicView(jam.topic);
  const c = colorClasses[view.color];
  const links = LINK_FIELDS.map((f) => ({ ...f, url: view.links[f.key] })).filter((l) => l.url);

  return (
    <>
      <div className="bg-gyellow/15 border-b border-gyellow/40">
        <div className="container-page py-3 flex items-center justify-between gap-4 flex-wrap text-sm">
          <span className="text-ink">
            <b>{t("try.unsaved")}</b> {t("try.unsaved.body")}
          </span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onCopy} className="text-gblue hover:underline font-medium">
              {copied ? t("sf.copied") : t("sf.copyLink")}
            </button>
            <button type="button" onClick={onEdit} className="text-ash hover:text-ink">
              {t("try.keepEditing")}
            </button>
          </div>
        </div>
      </div>

      <section className={`relative overflow-hidden ${c.bg} text-white`}>
        <div className="absolute inset-0 dotted-bg opacity-20" />
        <div className="container-page relative py-16 sm:py-20">
          {(jam.chapter || jam.country) && (
            <div className="text-xs font-mono font-semibold tracking-[0.2em] uppercase opacity-90">
              {[jam.chapter, jam.country].filter(Boolean).join(" · ")}
            </div>
          )}
          <h1 className="h-display text-4xl sm:text-6xl mt-3 leading-[1.05] max-w-3xl">{jam.title}</h1>
          <div className="mt-8 rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-6 max-w-2xl">
            <div className="text-xs uppercase tracking-widest opacity-80">{t("jam.thisWeek")}</div>
            <div className="flex items-start gap-3 mt-2">
              <span className="text-3xl leading-none">{view.emoji}</span>
              <div>
                <div className="font-display font-bold text-2xl">{view.title}</div>
                <p className="opacity-90 mt-1">{view.tagline}</p>
              </div>
            </div>
            {view.track && (
              <Link href={`/tracks/${view.track.slug}`}
                className="inline-block mt-4 text-sm underline underline-offset-4 opacity-90 hover:opacity-100">
                {t("try.fullBrief")}
              </Link>
            )}
          </div>
          {jam.rsvpUrl && (
            <div className="mt-6">
              <a href={jam.rsvpUrl} target="_blank" rel="noreferrer" className="btn bg-white text-ink hover:shadow-pop">
                {t("jam.rsvp")}
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-14 grid lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-10">
          <TopicBody view={view} />
          <ToolPicker copy={pickerCopy} />
          <div>
            <div className="section-eyebrow">{t("jam.shape.eyebrow")}</div>
            <h2 className="h-display text-2xl mt-2 mb-5">{t("about.rhythm.title")}</h2>
            <Timeline copy={timelineCopy} />
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          <div className="card p-6">
            <div className="section-eyebrow">{t("jam.details")}</div>
            <dl className="mt-4 space-y-3 text-sm">
              {jam.hostName && <Detail label={t("jam.detail.lead")} value={jam.hostName} />}
              {jam.chapter && <Detail label={t("jam.detail.chapter")} value={jam.chapter} />}
              {jam.country && <Detail label={t("sf.country")} value={jam.country} />}
              {jam.eventDate && <Detail label={t("jam.detail.date")} value={jam.eventDate} />}
              {jam.locationNote && <Detail label={t("jam.detail.where")} value={jam.locationNote} />}
            </dl>
          </div>

          {links.length > 0 && (
            <div className="card p-6">
              <div className="section-eyebrow">{t("jam.need")}</div>
              <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                  <li key={l.key}>
                    <a href={l.url} target="_blank" rel="noreferrer" className="text-sm text-gblue hover:underline font-medium">
                      {t(`link.${l.key}.label`)} ↗
                    </a>
                    <p className="text-xs text-ash mt-0.5">{t(`link.${l.key}.hint`)}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {view.tech.length > 0 && (
            <div className="card p-6">
              <div className="section-eyebrow">{t("jam.touch")}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {view.tech.map((t) => <span key={t} className={`chip ${c.chip}`}>{t}</span>)}
              </div>
            </div>
          )}

          <div className="card p-6 bg-cloud/50">
            <div className="text-xs uppercase tracking-widest font-semibold text-ash">{t("try.permanent")}</div>
            <p className="text-sm text-ink mt-2 leading-relaxed">
              {t("try.permanent.body")}
            </p>
            <Link href="/organizer" className="btn-google w-full mt-4 text-center block">
              {t("try.becomeOrganizer")}
            </Link>
          </div>
        </aside>
      </section>

      <section className="container-page pb-24">
        <div className="card p-6">
          <div className="section-eyebrow">{t("try.yourLink")}</div>
          <p className="text-sm text-ash mt-2">
            {t("try.yourLink.body")}
          </p>
          <div className="mt-3 flex gap-2">
            <input readOnly value={shareUrl} onFocus={(e) => e.currentTarget.select()}
              className="input font-mono text-xs flex-1" />
            <button type="button" onClick={onCopy} className="btn-google shrink-0 !py-2 !px-4">
              {copied ? t("sf.copied") : t("try.copy")}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Small building blocks ── */

function Card({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-ash">{label}</dt>
      <dd className="text-ink font-medium">{value}</dd>
    </div>
  );
}

function ListEditor({
  label, items, max, maxLen, placeholders = [], onChange,
}: {
  label: string; items: string[]; max: number; maxLen: number;
  placeholders?: string[]; onChange: (next: string[]) => void;
}) {
  const t = useT();
  return (
    <Field label={label}>
      <div className="space-y-2">
        {items.map((value, i) => (
          <div key={i} className="flex items-center gap-2">
            <input className="input" maxLength={maxLen} value={value}
              placeholder={placeholders[i % Math.max(placeholders.length, 1)] ?? ""}
              onChange={(e) => { const next = [...items]; next[i] = e.target.value; onChange(next); }} />
            <button type="button" aria-label={`${label} ${i + 1}`}
              onClick={() => { const next = items.filter((_, j) => j !== i); onChange(next.length ? next : [""]); }}
              className="text-ash hover:text-gred px-2 shrink-0">
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
