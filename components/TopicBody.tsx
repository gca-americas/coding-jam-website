import { colorClasses, type GColor, type TrackProgramDetails } from "@/lib/tracks";
import type { TopicView } from "@/lib/topic";

/**
 * The body of a jam page, rendered from the normalized TopicView.
 *
 * Shared by /jam/[slug] and the no-login builder at /jam/try so a page you
 * mock up anonymously looks exactly like the one you'd publish. Pure props, no
 * server imports — it renders on either side of the client boundary.
 */
export default function TopicBody({ view }: { view: TopicView }) {
  const c = colorClasses[view.color];
  const programDetails = view.track?.programDetails;

  return (
    <div className="space-y-8">
      {view.heroImageUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={view.heroImageUrl} alt="" className="rounded-2xl border border-line w-full" />
      )}

      {view.youtubeId && (
        <div className="aspect-video rounded-2xl overflow-hidden border border-line">
          <iframe
            src={`https://www.youtube.com/embed/${view.youtubeId}`}
            title="Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}

      {programDetails ? (
        <ProgramDetailsSections details={programDetails} color={view.color} />
      ) : (
        <>
          {view.mmv && (
            <div>
              <div className="section-eyebrow">What ships today</div>
              <h2 className="h-display text-2xl mt-2">The version everyone leaves with.</h2>
              <Prose text={view.mmv} className="mt-3" />
            </div>
          )}

          {view.thinkAbout.length > 0 && (
            <div>
              <div className="section-eyebrow">While you build</div>
              <h2 className="h-display text-2xl mt-2">Things worth deciding early.</h2>
              <ul className="mt-4 space-y-3">
                {view.thinkAbout.map((t, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className={`h-6 w-6 rounded-full shrink-0 ${c.bgSoft} ${c.text} text-xs font-bold flex items-center justify-center`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-ink">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {view.polished.length > 0 && (
            <div>
              <div className="section-eyebrow">The polished version</div>
              <h2 className="h-display text-2xl mt-2">What the at-home build adds.</h2>
              <ul className="mt-4 grid sm:grid-cols-2 gap-2">
                {view.polished.map((p, i) => (
                  <li key={i} className="text-sm text-ink flex gap-2">
                    <span className="text-ash">→</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const ACCENT_BARS = ["bg-gblue", "bg-gred", "bg-gyellow", "bg-ggreen"] as const;
const PILLAR_CHIPS = [
  "bg-gblue/10 text-gblue ring-1 ring-gblue/30",
  "bg-gred/10 text-gred ring-1 ring-gred/30",
  "bg-gyellow/15 text-yellow-700 ring-1 ring-gyellow/40",
  "bg-ggreen/10 text-ggreen ring-1 ring-ggreen/30",
] as const;

export function ProgramDetailsSections({
  details,
  color,
}: {
  details: TrackProgramDetails;
  color: GColor;
}) {
  const c = colorClasses[color];

  return (
    <div className="space-y-12">
      {/* Concept Overview */}
      <section id="overview" className="scroll-mt-24">
        <div className="section-eyebrow">Concept overview</div>
        <h2 className="h-display text-2xl sm:text-3xl mt-2">
          Uniting chapters around an annual societal challenge
        </h2>
        <div className="mt-4 space-y-4">
          {details.conceptOverview.map((paragraph, i) => (
            <p key={i} className="text-ink leading-relaxed text-lg">
              {paragraph}
            </p>
          ))}
        </div>
        {details.challenges.length > 0 && (
          <div className="mt-6 card p-5 bg-cloud/50">
            <div className="text-xs font-mono uppercase tracking-widest text-ash font-semibold">
              Annually rotating societal challenge domains
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {details.challenges.map((ch, idx) => (
                <span
                  key={ch}
                  className={`chip ${PILLAR_CHIPS[idx % PILLAR_CHIPS.length]} font-medium`}
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Purpose */}
      <section id="purpose" className="scroll-mt-24">
        <div className="section-eyebrow">Purpose</div>
        <h3 className="h-display text-2xl mt-2">Why chapters build together</h3>
        <div className="mt-5 grid sm:grid-cols-3 gap-4">
          {details.purpose.map((item, idx) => (
            <div key={item.title} className="card p-5 flex flex-col">
              <div className={`h-1.5 w-10 rounded-full ${ACCENT_BARS[idx % ACCENT_BARS.length]} mb-4`} />
              <div className="font-display font-semibold text-ink text-base leading-snug">
                {item.title}
              </div>
              <p className="text-sm text-ash mt-2 leading-relaxed flex-1">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Broader Regional & Societal Impact */}
      <section id="impact" className="scroll-mt-24">
        <div className="section-eyebrow">Broader regional &amp; societal impact</div>
        <h3 className="h-display text-2xl mt-2">Lasting civic &amp; ecosystem value</h3>
        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          {details.impact.map((item, idx) => (
            <div key={item.title} className={`card p-6 ${idx === 0 ? c.bgSoft : "bg-cloud/50"} border border-line`}>
              <div className="font-display font-semibold text-ink text-lg leading-snug">
                {item.title}
              </div>
              <p className="text-sm text-ink/90 mt-2 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Generic Universal Evaluation Rubric (100-Point Standard) */}
      <section id="rubric" className="scroll-mt-24">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="section-eyebrow">100-Point Standard</div>
            <h3 className="h-display text-2xl sm:text-3xl mt-2">
              Generic Universal Evaluation Rubric
            </h3>
          </div>
          <span className={`chip ${c.chip} font-mono font-semibold`}>4 Pillars × 25 Pts = 100 Pts</span>
        </div>
        <p className="text-ash mt-2 max-w-2xl text-sm leading-relaxed">{details.rubricIntro}</p>

        <div className="mt-6 card overflow-hidden border border-line">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cloud border-b border-line text-xs font-mono uppercase tracking-wider text-ash">
                  <th className="py-3.5 px-4 sm:px-5 w-[22%]">Pillar</th>
                  <th className="py-3.5 px-3 w-[11%] whitespace-nowrap">Weight</th>
                  <th className="py-3.5 px-4 w-[24%]">Core Focus</th>
                  <th className="py-3.5 px-4 sm:px-5">Scoring Criteria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm align-top">
                {details.rubric.map((row, idx) => (
                  <tr key={row.pillar} className="hover:bg-cloud/30 transition-colors">
                    <td className="py-4 px-4 sm:px-5 font-display font-semibold text-ink">
                      {row.pillar}
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className={`chip ${PILLAR_CHIPS[idx % PILLAR_CHIPS.length]} font-mono font-bold text-xs`}>
                        {row.weight}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-ash leading-relaxed">{row.focus}</td>
                    <td className="py-4 px-4 sm:px-5">
                      <ul className="space-y-2.5">
                        {row.criteria.map((crit) => (
                          <li key={crit.name} className="flex gap-2.5 items-start leading-relaxed">
                            <span
                              className={`mt-2 h-1.5 w-1.5 rounded-full shrink-0 ${ACCENT_BARS[idx % ACCENT_BARS.length]}`}
                            />
                            <span className="text-ink">
                              <strong className="font-semibold text-ink">
                                {crit.name} ({crit.points}):
                              </strong>{" "}
                              {crit.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Intellectual Property & Open Source Licensing */}
      <section id="licensing" className="scroll-mt-24">
        <div className="card p-6 sm:p-7 border border-line">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="section-eyebrow">Open source &amp; ownership</div>
              <h3 className="h-display text-2xl mt-1">
                Intellectual Property &amp; Open Source Licensing
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="chip bg-ggreen/10 text-ggreen ring-1 ring-ggreen/30 font-mono text-xs">
                100% Participant IP
              </span>
              <span className="chip bg-gblue/10 text-gblue ring-1 ring-gblue/30 font-mono text-xs">
                Apache License 2.0
              </span>
              <span className="chip bg-gyellow/15 text-yellow-700 ring-1 ring-gyellow/40 font-mono text-xs">
                CC-BY 4.0 / CC0
              </span>
            </div>
          </div>
          <p className="mt-4 text-ink leading-relaxed text-sm sm:text-base">{details.licensing}</p>
        </div>
      </section>

      {/* Attestation & Showcase Rights */}
      <section id="attestation" className="scroll-mt-24">
        <div className="card p-6 sm:p-7 bg-cloud/50 border border-line">
          <div className="section-eyebrow">Submission terms</div>
          <h3 className="h-display text-2xl mt-1">Attestation &amp; Showcase Rights</h3>
          <p className="mt-3 text-ink leading-relaxed text-sm sm:text-base">{details.attestation}</p>
        </div>
      </section>
    </div>
  );
}

/**
 * Organizer-authored prose. Rendered as plain text split on blank lines —
 * never as HTML — since this is untrusted input on a public page.
 */
export function Prose({ text, className = "" }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n{2,}/).filter(Boolean);
  return (
    <div className={`space-y-3 ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-ink leading-relaxed whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}

