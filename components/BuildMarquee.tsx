import Link from "next/link";
import type { PublicProject } from "@/lib/projects";
import { organizerCredit } from "@/lib/attribution";
import { TRACKS, colorClasses } from "@/lib/tracks";

/**
 * Infinite horizontal marquee of community builds.
 *
 * Same CSS trick as DemoMarquee — translateX 0 → -50% over a 2× duplicated
 * row, paused on hover — but deliberately NOT a client component: there's no
 * state here, so the whole thing ships as HTML and CSS with no JS.
 *
 * Each card links to the builder's profile rather than opening a modal. A
 * screenshot isn't a video; the useful next step is seeing the build in
 * context with its demo and repo links.
 */

/** Below this the row is too narrow to fill a wide viewport, so it repeats. */
const MIN_CARDS = 10;
/** Seconds of travel per card, so speed feels the same at any count. */
const SECONDS_PER_CARD = 2.6;

export default function BuildMarquee({ projects }: { projects: PublicProject[] }) {
  if (projects.length === 0) return null;

  const repeats = Math.max(1, Math.ceil(MIN_CARDS / projects.length));
  const row = Array.from({ length: repeats }).flatMap(() => projects);
  const duration = Math.round(row.length * SECONDS_PER_CARD);

  return (
    <>
      <style>{`
        @keyframes build-marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .build-marquee-track {
          animation: build-marquee-scroll ${duration}s linear infinite;
        }
        .build-marquee-track:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .build-marquee-track { animation: none; }
        }
      `}</style>

      <div className="relative overflow-hidden">
        {/* Edge fade-out masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="build-marquee-track flex gap-5 w-max py-2">
          {[...row, ...row].map((p, i) => (
            <BuildCard key={`${p.id}-${i}`} project={p} />
          ))}
        </div>
      </div>
    </>
  );
}

function BuildCard({ project }: { project: PublicProject }) {
  const track = TRACKS.find((t) => t.number === project.trackNumber);
  const c = track ? colorClasses[track.color] : colorClasses.blue;
  // Submissions from before profile ids existed have nowhere personal to point,
  // so fall back to the showcase pre-filtered to that build rather than dumping
  // the visitor into the full list.
  const href = project.submitterProfileId
    ? `/u/${project.submitterProfileId}`
    : `/showcase?q=${encodeURIComponent(project.projectName)}`;
  const label = project.topicLabel ?? track?.project ?? "Built their own";

  return (
    <Link
      href={href}
      className="group relative w-72 sm:w-80 shrink-0 rounded-2xl overflow-hidden bg-white border border-line shadow-soft hover:shadow-lift transition-all hover:-translate-y-1 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gblue/40"
    >
      <div className={`relative aspect-video bg-gradient-to-br ${c.gradient}`}>
        {project.screenshotUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={project.screenshotUrl}
            alt={project.projectName}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0 dotted-bg opacity-30" />
            <div className="absolute right-4 bottom-3 text-6xl opacity-30">{track?.emoji ?? "🛠️"}</div>
          </>
        )}
      </div>

      <div className="p-4 text-left">
        <div className={`text-[11px] font-mono font-semibold tracking-widest uppercase truncate ${c.text}`}>
          {label}
        </div>
        <div className="font-display font-bold text-lg mt-1 leading-tight text-ink truncate">
          {project.projectName}
        </div>
        <div className="text-xs text-ash mt-1 truncate">
          {project.builderName} · {project.chapter}
        </div>
        {project.jamSlug && (
          <div className="text-[11px] text-ash/80 mt-0.5 truncate">
            {project.jamTitle} · led by {organizerCredit(project)}
          </div>
        )}
      </div>
      <div className={`h-1 ${c.bg}`} />
    </Link>
  );
}
