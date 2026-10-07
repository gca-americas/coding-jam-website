import { TRACKS, colorClasses } from "@/lib/tracks";

/**
 * The per-track brief, expandable.
 *
 * One component, two homes: the organizer playbook and the new-jam page. The
 * setup assistant links into it by anchor (`#track-<slug>`) instead of
 * describing tracks in chat, so the wording lives here and nowhere else.
 */
export default function TrackNotes({
  heading = true,
  className = "",
  tracks = TRACKS,
  copy = {},
}: {
  /** The playbook wants the section framing; the jam form already has its own. */
  heading?: boolean;
  className?: string;
  /** Localized catalogue. Server callers pass it; defaults to English. */
  tracks?: typeof TRACKS;
  /** notes.* strings. A client parent cannot reach the catalogue itself. */
  copy?: Record<string, string>;
}) {
  // `t` is the track in the map below, so the translator is `tr`.
  const tr = (k: string) => copy[k] ?? k;
  return (
    <section id="track-notes" className={`scroll-mt-20 ${className}`}>
      {heading && (
        <>
          <div className="section-eyebrow">{tr("notes.eyebrow")}</div>
          <h2 className="h-display mt-2 text-3xl">{tr("notes.title")}</h2>
          <p className="mt-3 max-w-2xl text-ash">
            {tr("notes.lede")}
          </p>
        </>
      )}

      <div className={heading ? "mt-8 space-y-3" : "space-y-3"}>
        {tracks.map((t) => {
          const c = colorClasses[t.color];
          return (
            <details key={t.slug} id={`track-${t.slug}`} className="card group scroll-mt-24 overflow-hidden">
              <summary className="flex cursor-pointer items-center gap-4 p-5 transition-colors hover:bg-cloud/40">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${c.bgSoft}`}>
                  {t.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-semibold text-ink">{t.name}</span>
                    <span className="chip bg-cloud text-ash">
                      {t.aiStudio.level >= 3 ? "Browser is enough" : "Laptop needed"}
                    </span>
                    {t.kind === "project" && <span className="chip bg-cloud text-ash">{tr("notes.starterRepo")}</span>}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-ash">{t.summary}</div>
                </div>
                <span className="shrink-0 select-none text-xl text-ash transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>

              <div className="grid gap-8 border-t border-line p-5 sm:p-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <div className="section-eyebrow">{tr("notes.requirement")}</div>
                    <p className={`mt-2 rounded-xl ${c.bgSoft} px-4 py-3 font-display font-semibold text-ink`}>
                      {t.requirement ?? t.mmv}
                    </p>
                  </div>
                  <div>
                    <div className="section-eyebrow">{tr("notes.openWith")}</div>
                    <p className="mt-2 text-sm leading-relaxed text-ink">{t.facilitator.openWith}</p>
                  </div>
                  <div>
                    <div className="section-eyebrow">{tr("notes.watchFor")}</div>
                    <p className="mt-2 text-sm leading-relaxed text-ink">{t.facilitator.watchFor}</p>
                  </div>
                  <div>
                    <div className="section-eyebrow">{tr("notes.fishFor")}</div>
                    <p className="mt-2 text-sm leading-relaxed text-ink">{t.facilitator.fishFor}</p>
                  </div>
                </div>

                <div>
                  <div className="section-eyebrow">{tr("notes.ifAsked")}</div>
                  <p className="mt-2 text-xs text-ash">{tr("notes.ifAskedLede")}</p>
                  <ul className="mt-2 space-y-1.5">
                    {(t.examples ?? t.polished ?? []).map((e) => (
                      <li key={e} className="flex items-start gap-2 text-sm text-ink">
                        <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${c.bg}`} />
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="section-eyebrow mt-6">{tr("notes.tech")}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.tech.map((x) => (
                      <span key={x} className="pill">{x}</span>
                    ))}
                  </div>

                  <div className="section-eyebrow mt-6">{tr("notes.safetyNets")}</div>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    {t.codelab ? (
                      <a href={t.codelab.url} target="_blank" rel="noreferrer" className="font-medium text-gblue hover:underline">
                        📘 {t.codelab.title} ↗
                      </a>
                    ) : (
                      <span className="text-ash">{tr("notes.noCodelab")}</span>
                    )}
                    {t.video && (
                      <a href={t.video.url} target="_blank" rel="noreferrer" className="font-medium text-gred hover:underline">
                        {tr("notes.demoVideo")}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
