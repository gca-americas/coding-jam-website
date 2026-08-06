import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admins";
import { getOrganizer } from "@/lib/organizers";
import { listJamsByOrganizer, type Jam } from "@/lib/jams";
import { jamSubmissionCounts, listProjectsRaw } from "@/lib/projects";
import { topicView } from "@/lib/topic";

export const dynamic = "force-dynamic";

const STATUS_CHIP: Record<Jam["status"], string> = {
  draft: "bg-cloud text-ash ring-1 ring-line",
  published: "bg-ggreen/10 text-ggreen ring-1 ring-ggreen/30",
  archived: "bg-gyellow/15 text-yellow-700 ring-1 ring-gyellow/40",
};

export default async function OrganizerDetailPage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const session = await auth();
  const callerEmail = session?.user?.email?.toLowerCase();
  if (!callerEmail) redirect("/");
  if (!(await isAdmin(callerEmail))) notFound();

  const { email: raw } = await params;
  const email = decodeURIComponent(raw).trim().toLowerCase();
  const organizer = await getOrganizer(email);
  if (!organizer) notFound();

  const [jams, allProjects] = await Promise.all([listJamsByOrganizer(email), listProjectsRaw()]);
  const counts = jamSubmissionCounts(allProjects);

  // Attributed off the project's own organizerEmail rather than by joining
  // through the jam list, so builds from a deleted jam still show up here.
  const builds = allProjects
    .filter((p) => p.organizerEmail === email)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

  const published = jams.filter((j) => j.status === "published").length;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 diag-bg" />
        <div className="container-page relative py-12">
          <Link href="/admin" className="text-sm text-ash hover:text-ink">← Admin dashboard</Link>
          <h1 className="h-display text-4xl mt-3 leading-[1.05]">{organizer.displayName}</h1>
          {organizer.isGde && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gblue/10 text-gblue text-xs font-medium ring-1 ring-gblue/20">
              Google Developer Expert
            </div>
          )}
          <p className="mt-2 text-sm text-ash">
            {organizer.email} · {organizer.chapter} · {organizer.country}
          </p>
          <p className="mt-1 text-xs text-ash">
            Added {organizer.addedAt.slice(0, 10)} by {organizer.addedBy}
          </p>
        </div>
      </section>

      <section className="container-page py-6 grid grid-cols-3 gap-4">
        <Stat n={jams.length} label="jams created" />
        <Stat n={published} label="published" />
        <Stat n={builds.length} label="builds attributed" />
      </section>

      <section className="container-page py-6">
        <div className="card p-6">
          <div className="section-eyebrow">Their jams</div>
          <h2 className="font-display font-bold text-xl text-ink mt-1">
            {jams.length === 0 ? "No jams yet." : "All jams"}
          </h2>
          {jams.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-widest text-ash border-b border-line">
                  <tr>
                    <th className="py-2 font-semibold">Jam</th>
                    <th className="py-2 font-semibold">Topic</th>
                    <th className="py-2 font-semibold">Status</th>
                    <th className="py-2 font-semibold">Date</th>
                    <th className="py-2 font-semibold text-right">Builds</th>
                  </tr>
                </thead>
                <tbody>
                  {jams.map((j) => {
                    const view = topicView(j.topic);
                    return (
                      <tr key={j.slug} className="border-b border-line/60">
                        <td className="py-2 font-medium">
                          <Link href={`/jam/${j.slug}`} className="text-gblue hover:underline">
                            {j.title}
                          </Link>
                          <div className="font-mono text-[11px] text-ash/70">/jam/{j.slug}</div>
                        </td>
                        <td className="py-2 text-ink">
                          {view.emoji} {view.title}
                          <div className="text-[11px] text-ash">
                            {view.kind === "track" ? "built-in track" : view.kind}
                          </div>
                        </td>
                        <td className="py-2">
                          <span className={`chip text-[10px] ${STATUS_CHIP[j.status]}`}>{j.status}</span>
                        </td>
                        <td className="py-2 text-ash tabular-nums">{j.eventDate ?? "—"}</td>
                        <td className="py-2 text-right tabular-nums font-semibold text-ink">
                          {counts.get(j.slug) ?? 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-6 pb-20">
        <div className="card p-6">
          <div className="section-eyebrow">Builds from their jams</div>
          <h2 className="font-display font-bold text-xl text-ink mt-1">
            {builds.length === 0 ? "Nothing submitted yet." : `${builds.length} total`}
          </h2>
          {builds.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-widest text-ash border-b border-line">
                  <tr>
                    <th className="py-2 font-semibold">Project</th>
                    <th className="py-2 font-semibold">Builder</th>
                    <th className="py-2 font-semibold">Jam</th>
                    <th className="py-2 font-semibold">Chapter</th>
                    <th className="py-2 font-semibold">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {builds.map((p) => (
                    <tr key={p.id} className="border-b border-line/60">
                      <td className="py-2 font-medium text-ink truncate">{p.projectName}</td>
                      <td className="py-2 text-ash truncate">{p.builderName}</td>
                      <td className="py-2 text-ash truncate">{p.jamTitle ?? p.jamSlug ?? "—"}</td>
                      <td className="py-2 text-ink">{p.chapter}</td>
                      <td className="py-2 text-ash tabular-nums">{p.submittedAt.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="card p-5">
      <div className="font-display font-bold text-3xl text-ink tabular-nums">{n}</div>
      <div className="text-xs text-ash mt-1">{label}</div>
    </div>
  );
}
