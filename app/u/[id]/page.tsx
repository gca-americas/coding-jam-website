import { notFound } from "next/navigation";
import ProjectCard from "@/components/ProjectCard";
import BadgeCard from "@/components/BadgeCard";
import { badgesFor, type EarnedBadge } from "@/lib/badges";
import { listProjectsByProfileId, toPublic } from "@/lib/projects";

export const dynamic = "force-dynamic";

const BAR_BG: Record<EarnedBadge["color"], string> = {
  gblue: "bg-gblue",
  gred: "bg-gred",
  gyellow: "bg-gyellow",
  ggreen: "bg-ggreen",
};

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || !/^[a-f0-9]{12}$/i.test(id)) notFound();

  const projects = await listProjectsByProfileId(id);
  if (projects.length === 0) notFound();

  // Borrow identity (name + avatar) from any project they're the submitter of.
  // If they're only credited as a collaborator, use the first build's metadata
  // we have, but blank the name (we don't know their canonical name).
  const ownBuild = projects.find((p) => p.submitterProfileId === id);
  const builderName = ownBuild?.builderName ?? "A builder";
  const builderImage = ownBuild?.builderImage;

  const count = projects.length;
  const badges = badgesFor(count);
  const currentTier = [...badges].reverse().find((b) => b.earned);
  const nextBadge = badges.find((b) => !b.earned);
  const previousThreshold = currentTier?.threshold ?? 0;
  const progressPct = nextBadge
    ? Math.max(
        0,
        Math.min(100, Math.round(((count - previousThreshold) / (nextBadge.threshold - previousThreshold)) * 100)),
      )
    : 100;
  const buildsToNext = nextBadge ? nextBadge.remaining : 0;
  const tierLabel = currentTier ? currentTier.label.replace(/^Coding Jam /, "") : "—";
  const nextLabel = nextBadge ? nextBadge.label.replace(/^Coding Jam /, "") : null;
  const barColor = nextBadge ? BAR_BG[nextBadge.color] : BAR_BG[currentTier?.color ?? "gblue"];
  const publicProjects = projects.map(toPublic);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 diag-bg" />
        <div className="container-page relative py-14 sm:py-16">
          <div className="flex items-center gap-5">
            {builderImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={builderImage}
                alt={builderName}
                referrerPolicy="no-referrer"
                className="h-16 w-16 rounded-full ring-4 ring-white shadow-soft"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-white border border-line flex items-center justify-center font-display font-bold text-2xl text-ink shadow-soft">
                {builderName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-gblue" /> Builder profile
              </div>
              <h1 className="h-display text-4xl sm:text-5xl mt-3 leading-[1.05]">{builderName}</h1>
            </div>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-2xl">
            <Stat n={count} label={count === 1 ? "build shipped" : "builds shipped"} />
            <div className="card p-5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-ash">Current tier</div>
                  <div className="font-display font-bold text-2xl text-ink mt-0.5 truncate">{tierLabel}</div>
                </div>
                {nextLabel && (
                  <div className="text-[11px] text-ash shrink-0">→ {nextLabel}</div>
                )}
              </div>
              <div className="mt-3 h-2 rounded-full bg-cloud overflow-hidden">
                <div className={`h-full ${barColor} transition-all`} style={{ width: `${progressPct}%` }} />
              </div>
              <div className="text-[11px] text-ash mt-2">
                {nextBadge
                  ? `${buildsToNext} ${buildsToNext === 1 ? "build" : "builds"} to unlock`
                  : "All badges earned ★"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="section-eyebrow">Badges</div>
        <h2 className="font-display font-bold text-2xl text-ink mt-1">
          What they&rsquo;ve earned so far.
        </h2>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {badges.map((b) => (
            <BadgeCard key={b.id} badge={b} totalSubmissions={count} hideClaim />
          ))}
        </div>
      </section>

      <section className="container-page py-10 pb-20">
        <div className="section-eyebrow">Their builds</div>
        <h2 className="font-display font-bold text-2xl text-ink mt-1">
          {count === 1 ? "1 build on the board." : `${count} builds on the board.`}
        </h2>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {publicProjects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>
    </>
  );
}

function Stat({ n, label }: { n: number | string; label: string }) {
  return (
    <div className="card p-5">
      <div className="font-display font-bold text-3xl text-ink tabular-nums">{n}</div>
      <div className="text-xs text-ash mt-1">{label}</div>
    </div>
  );
}
