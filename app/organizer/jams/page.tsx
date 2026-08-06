import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admins";
import { canManageJams } from "@/lib/organizers";
import { listJams, listJamsByOrganizer, type Jam } from "@/lib/jams";
import { jamSubmissionCounts, listProjects } from "@/lib/projects";
import { topicView } from "@/lib/topic";
import NotAnOrganizer from "./NotAnOrganizer";

export const dynamic = "force-dynamic";

const STATUS_CHIP: Record<Jam["status"], string> = {
  draft: "bg-cloud text-ash ring-1 ring-line",
  published: "bg-ggreen/10 text-ggreen ring-1 ring-ggreen/30",
  archived: "bg-gyellow/15 text-yellow-700 ring-1 ring-gyellow/40",
};

export default async function MyJamsPage() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) redirect("/");
  if (!(await canManageJams(email))) return <NotAnOrganizer />;

  const admin = await isAdmin(email);
  // Admins see every jam here — this doubles as the moderation surface.
  const [jams, projects] = await Promise.all([
    admin ? listJams() : listJamsByOrganizer(email),
    listProjects(),
  ]);
  const counts = jamSubmissionCounts(projects);
  const totalBuilds = jams.reduce((n, j) => n + (counts.get(j.slug) ?? 0), 0);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 diag-bg" />
        <div className="container-page relative py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-gblue" /> Organizer console
          </div>
          <h1 className="h-display text-4xl sm:text-5xl mt-4 leading-[1.05]">Your jams.</h1>
          <p className="mt-4 text-ash max-w-2xl">
            Each jam is one event with one topic. Pick a built-in track, point at your own materials,
            write a topic from scratch, or leave it open — then share the link with your room.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/organizer/jams/new" className="btn-google">Create a jam</Link>
            <Link href="/organizer" className="btn-ghost">The organizer kit</Link>
          </div>
          {jams.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-8">
              <Stat n={jams.length} label={jams.length === 1 ? "jam" : "jams"} />
              <Stat n={jams.filter((j) => j.status === "published").length} label="published" />
              <Stat n={totalBuilds} label="builds shipped" />
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-8 pb-24">
        {jams.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="text-4xl">🎪</div>
            <h2 className="font-display font-bold text-xl text-ink mt-3">No jams yet.</h2>
            <p className="text-ash mt-2 max-w-md mx-auto">
              Create your first one and you&rsquo;ll get a shareable page with the topic, the schedule,
              and a submission link for everything your room ships.
            </p>
            <Link href="/organizer/jams/new" className="btn-google mt-6 inline-block">Create a jam</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {jams.map((jam) => {
              const view = topicView(jam.topic);
              const mine = jam.organizerEmail === email;
              return (
                <div key={jam.slug} className="card p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`chip text-[10px] ${STATUS_CHIP[jam.status]}`}>{jam.status}</span>
                    <span className="text-2xl leading-none">{view.emoji}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-ink mt-3 leading-snug">{jam.title}</h3>
                  <p className="text-sm text-ash mt-1">
                    {view.title}
                    {view.kind === "track" && <span className="text-ash/70"> · built-in track</span>}
                  </p>
                  <div className="text-xs text-ash mt-3 space-y-0.5">
                    <div>{jam.chapter} · {jam.country}</div>
                    {jam.eventDate && <div className="tabular-nums">{jam.eventDate}</div>}
                    {admin && !mine && <div className="text-gblue">by {jam.organizerName}</div>}
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="font-display font-bold text-2xl text-ink tabular-nums">
                      {counts.get(jam.slug) ?? 0}
                    </span>
                    <span className="text-xs text-ash">
                      build{(counts.get(jam.slug) ?? 0) === 1 ? "" : "s"} shipped
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-line flex items-center gap-3 text-sm">
                    <Link href={`/organizer/jams/${jam.slug}/edit`} className="text-gblue hover:underline font-medium">
                      Edit
                    </Link>
                    <Link href={`/jam/${jam.slug}`} className="text-ash hover:text-ink">
                      {jam.status === "published" ? "View" : "Preview"}
                    </Link>
                    {/* Most jams are a series — the next one is last week's with
                        a new date, so copying beats retyping the topic. */}
                    <Link
                      href={`/organizer/jams/new?from=${encodeURIComponent(jam.slug)}`}
                      className="text-ash hover:text-ink whitespace-nowrap"
                      title={`Start a new jam pre-filled from "${jam.title}"`}
                    >
                      Run again
                    </Link>
                    <span className="ml-auto font-mono text-[11px] text-ash/70 truncate">/jam/{jam.slug}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div className="font-display font-bold text-3xl text-ink tabular-nums">{n}</div>
      <div className="text-xs text-ash mt-0.5">{label}</div>
    </div>
  );
}
