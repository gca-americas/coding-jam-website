import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import ChapterBoard from "@/components/ChapterBoard";
import { listProjects, chapterStats } from "@/lib/projects";
import { TRACKS, colorClasses, trackLabel } from "@/lib/tracks";

type SP = { track?: string; chapter?: string; page?: string };

const PAGE_SIZE = 12;

export default async function ShowcasePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const all = await listProjects();
  const stats = chapterStats(all);

  let projects = all;
  const trackFilter = sp.track ? parseInt(sp.track, 10) : null;
  const chapterFilter = sp.chapter ?? null;

  if (trackFilter) projects = projects.filter((p) => p.trackNumber === trackFilter);
  if (chapterFilter) projects = projects.filter((p) => p.chapter === chapterFilter);

  const total = projects.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const requestedPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const page = Math.min(requestedPage, totalPages);
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageProjects = projects.slice(pageStart, pageStart + PAGE_SIZE);

  const activeTrack = trackFilter ? TRACKS.find((t) => t.number === trackFilter) : null;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 diag-bg" />
        <div className="container-page relative py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-gyellow" /> Community showcase
          </div>
          <h1 className="h-display text-5xl sm:text-6xl mt-6 max-w-3xl leading-[1.05]">
            What the rooms <span className="gradient-text">shipped.</span>
          </h1>
          <p className="mt-5 text-lg text-ash max-w-2xl">
            Real builds from real GDG chapters. Two hours, one pizza, one prototype. Filter by track or chapter — or
            scroll until something makes you want to fork it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/submit" className="btn-google">Share your build →</Link>
            <Link href="/showcase" className="btn-ghost">All builds</Link>
          </div>
        </div>
      </section>

      <section className="container-page py-12 grid lg:grid-cols-5 gap-10 items-start">
        <aside className="lg:col-span-2 space-y-6 lg:sticky lg:top-24">
          <ChapterBoard stats={stats.slice(0, 12)} />
          <div className="card p-6">
            <div className="section-eyebrow">Filter by track</div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <FilterLink href="/showcase" label="All tracks" active={!trackFilter && !chapterFilter} />
              {TRACKS.map((t) => (
                <FilterLink
                  key={t.slug}
                  href={`/showcase?track=${t.number}`}
                  label={`T${trackLabel(t.number)} · ${t.project}`}
                  active={trackFilter === t.number}
                  color={colorClasses[t.color].text}
                  dot={colorClasses[t.color].bg}
                />
              ))}
            </div>
          </div>

          {chapterFilter && (
            <div className="card p-4 bg-cloud/40">
              <div className="text-xs text-ash">Filtering by chapter</div>
              <div className="font-medium text-ink mt-1">{chapterFilter}</div>
              <Link href="/showcase" className="text-xs text-gblue hover:underline mt-2 inline-block">
                Clear filter →
              </Link>
            </div>
          )}
        </aside>

        <div className="lg:col-span-3">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <div className="section-eyebrow">
                {activeTrack ? `Track ${trackLabel(activeTrack.number)} · ${activeTrack.project}` :
                 chapterFilter ? chapterFilter : "All builds"}
              </div>
              <h2 className="h-display text-2xl mt-1">
                {total === 0
                  ? "No projects"
                  : total <= PAGE_SIZE
                    ? `${total} ${total === 1 ? "project" : "projects"}`
                    : `Showing ${pageStart + 1}–${Math.min(pageStart + PAGE_SIZE, total)} of ${total}`}
              </h2>
            </div>
            {(trackFilter || chapterFilter) && (
              <Link href="/showcase" className="text-sm text-gblue hover:underline">
                ← Clear filters
              </Link>
            )}
          </div>

          {pageProjects.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-3xl">🎤</div>
              <h3 className="font-display font-semibold text-ink mt-3">No builds here yet</h3>
              <p className="text-sm text-ash mt-2">Be the first to ship one — your GDG could go on the hero board.</p>
              <Link href="/submit" className="btn-google mt-4 inline-flex">Share your build →</Link>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-5">
                {pageProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} sp={sp} />
            </>
          )}
        </div>
      </section>
    </>
  );
}

function FilterLink({
  href, label, active, color, dot,
}: { href: string; label: string; active?: boolean; color?: string; dot?: string }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
        active ? "bg-ink text-white border-ink" : "bg-white text-ink border-line hover:bg-cloud"
      }`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      <span className={color && !active ? color : ""}>{label}</span>
    </Link>
  );
}

/* ----- Pagination ---------------------------------------------------- */

function pageHref(page: number, sp: SP): string {
  const params = new URLSearchParams();
  if (sp.track) params.set("track", String(sp.track));
  if (sp.chapter) params.set("chapter", String(sp.chapter));
  if (page > 1) params.set("page", String(page));
  const q = params.toString();
  return q ? `/showcase?${q}` : "/showcase";
}

/** Returns a compact list of page numbers with '…' gaps for large totals. */
function pageList(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) out.push("…");
  }
  return out;
}

function Pagination({ page, totalPages, sp }: { page: number; totalPages: number; sp: SP }) {
  if (totalPages <= 1) return null;
  const items = pageList(page, totalPages);
  const prevDisabled = page === 1;
  const nextDisabled = page === totalPages;

  return (
    <nav
      aria-label="Showcase pagination"
      className="mt-10 flex items-center justify-between gap-3 flex-wrap"
    >
      <PageButton href={pageHref(page - 1, sp)} disabled={prevDisabled}>
        ← Previous
      </PageButton>

      <ol className="flex items-center gap-1">
        {items.map((it, i) =>
          it === "…" ? (
            <li key={`gap-${i}`} className="px-2 text-ash text-sm select-none">
              …
            </li>
          ) : (
            <li key={it}>
              <Link
                href={pageHref(it, sp)}
                aria-current={it === page ? "page" : undefined}
                className={`min-w-9 h-9 px-3 inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  it === page
                    ? "bg-ink text-white"
                    : "text-ink hover:bg-cloud border border-line"
                }`}
              >
                {it}
              </Link>
            </li>
          ),
        )}
      </ol>

      <PageButton href={pageHref(page + 1, sp)} disabled={nextDisabled}>
        Next →
      </PageButton>
    </nav>
  );
}

function PageButton({
  href, disabled, children,
}: { href: string; disabled?: boolean; children: React.ReactNode }) {
  if (disabled) {
    return (
      <span className="btn border border-line bg-cloud/50 text-ash/60 cursor-not-allowed select-none !px-4 !py-2 text-sm">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className="btn-ghost !px-4 !py-2 text-sm">
      {children}
    </Link>
  );
}
