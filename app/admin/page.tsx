import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin, listAdmins } from "@/lib/admins";
import { listOrganizers } from "@/lib/organizers";
import { listJams, type Jam } from "@/lib/jams";
import { listProjectsRaw, organizerCredit } from "@/lib/projects";
import { topicView } from "@/lib/topic";
import { trackLabel } from "@/lib/tracks";
import { listBlocked } from "@/lib/blocklist";
import AdminsManager from "./AdminsManager";
import OrganizersManager, { type OrganizerTotals } from "./OrganizersManager";
import AdminDateRange from "./AdminDateRange";
import AdminJamsTable, { type AdminJamRow } from "./AdminJamsTable";
import AdminSubmissionsTable, {
  type AdminSubmissionRow,
  type JamOption,
} from "./AdminSubmissionsTable";
import BlocklistManager from "./BlocklistManager";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "jams", label: "Jams" },
  { id: "submissions", label: "Submissions" },
  { id: "builders", label: "Builders" },
  { id: "chapters", label: "Chapters" },
  { id: "organizers", label: "Organizers" },
  { id: "admins", label: "Admins" },
  { id: "blocklist", label: "Blocklist" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type SP = { tab?: string; from?: string; to?: string };

/** Ignore anything that isn't a real calendar date rather than filtering on junk. */
function cleanDate(v: string | undefined): string {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return "";
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v ? v : "";
}

const STATUS_CHIP: Record<Jam["status"], string> = {
  draft: "bg-cloud text-ash ring-1 ring-line",
  published: "bg-ggreen/10 text-ggreen ring-1 ring-ggreen/30",
  archived: "bg-gyellow/15 text-yellow-700 ring-1 ring-gyellow/40",
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<SP> }) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) redirect("/");
  if (!(await isAdmin(email))) notFound();

  const sp = await searchParams;
  const tab: TabId = (TABS.find((t) => t.id === sp.tab)?.id ?? "overview") as TabId;
  const from = cleanDate(sp.from);
  const to = cleanDate(sp.to);

  const [allProjects, admins, organizers, jams, blocked] = await Promise.all([
    listProjectsRaw(),
    listAdmins(),
    listOrganizers(),
    listJams(),
    listBlocked(),
  ]);

  // Every number below is derived from this window. submittedAt is ISO 8601, so
  // its first 10 chars compare as calendar dates.
  const projects = allProjects.filter((p) => {
    const day = p.submittedAt.slice(0, 10);
    if (from && day < from) return false;
    if (to && day > to) return false;
    return true;
  });
  const ranged = Boolean(from || to);

  // Submissions per jam, inside the window. Keyed off the project's stored
  // jamSlug so builds from a deleted jam still count somewhere.
  const jamCounts = new Map<string, number>();
  for (const p of projects) {
    if (!p.jamSlug) continue;
    jamCounts.set(p.jamSlug, (jamCounts.get(p.jamSlug) ?? 0) + 1);
  }
  const jamRows = [...jams]
    .map((j) => ({ jam: j, count: jamCounts.get(j.slug) ?? 0 }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        (b.jam.eventDate ?? "").localeCompare(a.jam.eventDate ?? ""),
    );
  const jamAttributed = [...jamCounts.values()].reduce((n, c) => n + c, 0);

  // Per-organizer rollup: jams they run, and builds submitted through them.
  const organizerTotals: OrganizerTotals = {};
  for (const o of organizers) organizerTotals[o.email] = { jams: 0, builds: 0 };
  for (const j of jams) {
    const row = (organizerTotals[j.organizerEmail] ??= { jams: 0, builds: 0 });
    row.jams += 1;
  }
  for (const p of projects) {
    if (!p.organizerEmail) continue;
    const row = (organizerTotals[p.organizerEmail] ??= { jams: 0, builds: 0 });
    row.builds += 1;
  }

  // ─── Derived from the (windowed) projects list ─────────────────────────────
  const builders = new Map<
    string,
    { email: string; name: string; image?: string; chapter: string; country: string; count: number; latest: string; profileId?: string }
  >();
  for (const p of projects) {
    if (!p.submittedByEmail) continue;
    const key = p.submittedByEmail.toLowerCase();
    const cur = builders.get(key);
    if (cur) {
      cur.count += 1;
      if (p.submittedAt > cur.latest) cur.latest = p.submittedAt;
    } else {
      builders.set(key, {
        email: key,
        name: p.builderName,
        image: p.builderImage,
        chapter: p.chapter,
        country: p.country,
        count: 1,
        latest: p.submittedAt,
        profileId: p.submitterProfileId,
      });
    }
  }
  const builderRows = [...builders.values()].sort((a, b) => b.count - a.count);

  const chapterCounts = new Map<string, { chapter: string; country: string; count: number }>();
  for (const p of projects) {
    const key = `${p.chapter.toLowerCase()}__${p.country.toLowerCase()}`;
    const cur = chapterCounts.get(key);
    if (cur) cur.count += 1;
    else chapterCounts.set(key, { chapter: p.chapter, country: p.country, count: 1 });
  }
  const chapters = [...chapterCounts.values()].sort((a, b) => b.count - a.count);

  const countryCounts = new Map<string, number>();
  for (const p of projects) countryCounts.set(p.country, (countryCounts.get(p.country) ?? 0) + 1);
  const countries = [...countryCounts.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  // Build count per jam, plus an NA row for everything submitted outside one.
  const jamChart: Array<{ key: string; label: string; count: number; na?: boolean }> = jams
    .map((j) => ({ key: j.slug, label: j.title, count: jamCounts.get(j.slug) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "en"));
  jamChart.push({
    key: "__na__",
    label: "NA — not from a jam",
    count: projects.length - jamAttributed,
    na: true,
  });
  const maxJamCount = Math.max(1, ...jamChart.map((j) => j.count));

  // 8-week submission histogram, weeks bucketed ending today. Always all-time —
  // a trend line that respects the range would just be a flat crop of itself.
  const now = new Date();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const weekBuckets: { label: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const end = new Date(now.getTime() - i * weekMs);
    const start = new Date(end.getTime() - weekMs);
    const count = allProjects.filter((p) => {
      const t = new Date(p.submittedAt).getTime();
      return t >= start.getTime() && t < end.getTime();
    }).length;
    weekBuckets.push({ label: end.toISOString().slice(5, 10), count });
  }
  const maxWeekCount = Math.max(1, ...weekBuckets.map((w) => w.count));

  const recent = [...projects].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)).slice(0, 50);

  // Shaped for the client tables — only the fields they render, so nothing extra
  // crosses into the browser payload.
  const jamTableRows: AdminJamRow[] = jamRows.map(({ jam, count }) => {
    const view = topicView(jam.topic);
    return {
      slug: jam.slug,
      title: jam.title,
      chapter: jam.chapter,
      country: jam.country,
      organizerName: jam.organizerName,
      status: jam.status,
      eventDate: jam.eventDate,
      topicTitle: view.title,
      topicEmoji: view.emoji,
      submissions: count,
    };
  });

  const submissionRows: AdminSubmissionRow[] = recent.map((p) => ({
    id: p.id,
    projectName: p.projectName,
    builderName: p.builderName,
    // Admin-only surface; the API re-checks admin on every action anyway.
    builderEmail: p.submittedByEmail,
    chapter: p.chapter,
    trackLabel: `T${trackLabel(p.trackNumber)}`,
    jamSlug: p.jamSlug,
    jamTitle: p.jamTitle,
    organizerName: p.organizerName,
    submittedAt: p.submittedAt,
  }));

  /* Reassignment targets. Published only, newest first — the API refuses a
     draft or archived jam, so offering one would only produce an error. */
  const jamOptions: JamOption[] = jams
    .filter((j) => j.status === "published")
    .map((j) => ({
      slug: j.slug,
      title: j.title,
      chapter: j.chapter,
      eventDate: j.eventDate,
    }));

  const href = (t: TabId) => {
    const p = new URLSearchParams();
    if (t !== "overview") p.set("tab", t);
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    const q = p.toString();
    return q ? `/admin?${q}` : "/admin";
  };

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 diag-bg" />
        <div className="container-page relative py-12 sm:py-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-gred" /> Admin dashboard
          </div>
          <h1 className="h-display text-3xl sm:text-4xl mt-3 leading-[1.05]">Coding Jams · operations</h1>
          <p className="mt-3 text-sm text-ash">
            Signed in as <span className="font-medium text-ink">{email}</span>.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-line sticky top-16 bg-white/90 backdrop-blur z-30">
        <nav className="container-page flex gap-1 overflow-x-auto" aria-label="Admin sections">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={href(t.id)}
              aria-current={t.id === tab ? "page" : undefined}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                t.id === tab
                  ? "border-ink text-ink"
                  : "border-transparent text-ash hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Range control — applies to every tab */}
      <section className="container-page pt-6">
        <AdminDateRange tab={tab} from={from} to={to} />
      </section>

      {/* Quick dashboard — always visible, so the headline numbers survive a tab switch */}
      <section className="container-page py-6 grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Stat n={projects.length} label={ranged ? "submissions in range" : "submissions"} />
        <Stat n={jams.length} label="jams" />
        <Stat n={chapters.length} label="GDG chapters" />
        <Stat n={countries.length} label="countries" />
        <Stat n={builders.size} label="builders" />
        <Stat n={organizers.length} label="organizers" />
      </section>

      {tab === "overview" && (
        <section className="container-page pb-20 grid lg:grid-cols-2 gap-5">
          <div className="card p-6">
            <div className="section-eyebrow">Submissions over time</div>
            <h3 className="font-display font-bold text-xl text-ink mt-1">Last 8 weeks</h3>
            <p className="text-xs text-ash mt-1">All time — not affected by the range above.</p>
            <div className="mt-5 flex items-end gap-2 h-40">
              {weekBuckets.map((w) => (
                <div key={w.label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs font-semibold text-ink tabular-nums">{w.count || ""}</div>
                  <div
                    className="w-full rounded-t bg-gblue/70"
                    style={{ height: `${(w.count / maxWeekCount) * 100}%`, minHeight: w.count ? 4 : 0 }}
                    title={`${w.count} submissions in week ending ${w.label}`}
                  />
                  <div className="text-[10px] text-ash tabular-nums">{w.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <div className="section-eyebrow">Jams</div>
            <h3 className="font-display font-bold text-xl text-ink mt-1">Build count per jam</h3>
            <p className="text-xs text-ash mt-1">
              {ranged ? "Within the selected range." : "All time."} Builds submitted outside a jam
              are grouped as NA.
            </p>
            <ul className="mt-5 space-y-2 max-h-80 overflow-y-auto">
              {jamChart.map((j) => (
                <li key={j.key} className="flex items-center gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs gap-3">
                      <span className={`truncate ${j.na ? "text-ash" : "text-ink"}`}>{j.label}</span>
                      <span className="text-ash tabular-nums shrink-0">{j.count}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-cloud overflow-hidden">
                      <div
                        className={`h-full ${j.na ? "bg-line" : "bg-ggreen/70"}`}
                        style={{ width: `${(j.count / maxJamCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {tab === "jams" && (
        <section className="container-page pb-20">
          <AdminJamsTable rows={jamTableRows} attributed={jamAttributed} total={projects.length} ranged={ranged} />
        </section>
      )}

      {tab === "submissions" && (
        <section className="container-page pb-20">
          <AdminSubmissionsTable
            rows={submissionRows}
            total={projects.length}
            ranged={ranged}
            blockedEmails={blocked.map((b) => b.email)}
            jams={jamOptions}
          />
        </section>
      )}

      {tab === "builders" && (
        <section className="container-page pb-20">
          <div className="card p-6">
            <div className="flex items-end justify-between flex-wrap gap-3">
              <div>
                <div className="section-eyebrow">Builders</div>
                <h3 className="font-display font-bold text-xl text-ink mt-1">All builders</h3>
              </div>
              <div className="text-xs text-ash">
                {builderRows.length} total · email visible to admins only
              </div>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-widest text-ash border-b border-line">
                  <tr>
                    <th className="py-2 font-semibold">Builder</th>
                    <th className="py-2 font-semibold">Email</th>
                    <th className="py-2 font-semibold">Chapter</th>
                    <th className="py-2 font-semibold">Country</th>
                    <th className="py-2 font-semibold text-right">Builds</th>
                    <th className="py-2 font-semibold">Latest</th>
                    <th className="py-2 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {builderRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-ash">
                        Nobody submitted in this range.
                      </td>
                    </tr>
                  )}
                  {builderRows.map((b) => (
                    <tr key={b.email} className="border-b border-line/60">
                      <td className="py-2 flex items-center gap-2 min-w-0">
                        {b.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={b.image}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="h-6 w-6 rounded-full shrink-0"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-cloud border border-line shrink-0" />
                        )}
                        <span className="truncate font-medium text-ink">{b.name}</span>
                      </td>
                      <td className="py-2 text-ash truncate">{b.email}</td>
                      <td className="py-2 text-ink">{b.chapter}</td>
                      <td className="py-2 text-ash">{b.country}</td>
                      <td className="py-2 text-right tabular-nums font-semibold">{b.count}</td>
                      <td className="py-2 text-ash tabular-nums">{b.latest.slice(0, 10)}</td>
                      <td className="py-2 text-right">
                        {b.profileId && (
                          <Link href={`/u/${b.profileId}`} className="text-xs text-gblue hover:underline">
                            Profile →
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "chapters" && (
        <section className="container-page pb-20 grid lg:grid-cols-2 gap-5">
          <div className="card p-6">
            <div className="section-eyebrow">GDG chapters</div>
            <h3 className="font-display font-bold text-xl text-ink mt-1">Most active</h3>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-widest text-ash border-b border-line">
                  <tr>
                    <th className="py-2 font-semibold">Chapter</th>
                    <th className="py-2 font-semibold">Country</th>
                    <th className="py-2 font-semibold text-right">Builds</th>
                  </tr>
                </thead>
                <tbody>
                  {chapters.map((c) => (
                    <tr key={`${c.chapter}__${c.country}`} className="border-b border-line/60">
                      <td className="py-2 font-medium text-ink">{c.chapter}</td>
                      <td className="py-2 text-ash">{c.country}</td>
                      <td className="py-2 text-right tabular-nums">{c.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card p-6">
            <div className="section-eyebrow">Countries</div>
            <h3 className="font-display font-bold text-xl text-ink mt-1">Distribution</h3>
            <ul className="mt-5 space-y-1.5">
              {countries.map((c) => {
                const max = Math.max(1, ...countries.map((x) => x.count));
                return (
                  <li key={c.country} className="flex items-center gap-3 text-sm">
                    <div className="w-40 shrink-0 truncate text-ink">{c.country}</div>
                    <div className="flex-1 h-2 rounded-full bg-cloud overflow-hidden">
                      <div className="h-full bg-gyellow/80" style={{ width: `${(c.count / max) * 100}%` }} />
                    </div>
                    <div className="w-8 text-right tabular-nums text-ash">{c.count}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {tab === "organizers" && (
        <section className="container-page pb-20">
          <OrganizersManager initialOrganizers={organizers} totals={organizerTotals} />
        </section>
      )}

      {tab === "admins" && (
        <section className="container-page pb-20">
          <AdminsManager initialAdmins={admins} currentEmail={email} />
        </section>
      )}

      {tab === "blocklist" && (
        <section className="container-page pb-20">
          <BlocklistManager initialBlocked={blocked} />
        </section>
      )}

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
