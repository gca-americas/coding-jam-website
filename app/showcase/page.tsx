import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import ChapterBoard from "@/components/ChapterBoard";
import CountryBoard from "@/components/CountryBoard";
import { listProjects, chapterStats, countryStats, jamOptions } from "@/lib/projects";
import { TRACKS, trackLabel } from "@/lib/tracks";
import ShowcaseFilters from "./ShowcaseFilters";
import Pagination from "@/components/Pagination";
import { getCopy, getT } from "@/lib/i18n";
import { localizeTracks } from "@/lib/i18n/tracks";

type SP = {
  track?: string;
  chapter?: string;
  /** Slug of the jam a build was submitted through. */
  jam?: string;
  page?: string;
  /** Build-name search. */
  q?: string;
  /** Submitted on or after / on or before, YYYY-MM-DD. */
  from?: string;
  to?: string;
};

const PAGE_SIZE = 12;

/** Ignore anything that isn't a real calendar date rather than filtering on junk. */
function cleanDate(v: string | undefined): string {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return "";
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v ? v : "";
}

export default async function ShowcasePage({ searchParams }: { searchParams: Promise<SP> }) {
  const t = await getT();
  const filterCopy = await getCopy(["sc."]);
  const sp = await searchParams;
  const all = await listProjects();
  const stats = chapterStats(all);
  // Always computed from the full set, so the dashboard doesn't change when a
  // track/chapter filter narrows the project grid below it.
  const countries = countryStats(all);

  let projects = all;
  const trackFilter = sp.track ? parseInt(sp.track, 10) : null;
  const chapterFilter = sp.chapter ?? null;
  const jamFilter = sp.jam ?? null;
  const nameQuery = (sp.q ?? "").trim();
  const fromDate = cleanDate(sp.from);
  const toDate = cleanDate(sp.to);

  if (trackFilter) projects = projects.filter((p) => p.trackNumber === trackFilter);
  if (chapterFilter) projects = projects.filter((p) => p.chapter === chapterFilter);
  if (jamFilter) projects = projects.filter((p) => p.jamSlug === jamFilter);
  if (nameQuery) {
    const needle = nameQuery.toLowerCase();
    projects = projects.filter((p) => p.projectName.toLowerCase().includes(needle));
  }
  // submittedAt is ISO 8601, so its first 10 chars compare as calendar dates.
  if (fromDate) projects = projects.filter((p) => p.submittedAt.slice(0, 10) >= fromDate);
  if (toDate) projects = projects.filter((p) => p.submittedAt.slice(0, 10) <= toDate);

  const anyFilter = Boolean(trackFilter || chapterFilter || jamFilter || nameQuery || fromDate || toDate);
  const jams = jamOptions(all);
  const activeJam = jamFilter ? jams.find((j) => j.slug === jamFilter) : null;

  const total = projects.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const requestedPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const page = Math.min(requestedPage, totalPages);
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageProjects = projects.slice(pageStart, pageStart + PAGE_SIZE);

  const activeTrack = trackFilter
    ? (await localizeTracks(TRACKS)).find((tr) => tr.number === trackFilter)
    : null;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 diag-bg" />
        <div className="container-page relative py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-gyellow" /> {t("sc.eyebrow")}
          </div>
          <h1 className="h-display text-5xl sm:text-6xl mt-6 max-w-3xl leading-[1.05]">
            {t("sc.title.a")} <span className="gradient-text">{t("sc.title.b")}</span>
          </h1>
          <p className="mt-5 text-lg text-ash max-w-2xl">
            {t("sc.lede")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/submit" className="btn-google">{t("sc.cta.share")}</Link>
            <Link href="/showcase" className="btn-ghost">{t("sc.cta.all")}</Link>
          </div>
        </div>
      </section>

      <section className="container-page py-12 grid lg:grid-cols-5 gap-10 items-start">
        <aside className="lg:col-span-2 space-y-6 lg:sticky lg:top-24">
          <ShowcaseFilters
            copy={filterCopy}
            chapters={stats.map((c) => ({ chapter: c.chapter, count: c.count }))}
            jams={jams}
            initial={{
              q: nameQuery,
              chapter: chapterFilter ?? "",
              jam: jamFilter ?? "",
              from: fromDate,
              to: toDate,
            }}
            track={sp.track}
            resultCount={projects.length}
          />
          <ChapterBoard stats={stats.slice(0, 12)} />
          <CountryBoard stats={countries} limit={10} />
        </aside>

        <div className="lg:col-span-3">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <div className="section-eyebrow">
                {[
                  activeTrack ? activeTrack.name : null,
                  chapterFilter,
                  activeJam ? activeJam.title : jamFilter,
                  nameQuery ? `“${nameQuery}”` : null,
                  fromDate || toDate
                    ? `${fromDate || t("sc.range.start")} → ${toDate || t("sc.range.today")}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || t("sc.allBuilds")}
              </div>
              <h2 className="h-display text-2xl mt-1">
                {total === 0
                  ? t("sc.noProjects")
                  : total <= PAGE_SIZE
                    ? t(total === 1 ? "sc.countOne" : "sc.countMany").replace("{n}", String(total))
                    : t("jams.showing")
                        .replace("{start}", String(pageStart + 1))
                        .replace("{end}", String(Math.min(pageStart + PAGE_SIZE, total)))
                        .replace("{total}", String(total))}
              </h2>
            </div>
            {anyFilter && (
              <Link href="/showcase" className="text-sm text-gblue hover:underline">
                {t("sc.clearFiltersArrow")}
              </Link>
            )}
          </div>

          {pageProjects.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-3xl">{anyFilter ? "🔍" : "🎤"}</div>
              <h3 className="font-display font-semibold text-ink mt-3">
                {anyFilter ? t("sc.empty.filtered") : t("sc.empty.none")}
              </h3>
              <p className="text-sm text-ash mt-2">
                {anyFilter ? t("sc.empty.filteredBody") : t("sc.empty.noneBody")}
              </p>
              {anyFilter ? (
                <Link href="/showcase" className="btn-ghost mt-4 inline-flex">{t("sc.clearFilters")}</Link>
              ) : (
                <Link href="/submit" className="btn-google mt-4 inline-flex">{t("sc.cta.share")}</Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-5">
                {pageProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                href={(n) => pageHref(n, sp)}
                label={t("sc.pagination")}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}

/** Builds a showcase URL for a page, carrying every active filter. */
function pageHref(page: number, sp: SP): string {
  const params = new URLSearchParams();
  if (sp.track) params.set("track", String(sp.track));
  if (sp.chapter) params.set("chapter", String(sp.chapter));
  if (sp.jam) params.set("jam", String(sp.jam));
  if (sp.q) params.set("q", String(sp.q));
  if (sp.from) params.set("from", String(sp.from));
  if (sp.to) params.set("to", String(sp.to));
  if (page > 1) params.set("page", String(page));
  const q = params.toString();
  return q ? `/showcase?${q}` : "/showcase";
}
