import type { Metadata } from "next";
import Link from "next/link";
import { getCopy, getT } from "@/lib/i18n";
import { localizeTopicView } from "@/lib/i18n/tracks";
import { G_COLORS, topicView, type TopicView } from "@/lib/topic";
import { listPublishedJams } from "@/lib/jams";
import { jamSubmissionCounts, listProjects } from "@/lib/projects";
import JamCard from "@/components/JamCard";
import JamsFilters from "./JamsFilters";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

function randomPermutation<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type SP = { q?: string; country?: string; chapter?: string; from?: string; to?: string; page?: string };

/** Jams per page. Matches the showcase so both grids behave the same way. */
const PAGE_SIZE = 12;

/** Ignore anything that isn't a real calendar date rather than filtering on junk. */
function cleanDate(v: string | undefined): string {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return "";
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v ? v : "";
}

/** Counts for a dropdown, built from every published jam so options never vanish mid-filter. */
function tally(values: string[]): Array<{ name: string; count: number }> {
  const m = new Map<string, number>();
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
  return [...m.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("meta.jams.title"), description: t("meta.jams.desc") };
}

export default async function JamsDirectoryPage({ searchParams }: { searchParams: Promise<SP> }) {
  const t = await getT();
  const cardCopy = await getCopy(["card."]);
  const sp = await searchParams;
  const [all, projects] = await Promise.all([listPublishedJams(), listProjects()]);
  const counts = jamSubmissionCounts(projects);

  const query = (sp.q ?? "").trim().toLowerCase();
  const country = sp.country ?? "";
  const chapter = sp.chapter ?? "";
  const from = cleanDate(sp.from);
  const to = cleanDate(sp.to);
  const filtering = Boolean(query || country || chapter || from || to);

  const jams = all.filter((j) => {
    if (country && j.country !== country) return false;
    if (chapter && j.chapter !== chapter) return false;
    // An undated jam can't satisfy a range, so a date filter hides it rather
    // than quietly letting it through.
    if ((from || to) && !j.eventDate) return false;
    if (from && j.eventDate! < from) return false;
    if (to && j.eventDate! > to) return false;
    if (query) {
      const haystack = `${j.title} ${topicView(j.topic).title}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  // Upcoming first (soonest at the top), then everything without a date, then
  // past events newest-first. listPublishedJams already sorts newest-first, so
  // this only needs to lift the future ones out.
  const today = new Date().toISOString().slice(0, 10);
  const ordered = [
    ...jams.filter((j) => j.eventDate && j.eventDate >= today).reverse(),
    ...jams.filter((j) => !j.eventDate || j.eventDate < today),
  ];

  // Paginate the single ordered list, then split the current page back into its
  // two groups. Grouping first and paginating each separately would leave short
  // pages wherever a group ended.
  const total = ordered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const requestedPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const page = Math.min(requestedPage, totalPages);
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageJams = ordered.slice(pageStart, pageStart + PAGE_SIZE);

  const upcoming = pageJams.filter((j) => j.eventDate && j.eventDate >= today);
  const rest = pageJams.filter((j) => !j.eventDate || j.eventDate < today);

  const palette = randomPermutation(G_COLORS);
  const views: Record<string, TopicView> = {};
  for (let i = 0; i < pageJams.length; i++) {
    const jam = pageJams[i];
    const view = await localizeTopicView(topicView(jam.topic));
    view.color = palette[i % palette.length];
    views[jam.slug] = view;
  }

  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", String(sp.q));
    if (country) params.set("country", country);
    if (chapter) params.set("chapter", chapter);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (n > 1) params.set("page", String(n));
    const q = params.toString();
    return q ? `/jams?${q}` : "/jams";
  };

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dotted-bg opacity-50" />
        <div className="container-page relative py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-ggreen" /> {t("jams.page.eyebrow")}
          </div>
          <h1 className="h-display text-5xl sm:text-6xl mt-6 max-w-3xl leading-[1.05]">
            {t("jams.page.title")}
          </h1>
          <p className="mt-5 text-lg text-ash max-w-2xl">
            {t("jams.page.lede")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/organizer" className="btn-google">{t("jams.page.runOne")}</Link>
            <Link href="/organizer#track-notes" className="btn-ghost">{t("jams.page.seeTracks")}</Link>
          </div>
        </div>
      </section>

      <section className="container-page pt-10">
        <JamsFilters
          countries={tally(all.map((j) => j.country))}
          chapters={tally(all.map((j) => j.chapter))}
          initial={{ q: sp.q ?? "", country, chapter, from, to }}
          resultCount={jams.length}
        />
      </section>

      <section className="container-page py-10 pb-24">
        {jams.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl">{filtering ? "🔍" : "🎪"}</div>
            <h2 className="font-display font-bold text-xl text-ink mt-3">
              {filtering ? t("jams.empty.filtered") : t("jams.empty.none")}
            </h2>
            <p className="text-ash mt-2 max-w-md mx-auto">
              {filtering ? t("jams.empty.filteredBody") : t("jams.empty.noneBody")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              {filtering ? (
                <Link href="/jams" className="btn-google">{t("jams.page.clear")}</Link>
              ) : (
                <>
                  <Link href="/organizer" className="btn-google">{t("jams.page.kit")}</Link>
                  <Link href="/organizer" className="btn-ghost">{t("jams.page.become")}</Link>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm text-ash mb-6">
              {total <= PAGE_SIZE
                ? t(total === 1 ? "jams.countOne" : "jams.countMany").replace("{n}", String(total))
                : t("jams.showing")
                    .replace("{start}", String(pageStart + 1))
                    .replace("{end}", String(Math.min(pageStart + PAGE_SIZE, total)))
                    .replace("{total}", String(total))}
            </div>
            <div className="space-y-12">
              {upcoming.length > 0 && (
                <JamGroup
                  title={t("jams.group.comingUp")}
                  jams={upcoming}
                  counts={counts}
                  views={views}
                  copy={cardCopy}
                />
              )}
              {rest.length > 0 && (
                <JamGroup
                  title={upcoming.length > 0 ? t("jams.group.rest") : t("jams.group.all")}
                  jams={rest}
                  counts={counts}
                  views={views}
                  copy={cardCopy}
                />
              )}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              href={pageHref}
              label={t("jams.pagination")}
            />
          </>
        )}
      </section>
    </>
  );
}

function JamGroup({
  title,
  jams,
  counts,
  views,
  copy,
}: {
  title: string;
  jams: Awaited<ReturnType<typeof listPublishedJams>>;
  counts: Map<string, number>;
  views: Record<string, TopicView>;
  copy: Record<string, string>;
}) {
  return (
    <div>
      <div className="section-eyebrow">{title}</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
        {jams.map((jam) => (
          <JamCard
            key={jam.slug}
            jam={jam}
            builds={counts.get(jam.slug) ?? 0}
            view={views[jam.slug]}
            copy={copy}
          />
        ))}
      </div>
    </div>
  );
}
