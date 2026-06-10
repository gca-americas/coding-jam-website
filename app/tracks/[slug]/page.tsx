import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRACKS, getTrack, colorClasses, trackLabel, CODING_JAM_STACK } from "@/lib/tracks";
import { listProjects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";
import Timeline from "@/components/Timeline";
import CopyableCode from "@/components/CopyableCode";

export function generateStaticParams() {
  return TRACKS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const track = getTrack(slug);
  if (!track) return {};

  const title = `${track.project} — Coding Jam Track ${trackLabel(track.number)}`;
  const description = `${track.tagline} · ${track.mmv.split(".")[0]}.`;
  const image = track.youtubeId
    ? `https://i.ytimg.com/vi/${track.youtubeId}/maxresdefault.jpg`
    : "/og-default.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: image, width: 1280, height: 720, alt: `${track.project} demo` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

// Track pages include a "builds shipped from this track" section that reads
// from Firestore. Rendering at request time means new submissions show up
// without a redeploy — and the build no longer needs Firestore read access.
export const dynamic = "force-dynamic";

export default async function TrackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const track = getTrack(slug);
  if (!track) notFound();

  const c = colorClasses[track.color];
  const allProjects = await listProjects();
  const trackProjects = allProjects.filter((p) => p.trackNumber === track.number).slice(0, 6);

  // "Try another track" picks: deterministic, never includes the current one.
  const others = TRACKS.filter((t) => t.slug !== track.slug);
  const idx = TRACKS.findIndex((t) => t.slug === track.slug);
  const suggestions = [others[(idx + 1) % others.length], others[(idx + 3) % others.length]];

  return (
    <>
      {/* Hero */}
      <section className={`relative overflow-hidden ${c.bg} text-white`}>
        <div className="absolute inset-0 dotted-bg opacity-20" />
        <div className="container-page relative py-16 sm:py-24">
          <Link href="/#lineup" className="inline-flex items-center gap-1.5 text-white/80 text-sm hover:text-white">
            ← Back to the lineup
          </Link>
          <div className="mt-6 flex items-start justify-between flex-wrap gap-4">
            <div className="max-w-2xl">
              <div className="text-xs font-mono font-semibold tracking-[0.2em] uppercase opacity-90">
                Track {trackLabel(track.number)}
              </div>
              <h1 className="h-display text-5xl sm:text-6xl mt-3 leading-[1.05]">{track.project}</h1>
              <p className="mt-4 text-lg text-white/90">{track.tagline}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {track.dropIn && (
                  <span className="chip bg-white/20 text-white backdrop-blur-sm">✅ Drop-in friendly</span>
                )}
                <span className="chip bg-white/20 text-white backdrop-blur-sm">2-hour jam</span>
                <span className="chip bg-white/20 text-white backdrop-blur-sm">Ships in 45 min</span>
              </div>
            </div>
            <div className="text-[120px] sm:text-[160px] leading-none drop-shadow-lg">{track.emoji}</div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <a href={track.codelabUrl} target="_blank" rel="noreferrer" className="btn bg-white text-ink hover:shadow-pop">
              Open the Codelab ↗
            </a>
            <a href={track.starterRepo} target="_blank" rel="noreferrer" className="btn border border-white/40 text-white hover:bg-white/10">
              Starter repo
            </a>
            <a href={track.videoUrl} className="btn border border-white/40 text-white hover:bg-white/10">
              Demo video
            </a>
            <Link href="/submit" className="btn border border-white/40 text-white hover:bg-white/10">
              Share your build →
            </Link>
          </div>
        </div>
      </section>

      <div className="container-page py-16 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Demo — shown first: video sells the track in 3 seconds */}
          <section>
            <div className="section-eyebrow">The demo</div>
            <h2 className="h-display text-2xl mt-2">What it looks like when it&rsquo;s working</h2>
            <div className="mt-5">
              {track.youtubeId ? (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-line shadow-lift">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${track.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${track.youtubeId}&controls=0&disablekb=1&modestbranding=1&rel=0&playsinline=1`}
                    title={`${track.project} demo`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  />
                </div>
              ) : track.screenshotUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={track.screenshotUrl}
                  alt={`${track.project} demo`}
                  className="w-full rounded-2xl border border-line shadow-lift"
                />
              ) : (
                <div
                  className={`relative w-full aspect-[16/9] rounded-2xl border-2 border-dashed ${c.border}/40 ${c.bgSoft} overflow-hidden flex items-center justify-center`}
                >
                  <div className="absolute inset-0 dotted-bg opacity-40" />
                  <div
                    className="absolute right-4 bottom-2 sm:right-8 sm:bottom-4 text-[140px] sm:text-[200px] leading-none select-none opacity-15"
                    aria-hidden
                  >
                    {track.emoji}
                  </div>
                  <div className="relative text-center px-6">
                    <div className={`section-eyebrow ${c.text}`}>Demo video goes here</div>
                    <p className="font-display font-semibold text-ink mt-2 text-lg">
                      Demo of <span className={c.text}>{track.project}</span>
                    </p>
                    <p className="text-xs text-ash mt-2 max-w-sm mx-auto">
                      Drop the 11-char YouTube ID into <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-line text-[11px]">youtubeId</code> on this track in <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-line text-[11px]">lib/tracks.ts</code>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* What you'll build — text follows the visual */}
          <section>
            <div className="section-eyebrow">In the room · 45 minutes</div>
            <h3 className="h-display text-2xl mt-2">What you&rsquo;ll build</h3>
            <p className="text-ink mt-4 leading-relaxed text-lg">{track.mmv}</p>
          </section>

          {/* The moment it clicks */}
          <section className={`card p-6 ${c.bgSoft} border-0 ring-1 ${c.ring}/30`}>
            <div className={`section-eyebrow ${c.text}`}>The moment it clicks</div>
            <p className="mt-2 text-ink text-xl font-display italic leading-snug">
              &ldquo;{track.aha}&rdquo;
            </p>
          </section>

          {/* Things to think about while you build */}
          <section>
            <div className="section-eyebrow">Things to think about</div>
            <h3 className="h-display text-2xl mt-2">While you build</h3>
            <ul className="mt-5 space-y-3">
              {track.thinkAbout.map((w) => (
                <li key={w} className="flex gap-3">
                  <span className={`mt-2 h-1.5 w-1.5 rounded-full shrink-0 ${c.bg}`} />
                  <span className="text-ink">{w}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* The 2-hour rhythm — KEEP */}
          <section>
            <div className="section-eyebrow">The 2-hour Jam rhythm</div>
            <h3 className="h-display text-2xl mt-2">How the night flows</h3>
            <p className="text-sm text-ash mt-1 max-w-xl">
              Every Coding Jam follows the same five-phase shape. Talking is short, building is long.
            </p>
            <div className="mt-6">
              <Timeline />
            </div>
          </section>

          {/* Polished version */}
          <section>
            <div className="section-eyebrow">Polished version pulls in</div>
            <h3 className="h-display text-2xl mt-2">Where to take it after the jam</h3>
            <p className="text-sm text-ash mt-1 max-w-xl">
              The 45-minute build is the win in the room. These are the ideas you can pull in over the next week —
              your homework isn&rsquo;t homework, it&rsquo;s the polished version.
            </p>
            <ul className="mt-5 grid sm:grid-cols-2 gap-2">
              {track.polished.map((p) => (
                <li key={p} className="flex gap-2 items-start text-sm">
                  <span className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${c.bg}`} />
                  <span className="text-ink">{p}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* If stuck */}
          {track.ifStuck.length > 0 && (
            <section className="card p-5 bg-cloud/40">
              <div className="section-eyebrow">If you get stuck</div>
              <p className="text-sm text-ash mt-2">
                Open one of these in the starter — safety nets, not requirements.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {track.ifStuck.map((f) => (
                  <li key={f}>
                    <code className="chip bg-white border border-line text-ink font-mono text-xs">{f}</code>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Community builds */}
          {trackProjects.length > 0 && (
            <section>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="section-eyebrow">From the community</div>
                  <h3 className="h-display text-2xl mt-1">Builds shipped from this track</h3>
                </div>
                <Link href={`/showcase?track=${track.number}`} className="text-sm text-gblue hover:underline">
                  All builds from this track →
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {trackProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 self-start">
          <div className="card p-6">
            <div className="section-eyebrow">Tech you&rsquo;ll touch</div>
            <ul className="mt-4 space-y-2">
              {CODING_JAM_STACK.map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-ash" />
                  <span className="text-ink">{t}</span>
                </li>
              ))}
              <li className="text-xs font-mono uppercase tracking-widest text-ash pt-3 pb-1">
                This track adds
              </li>
              {track.tech.map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm">
                  <span className={`h-1.5 w-1.5 rounded-full ${c.bg}`} />
                  <span className="text-ink">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <div className="section-eyebrow">Run it yourself</div>
            <p className="text-xs text-ash mt-2">After the jam, on your own machine.</p>
            <CopyableCode
              code={`git clone https://github.com/gca-americas/coding-jam
cd coding-jam/${track.starterRepo.split("/").pop() ?? track.slug}
# follow the codelab for Antigravity
# setup + .env`}
            />
          </div>

          <div className="card p-6">
            <div className="section-eyebrow">Quick links</div>
            <div className="mt-4 space-y-2">
              <a
                href={track.codelabUrl}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-between rounded-lg ${c.bgSoft} ${c.text} px-3 py-2 text-sm font-semibold hover:brightness-95 transition`}
              >
                <span className="flex items-center gap-2">
                  <span>📘</span> Codelab
                </span>
                <span>↗</span>
              </a>
              <a href={track.starterRepo} target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm font-medium text-ink hover:text-gblue px-3 py-1.5">
                Starter repo <span>↗</span>
              </a>
              <a href={track.videoUrl} className="flex items-center justify-between text-sm font-medium text-ink hover:text-gblue px-3 py-1.5">
                Demo video <span>→</span>
              </a>
            </div>
          </div>

          <div className="card p-6 bg-cloud/50">
            <div className="text-xs uppercase tracking-widest font-semibold text-ash">Drop-in?</div>
            <p className="text-sm text-ink mt-2 leading-relaxed">
              First time here? You&rsquo;re in the right place. Every track is independent — you&rsquo;re not behind.
              Open the Codelab and you&rsquo;ll ship a real app today.
            </p>
          </div>

          <Link href="/submit" className="btn-google w-full">
            Share your build →
          </Link>
        </aside>
      </div>

      {/* Try another track */}
      <section className="container-page pb-20">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="section-eyebrow">Pick another track</div>
            <h3 className="h-display text-2xl mt-1">All independent — start anywhere.</h3>
          </div>
          <Link href="/#lineup" className="text-sm text-gblue hover:underline">See full lineup →</Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {suggestions.map((s) => {
            const sc = colorClasses[s.color];
            return (
              <Link key={s.slug} href={`/tracks/${s.slug}`} className="card card-hover p-5 flex items-center gap-4">
                <div className={`shrink-0 h-12 w-12 rounded-xl ${sc.bg} text-white flex items-center justify-center font-display font-bold text-lg`}>
                  {trackLabel(s.number)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-mono uppercase tracking-widest text-ash">Track {trackLabel(s.number)}</div>
                  <div className="font-display font-semibold text-ink mt-0.5">{s.project}</div>
                  <div className="text-sm text-ash truncate">{s.tagline}</div>
                </div>
                <span className={`shrink-0 text-sm font-medium ${sc.text}`}>Open →</span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
