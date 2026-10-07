import type { Metadata } from "next";
import Link from "next/link";
import { getCopy, getLocale, getT } from "@/lib/i18n";
import { localizeTopicView } from "@/lib/i18n/tracks";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admins";
import { canEditJam, getJam, isPastDeadline } from "@/lib/jams";
import { topicView, LINK_FIELDS } from "@/lib/topic";
import { colorClasses, trackLabel } from "@/lib/tracks";
import { listProjects } from "@/lib/projects";
import Timeline from "@/components/Timeline";
import ProjectCard from "@/components/ProjectCard";
import TopicBody from "@/components/TopicBody";
import ToolPicker from "@/app/ToolPicker";

// Jam content changes whenever an organizer saves, and drafts are visible only
// to their owner — both rule out static rendering.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const t = await getT();
  const { slug } = await params;
  const jam = await getJam(slug);
  if (!jam) return {};
  const view = await localizeTopicView(topicView(jam.topic));
  const description = `${view.tagline} · ${t("card.ledBy").replace("{name}", jam.organizerName)}, ${jam.chapter}.`;
  return {
    title: t("meta.jam.title").replace("{title}", jam.title),
    description,
    // A draft is shared by link with a few people; it should never be indexed.
    robots: jam.status === "published" ? undefined : { index: false, follow: false },
    openGraph: { title: jam.title, description, type: "website" },
  };
}

