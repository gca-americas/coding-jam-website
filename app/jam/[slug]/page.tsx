import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admins";
import { canEditJam, getJam } from "@/lib/jams";
import { topicView, LINK_FIELDS } from "@/lib/topic";
import { colorClasses, trackLabel } from "@/lib/tracks";
import { listProjects } from "@/lib/projects";
import Timeline from "@/components/Timeline";
import ProjectCard from "@/components/ProjectCard";
import TopicBody from "@/components/TopicBody";

// Jam content changes whenever an organizer saves, and drafts are visible only
// to their owner — both rule out static rendering.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const jam = await getJam(slug);
  if (!jam) return {};
  const view = topicView(jam.topic);
  const description = `${view.tagline} · Led by ${jam.organizerName}, ${jam.chapter}.`;
  return {
    title: `${jam.title} — Coding Jam`,
    description,
    // A draft is shared by link with a few people; it should never be indexed.
    robots: jam.status === "published" ? undefined : { index: false, follow: false },
    openGraph: { title: jam.title, description, type: "website" },
  };
}

export default async function JamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const jam = await getJam(slug);
  if (!jam) notFound();

  // Unpublished jams are visible to their owner (and admins) as a preview.
  // To anyone else they don't exist.
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  const editable = canEditJam(jam, email, email ? await isAdmin(email) : false);
  if (jam.status !== "published" && !editable) notFound();

  const view = topicView(jam.topic);
  const c = colorClasses[view.color];
  const links = LINK_FIELDS.map((f) => ({ ...f, url: view.links[f.key] })).filter((l) => l.url);

  const builds = (await listProjects()).filter((p) => p.jamSlug === jam.slug);

  return (
    <>
      {editable && jam.status !== "published" && (
        <div className="bg-gyellow/15 border-b border-gyellow/40">
          <div className="container-page py-3 flex items-center justify-between gap-4 flex-wrap text-sm">
            <span className="text-ink">
              <b>Preview.</b> This jam is {jam.status} — only you can see this page.
            </span>
            <Link href={`/organizer/jams/${jam.slug}/edit`} className="text-gblue hover:underline font-medium">
              Edit and publish →
            </Link>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className={`relative overflow-hidden ${c.bg} text-white`}>
        <div className="absolute inset-0 dotted-bg opacity-20" />
        <div className="container-page relative py-16 sm:py-20">
          <div className="text-xs font-mono font-semibold tracking-[0.2em] uppercase opacity-90">
            {jam.chapter} · {jam.country}
          </div>
          <h1 className="h-display text-4xl sm:text-6xl mt-3 leading-[1.05] max-w-3xl">{jam.title}</h1>

          <div className="mt-8 rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-6 max-w-2xl">
            <div className="text-xs uppercase tracking-widest opacity-80">This week you&rsquo;re building</div>
            <div className="flex items-start gap-3 mt-2">
              <span className="text-3xl leading-none">{view.emoji}</span>
              <div>
                <div className="font-display font-bold text-2xl">{view.title}</div>
                <p className="opacity-90 mt-1">{view.tagline}</p>
              </div>
            </div>
            {view.track && (
              <Link
                href={`/tracks/${view.track.slug}`}
                className="inline-block mt-4 text-sm underline underline-offset-4 opacity-90 hover:opacity-100"
              >
                Full brief for Track {trackLabel(view.track.number)} →
              </Link>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {jam.rsvpUrl && (
              <a href={jam.rsvpUrl} target="_blank" rel="noreferrer" className="btn bg-white text-ink hover:shadow-pop">
                RSVP
              </a>
            )}
            <Link
              href={`/submit?jam=${encodeURIComponent(jam.slug)}`}
              className="btn border border-white/30 text-white hover:bg-white/10"
            >
              Share what you built
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-14 grid lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-10">
          <TopicBody view={view} />

          <div>
            <div className="section-eyebrow">The shape of the session</div>
            <h2 className="h-display text-2xl mt-2 mb-5">Two hours, four movements.</h2>
            <Timeline />
          </div>

          <div>
            <div className="flex items-end justify-between flex-wrap gap-3">
              <div>
                <div className="section-eyebrow">Shipped from this jam</div>
                <h2 className="h-display text-2xl mt-2">
                  {builds.length === 0
                    ? "Nothing yet."
                    : `${builds.length} build${builds.length === 1 ? "" : "s"}.`}
                </h2>
              </div>
              <Link
                href={`/submit?jam=${encodeURIComponent(jam.slug)}`}
                className="text-sm text-gblue hover:underline"
              >
                Add yours →
              </Link>
            </div>
            {builds.length === 0 ? (
              <p className="text-ash mt-3">
                Builds submitted through this page show up here, credited to {jam.organizerName}.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5 mt-5">
                {builds.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          <div className="card p-6">
            <div className="section-eyebrow">The details</div>
            <dl className="mt-4 space-y-3 text-sm">
              <Detail
                label="Lead"
                value={jam.organizerName}
                sub={jam.organizerIsGde ? "Google Developer Expert" : undefined}
              />
              <Detail label="Chapter" value={`${jam.chapter} · ${jam.country}`} />
              {jam.eventDate && <Detail label="Date" value={formatDate(jam.eventDate)} />}
              {jam.locationNote && <Detail label="Where" value={jam.locationNote} />}
            </dl>
            {jam.rsvpUrl && (
              <a href={jam.rsvpUrl} target="_blank" rel="noreferrer" className="btn-google w-full mt-5 text-center block">
                RSVP for this jam
              </a>
            )}
          </div>

          {view.track?.programDetails && (
            <>
              <div className="card p-6">
                <div className="section-eyebrow">Scoring at a glance</div>
                <div className="mt-3 space-y-2.5 text-sm">
                  {view.track.programDetails.rubric.map((r) => (
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
            </>
          )}

          {links.length > 0 && (
            <div className="card p-6">
              <div className="section-eyebrow">What you&rsquo;ll need</div>
              <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                  <li key={l.key}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-gblue hover:underline font-medium"
                    >
                      {l.label} ↗
                    </a>
                    <p className="text-xs text-ash mt-0.5">{l.hint}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {view.tech.length > 0 && (
            <div className="card p-6">
              <div className="section-eyebrow">What you&rsquo;ll touch</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {view.tech.map((t) => (
                  <span key={t} className={`chip ${c.chip}`}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}

function Detail({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-ash">{label}</dt>
      <dd className="text-ink font-medium">
        {value}
        {sub && <div className="text-xs text-gblue font-medium mt-0.5">{sub}</div>}
      </dd>
    </div>
  );
}

/** UTC so the date an organizer picked is the date everyone sees. */
function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}
