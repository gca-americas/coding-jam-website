import Link from "next/link";
import { auth } from "@/auth";
import SignInGate from "@/app/submit/SignInGate";
import ProjectCard from "@/components/ProjectCard";
import BadgeCard from "@/components/BadgeCard";
import OwnerProjectCard from "./OwnerProjectCard";
import { badgesFor, type EarnedBadge } from "@/lib/badges";
import { listProjectsByEmail, toPublic } from "@/lib/projects";
import { emailToProfileId } from "@/lib/profile";

export const dynamic = "force-dynamic";

const BAR_BG: Record<EarnedBadge["color"], string> = {
  gblue: "bg-gblue",
  gred: "bg-gred",
  gyellow: "bg-gyellow",
  ggreen: "bg-ggreen",
};

export default async function MePage() {
  const session = await auth();
  const user = session?.user;
  const signedIn = Boolean(user?.email);

  if (!signedIn || !user?.email) {
    return (
      <section className="container-page py-16">
        <SignInGate />
      </section>
    );
  }

  const profileId = emailToProfileId(user.email);
  const projects = await listProjectsByEmail(user.email);
  const count = projects.length;
  const lowerEmail = user.email.toLowerCase();
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

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 diag-bg" />
        <div className="container-page relative py-14 sm:py-16">
          <div className="flex items-center gap-5">
            {user.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={user.image}
                alt={user.name ?? ""}
                referrerPolicy="no-referrer"
                className="h-16 w-16 rounded-full ring-4 ring-white shadow-soft"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-white border border-line flex items-center justify-center font-display font-bold text-2xl text-ink shadow-soft">
                {(user.name ?? "?").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-gblue" /> Your builder profile
              </div>
              <h1 className="h-display text-4xl sm:text-5xl mt-3 leading-[1.05]">
                {user.name ?? "Builder"}
              </h1>
              <Link
                href={`/u/${profileId}`}
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-gblue hover:underline"
                title="Public profile — share this link with anyone."
              >
                Share your public profile →
              </Link>
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
          Collect them as you ship.
        </h2>
        <p className="text-sm text-ash mt-2 max-w-2xl">
          Every build counts — including ones where you&rsquo;re credited as a collaborator. Each
          milestone unlocks a Google badge you can claim and add to your profile.
        </p>
        <p className="text-sm text-ash mt-2 max-w-2xl">
          The badges you earn here also show up on your{" "}
          <a
            href="https://me.developers.google.com/u/me"
            target="_blank"
            rel="noreferrer"
            className="text-gblue hover:underline font-medium"
          >
            Google Developer Program profile
          </a>
          {" "}— same Google account you signed in with.
        </p>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {badges.map((b) => (
            <BadgeCard key={b.id} badge={b} totalSubmissions={count} />
          ))}
        </div>
      </section>

      <section className="container-page py-10 pb-20">
        <div className="section-eyebrow">Your builds</div>
        <h2 className="font-display font-bold text-2xl text-ink mt-1">
          {count === 0 ? "Nothing on the board yet." : count === 1 ? "Your first build." : `All ${count} of them.`}
        </h2>
        {count === 0 ? (
          <div className="card p-8 mt-6 text-center">
            <p className="text-ash">Ship your first jam build to unlock your Builder badge.</p>
            <Link href="/submit" className="btn-google mt-5 inline-flex">
              Share your build →
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => {
              // Owner controls only on builds I actually submitted, not ones
              // I'm only credited on as a collaborator.
              const isMine = p.submittedByEmail?.toLowerCase() === lowerEmail;
              const pub = toPublic(p);
              return isMine ? (
                <OwnerProjectCard key={p.id} project={pub} />
              ) : (
                <ProjectCard key={p.id} project={pub} />
              );
            })}
          </div>
        )}
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