export default async function JamPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getT();
  const locale = await getLocale();
  const timelineCopy = await getCopy(["tl."]);
  const pickerCopy = await getCopy(["tools."]);
  const { slug } = await params;
  const jam = await getJam(slug);
  if (!jam) notFound();

  // Unpublished jams are visible to their owner (and admins) as a preview.
  // To anyone else they don't exist.
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  const editable = canEditJam(jam, email, email ? await isAdmin(email) : false);
  if (jam.status !== "published" && !editable) notFound();

  const view = await localizeTopicView(topicView(jam.topic));
  const c = colorClasses[view.color];
  const links = LINK_FIELDS.map((f) => ({ ...f, url: view.links[f.key] })).filter((l) => l.url);

  const builds = (await listProjects()).filter((p) => p.jamSlug === jam.slug);

  /* Before the event, RSVP is the thing to do; after it, submitting is. An
     undated jam is treated as open for submissions, since there is no date to
     say otherwise. Only the emphasis changes — both actions stay on the page. */
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = Boolean(jam.eventDate && jam.eventDate > today);
  const closed = isPastDeadline(jam);
  const submitHref = `/submit?jam=${encodeURIComponent(jam.slug)}`;

  return (
    <>
      {editable && jam.status !== "published" && (
        <div className="bg-gyellow/15 border-b border-gyellow/40">
          <div className="container-page py-3 flex items-center justify-between gap-4 flex-wrap text-sm">
            <span className="text-ink">
              <b>{t("jam.preview.label")}</b>{" "}
              {t("jam.preview.body").replace("{status}", t(`myjams.status.${jam.status}`))}
            </span>
            <Link href={`/organizer/jams/${jam.slug}/edit`} className="text-gblue hover:underline font-medium">
              {t("jam.preview.edit")}
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
            <div className="text-xs uppercase tracking-widest opacity-80">{t("jam.thisWeek")}</div>
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
                {t("jam.fullBrief").replace("{name}", view.track.name)}
              </Link>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {closed ? (
              <span className="btn bg-white/15 border border-white/30 text-white/80 cursor-not-allowed text-base">
                {t("jam.detail.closed")}
              </span>
            ) : (
              <Link
                href={submitHref}
                className={
                  upcoming
                    ? "btn border border-white/40 text-white hover:bg-white/10 text-base"
                    : "btn bg-white text-ink hover:shadow-pop text-base sm:text-lg !px-7 !py-4 font-semibold shadow-lift"
                }
              >
                {t("jam.shareBuilt")} <span aria-hidden="true">→</span>
              </Link>
            )}
            {jam.rsvpUrl && (
              <a
                href={jam.rsvpUrl}
                target="_blank"
                rel="noreferrer"
                className={
                  upcoming
                    ? "btn bg-white text-ink hover:shadow-pop text-base sm:text-lg !px-7 !py-4 font-semibold shadow-lift"
                    : "btn border border-white/40 text-white hover:bg-white/10 text-base"
                }
              >
                {t("jam.rsvp")}
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="container-page py-14 grid lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-10">
          <TopicBody view={view} />

          {/* Before the schedule: the tool has to be working before the session
              starts, so answering "which one?" is the first thing to do after
              reading what the room is building. */}
          <ToolPicker copy={pickerCopy} />

          <div>
            <div className="section-eyebrow">{t("jam.shape.eyebrow")}</div>
            <h2 className="h-display text-2xl mt-2 mb-5">{t("about.rhythm.title")}</h2>
            <Timeline copy={timelineCopy} />
          </div>

          <div>
            <div className="flex items-end justify-between flex-wrap gap-3">
              <div>
                <div className="section-eyebrow">{t("jam.shipped.eyebrow")}</div>
                <h2 className="h-display text-2xl mt-2">
                  {builds.length === 0
                    ? t("jam.shipped.none")
                    : t(builds.length === 1 ? "jam.shipped.one" : "jam.shipped.many").replace("{n}", String(builds.length))}
                </h2>
              </div>
              {closed ? (
                <span className="text-sm font-medium text-ash">{t("jam.detail.closed")}</span>
              ) : (
                <Link href={submitHref} className="btn-google shrink-0">
                  {t("jam.shipped.add")}
                </Link>
              )}
            </div>
            {builds.length === 0 ? (
              <p className="text-ash mt-3">
                {t("jam.shipped.emptyBody").replace("{name}", jam.organizerName)}
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5 mt-5">
                {builds.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}

            {/* Scrolling past everyone else's work is the moment you decide to
                add your own, so the ask lands there rather than only at the top
                of a page this long. */}
            {closed ? (
              <div className="mt-8 rounded-2xl bg-cloud border border-line text-ink p-7 sm:p-9">
                <h3 className="h-display text-2xl leading-tight">
                  {t("jam.submit.closedTitle")}
                </h3>
                <p className="mt-2 text-ash max-w-lg">
                  {t("jam.submit.closedBody").replace(
                    "{date}",
                    jam.deadline ? formatDate(jam.deadline, locale) : "",
                  )}
                </p>
              </div>
            ) : (
              <div className={`mt-8 rounded-2xl ${c.bg} text-white p-7 sm:p-9 flex flex-col sm:flex-row sm:items-center gap-6`}>
                <div className="min-w-0 flex-1">
                  <h3 className="h-display text-2xl sm:text-3xl leading-tight">
                    {t("jam.submit.title")}
                  </h3>
                  <p className="mt-2 text-white/90 max-w-lg">
                    {t("jam.submit.body")}
                  </p>
                </div>
                <Link
                  href={submitHref}
                  className="btn bg-white text-ink hover:shadow-pop shrink-0 text-base sm:text-lg !px-7 !py-4 font-semibold"
                >
                  {t("jam.shareBuilt")} <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          <div className="card p-6">
            <div className="section-eyebrow">{t("jam.details")}</div>
            <dl className="mt-4 space-y-3 text-sm">
              <Detail
                label={t("jam.detail.lead")}
                value={jam.organizerName}
                sub={jam.organizerIsGde ? t("card.gde") : undefined}
              />
              <Detail label={t("jam.detail.chapter")} value={`${jam.chapter} · ${jam.country}`} />
              {jam.eventDate && <Detail label={t("jam.detail.date")} value={formatDate(jam.eventDate, locale)} />}
              {jam.deadline && (
                <Detail
                  label={t("jam.detail.deadline")}
                  value={formatDate(jam.deadline, locale)}
                  sub={closed ? t("jam.detail.closed") : t("jam.detail.untilEndOfDay")}
                />
              )}
              {jam.locationNote && <Detail label={t("jam.detail.where")} value={jam.locationNote} />}
            </dl>
            {closed ? (
              <div className="btn w-full mt-5 text-center block bg-cloud text-ash border border-line cursor-not-allowed font-medium">
                {t("jam.detail.closed")}
              </div>
            ) : (
              <Link
                href={submitHref}
                className={`btn w-full mt-5 text-center block ${c.bg} text-white hover:brightness-110 font-semibold`}
              >
                {t("jam.shareBuilt")} <span aria-hidden="true">→</span>
              </Link>
            )}
            {jam.rsvpUrl && (
              <a
                href={jam.rsvpUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost w-full mt-2 text-center block"
              >
                {t("jam.rsvpFull")}
              </a>
            )}
          </div>

          {links.length > 0 && (
            <div className="card p-6">
              <div className="section-eyebrow">{t("jam.need")}</div>
              <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                  <li key={l.key}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-gblue hover:underline font-medium"
                    >
                      {t(`link.${l.key}.label`)} ↗
                    </a>
                    <p className="text-xs text-ash mt-0.5">{t(`link.${l.key}.hint`)}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {view.tech.length > 0 && (
            <div className="card p-6">
              <div className="section-eyebrow">{t("jam.touch")}</div>
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
function formatDate(iso: string, locale: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString(locale, {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}
