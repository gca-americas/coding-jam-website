import type { Metadata } from "next";
import Link from "next/link";
import { getCopy, getT } from "@/lib/i18n";
import { getLocalizedTrack, localizeTracks } from "@/lib/i18n/tracks";
import { notFound } from "next/navigation";
import { TRACKS, getTrack, colorClasses, bothToolsLevel, CODING_JAM_STACK } from "@/lib/tracks";
import Timeline from "@/components/Timeline";
import TopicBody from "@/components/TopicBody";
import { topicViewFromTrack } from "@/lib/topic";

const STACK_KEYS = ["stack.antigravity", "stack.python", "stack.uv", "stack.gemini", "stack.web"];

export function generateStaticParams() {
  return TRACKS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const t = await getT();
  const { slug } = await params;
  const found = getTrack(slug);
  if (!found) return {};
  const track = await getLocalizedTrack(found);
  return {
    title: t("meta.track.title").replace("{name}", track.name),
    description: track.summary,
    openGraph: { title: track.name, description: track.summary, type: "website" },
  };
}


export default async function TrackPage({ params }: { params: Promise<{ slug: string }> }) {
  const timelineCopy = await getCopy(["tl."]);
  const t = await getT();
  const { slug } = await params;
  const found = getTrack(slug);
  if (!found) notFound();
  const track = await getLocalizedTrack(found);

  const c = colorClasses[track.color];
  const localized = await localizeTracks(TRACKS);
  const others = localized.filter((x) => x.slug !== track.slug);
  const idx = localized.findIndex((x) => x.slug === track.slug);
  const suggestions = [others[idx % others.length], others[(idx + 2) % others.length]];
  const both = bothToolsLevel(track);
  const isOpen = track.kind === "open";

  return (
    <>
      <section className={`relative overflow-hidden ${c.bg} text-white`}>
        <div className="absolute inset-0 dotted-bg opacity-20" />
        <div className="container-page relative py-16 sm:py-24">
          <Link href="/#jams" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white">
            {t("track.allTracks")}
          </Link>
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="font-mono text-xs font-semibold uppercase tracking-[0.2em] opacity-90">
                {t("card.track")}
              </div>
              <h1 className="h-display mt-3 text-4xl leading-[1.05] sm:text-5xl">{track.name}</h1>
              <p className="mt-4 text-lg text-white/90">{track.summary}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="chip bg-white/20 text-white backdrop-blur-sm">{t("track.twoHour")}</span>
                {track.programDetails ? (
                  track.programDetails.badges.map((b) => (
                    <span key={b} className="chip bg-white/20 text-white backdrop-blur-sm">
                      {b}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="chip bg-white/20 text-white backdrop-blur-sm">
                      {isOpen ? t("track.youChoose") : t("track.briefIncluded")}
                    </span>
                    {both >= 3 && (
                      <span className="chip bg-white/20 text-white backdrop-blur-sm">{t("track.bothTools")}</span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="text-[110px] leading-none drop-shadow-lg sm:text-[150px]" aria-hidden="true">
              {track.emoji}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {track.codelab && (
              <a
                href={track.codelab.url}
                target="_blank"
                rel="noreferrer"
                className="btn bg-white text-ink hover:shadow-pop"
              >
                {t("track.openCodelabArrow")}
              </a>
            )}
            {track.video && (
              <a
                href={track.video.url}
                target="_blank"
                rel="noreferrer"
                className="btn border border-white/40 text-white hover:bg-white/10"
              >
                {t("track.demoVideo")}
              </a>
            )}
            <Link href="/submit" className="btn border border-white/40 text-white hover:bg-white/10">
              {t("track.shareBuild")}
            </Link>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-12 py-16 lg:grid-cols-3">
        <div className="space-y-12 lg:col-span-2">
          {track.programDetails ? (
            <TopicBody view={topicViewFromTrack(track)} />
          ) : (
            <>
              <section>
                <div className="section-eyebrow">{isOpen ? t("track.requirement") : t("track.inTheRoom")}</div>
                {!isOpen && <h2 className="h-display mt-2 text-2xl">{t("track.whatYoullBuild")}</h2>}
                <div className={`mt-5 rounded-2xl border ${c.border}/40 ${c.bgSoft} px-6 py-5`}>
                  <p className="font-display text-xl font-semibold leading-snug text-ink">
                    {track.requirement ?? track.mmv}
                  </p>
                </div>
                <p className="mt-4 leading-relaxed text-ash">
                  {isOpen
                    ? t("track.onlyRule")
                    : t("track.followBrief")}
                </p>
                {track.aha && (
                  <p className={`mt-5 rounded-xl ${c.bgSoft} px-5 py-4 font-display text-lg italic text-ink`}>
                    &ldquo;{track.aha}&rdquo;
                  </p>
                )}
              </section>

              <section>
                <div className="section-eyebrow">{isOpen ? t("track.startingPoint") : t("track.afterJam")}</div>
                <h3 className="h-display mt-2 text-2xl">{isOpen ? t("track.directions") : t("track.polished")}</h3>
                <p className="mt-1 max-w-xl text-sm text-ash">
                  {isOpen
                    ? t("track.optionalExamples")
                    : t("track.polishedLede")}
                </p>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {(track.examples ?? track.polished ?? []).map((e) => (
                    <li key={e} className="flex items-start gap-2 text-sm">
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${c.bg}`} />
                      <span className="text-ink">{e}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <div className="section-eyebrow">{t("track.whileYouBuild")}</div>
                <h3 className="h-display mt-2 text-2xl">{t("track.keepInMind")}</h3>
                <ul className="mt-5 space-y-3">
                  {(track.guidance ?? track.thinkAbout ?? []).map((g) => (
                    <li key={g} className="flex gap-3">
                      <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${c.bg}`} />
                      <span className="text-ink">{g}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {/* Submitting is the step rooms forget, so the ask sits in the reading
              column rather than at the bottom of the sidebar. */}
          <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-cloud/60 px-5 py-4">
            <Link href="/submit" className="btn-google shrink-0">
              {t("track.shareBuild")}
            </Link>
            <p className="text-sm text-ash">
              {t("track.shareBand")}
            </p>
          </section>

          <section>
            <div className="section-eyebrow">The {t("track.twoHour")} rhythm</div>
            <h3 className="h-display mt-2 text-2xl">{t("track.howItFlows")}</h3>
            <p className="mt-1 max-w-xl text-sm text-ash">
              {t("track.sameShape")}
            </p>
            <div className="mt-6">
              <Timeline copy={timelineCopy} />
            </div>
          </section>
        </div>

        <aside className="space-y-6 self-start lg:sticky lg:top-24 lg:col-span-1">
          {track.programDetails && (
            <>
              <div className="card p-6">
                <div className="section-eyebrow">Scoring at a glance</div>
                <div className="mt-3 space-y-2.5 text-sm">
                  {track.programDetails.rubric.map((r) => (
                    <div key={r.pillar} className="flex items-center justify-between gap-2">
                      <span className="text-ink font-medium">{r.pillar.replace(/^\d+\.\s*/, "")}</span>
                      <span className={`chip ${c.chip} font-mono text-xs shrink-0`}>{r.weight}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs font-mono text-ash">
                  <span>Total Standard Score</span>
                  <span className="font-bold text-ink">100 Pts</span>
                </div>
              </div>

              <div className="card p-6 bg-cloud/50">
                <div className="text-xs uppercase tracking-widest font-semibold text-ash">
                  Open-source requirement
                </div>
                <p className="text-sm text-ink mt-2 leading-relaxed">
                  Teams retain <strong>100% IP ownership</strong>. All submitted code must be released publicly under{" "}
                  <strong>Apache License 2.0</strong>, with docs and synthetic evaluation datasets under{" "}
                  <strong>CC-BY 4.0 or CC0</strong>.
                </p>
              </div>

              <div className="card p-6">
                <div className="section-eyebrow">Quick links</div>
                <div className="mt-4 space-y-2">
                  <a
                    href="#rubric"
                    className={`flex items-center justify-between rounded-lg ${c.bgSoft} ${c.text} px-3 py-2 text-sm font-semibold hover:brightness-95 transition`}
                  >
                    <span className="flex items-center gap-2">
                      <span>⚖️</span> 100-Point Evaluation Rubric
                    </span>
                    <span>↓</span>
                  </a>
                  <a
                    href="#licensing"
                    className="flex items-center justify-between text-sm font-medium text-ink hover:text-gblue px-3 py-1.5"
                  >
                    IP &amp; Apache 2.0 Licensing <span>↓</span>
                  </a>
                  <a
                    href="#attestation"
                    className="flex items-center justify-between text-sm font-medium text-ink hover:text-gblue px-3 py-1.5"
                  >
                    Attestation &amp; Showcase Rights <span>↓</span>
                  </a>
                  <Link
                    href="/organizer/jams/new"
                    className="flex items-center justify-between text-sm font-medium text-ink hover:text-gblue px-3 py-1.5"
                  >
                    Host a chapter sprint <span>→</span>
                  </Link>
                </div>
              </div>
            </>
          )}

          <div className={`rounded-2xl border-2 ${c.border} ${c.bgSoft} p-6`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">🛟</span>
              <h2 className={`font-display text-lg font-bold ${c.text}`}>{t("track.stuck")}</h2>
            </div>
            {track.codelab ? (
              <>
                <p className="mt-2 text-sm text-ink">
                  {t("track.stuckLede")}
                </p>
                <a
                  href={track.codelab.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl ${c.bg} px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110`}
                >
                  {t("track.openCodelabBtn")} <span aria-hidden="true">↗</span>
                </a>
                <p className="mt-2 text-center text-xs text-ash">{track.codelab.title}</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-ink">
                {t("track.noCodelab")}
              </p>
            )}
            {track.datasets && track.datasets.length > 0 && (
              <div className="mt-4 border-t border-white/40 pt-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-ash">
                  {t("track.datasets")}
                </div>
                {track.datasets.map((d) => (
                  <a
                    key={d.url}
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1.5 flex items-center justify-between text-sm font-medium text-ink hover:underline"
                  >
                    {d.label} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            )}
            {track.starterRepo && (
              <a
                href={track.starterRepo}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center justify-between text-sm font-medium text-ink hover:underline"
              >
                {t("track.starterRepo")} <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>

          <div className="card p-6">
            <div className="section-eyebrow">{t("track.tech")}</div>
            <ul className="mt-4 space-y-2">
              {STACK_KEYS.map((k) => (
                <li key={k} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-ash" />
                  <span className="text-ink">{t(k)}</span>
                </li>
              ))}
              <li className="pb-1 pt-3 font-mono text-xs uppercase tracking-widest text-ash">
                {t("track.thisTrackAdds")}
              </li>
              {track.tech.map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm">
                  <span className={`h-1.5 w-1.5 rounded-full ${c.bg}`} />
                  <span className="text-ink">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <section className="container-page pb-20">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="section-eyebrow">{t("track.pickAnother")}</div>
            <h3 className="h-display mt-1 text-2xl">{t("track.allIndependent")}</h3>
          </div>
          <Link href="/#jams" className="text-sm text-gblue hover:underline">
            {t("track.seeAll")}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {suggestions.map((s) => {
            const sc = colorClasses[s.color];
            return (
              <Link
                key={s.slug}
                href={`/tracks/${s.slug}`}
                className="card card-hover flex items-center gap-4 p-5"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${sc.bgSoft}`}>
                  {s.emoji}
                </div>
                <div className="min-w-0">
                  <div className="font-display font-semibold text-ink">{s.name}</div>
                  <div className="truncate text-sm text-ash">{s.summary}</div>
                </div>
                <span className={`shrink-0 text-sm font-medium ${sc.text}`}>{t("tc.open")}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
