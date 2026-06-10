import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin, listAdmins } from "@/lib/admins";
import { listProjectsRaw } from "@/lib/projects";
import { TRACKS, trackLabel } from "@/lib/tracks";
import AdminsManager from "./AdminsManager";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) redirect("/");
  if (!(await isAdmin(email))) notFound();

  const [projects, admins] = await Promise.all([listProjectsRaw(), listAdmins()]);

  // ─── Derive everything from the projects list ──────────────────────────────
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
  for (const p of projects) {
    countryCounts.set(p.country, (countryCounts.get(p.country) ?? 0) + 1);
  }
  const countries = [...countryCounts.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  const trackCounts = new Map<number, number>();
  for (const p of projects) {
    trackCounts.set(p.trackNumber, (trackCounts.get(p.trackNumber) ?? 0) + 1);
  }
  // Show all tracks including 0 (legacy) and 9 (your own idea), in order.
  const allTrackNumbers = Array.from(new Set([...TRACKS.map((t) => t.number), ...trackCounts.keys()])).sort((a, b) => a - b);
  const tracksData = allTrackNumbers.map((n) => {
    const t = TRACKS.find((x) => x.number === n);
    return { number: n, name: t?.project ?? "I built my own", count: trackCounts.get(n) ?? 0 };
  });
  const maxTrackCount = Math.max(1, ...tracksData.map((t) => t.count));

  // 8-week submission histogram, weeks bucketed ending today.
  const now = new Date();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const weekBuckets: { label: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const end = new Date(now.getTime() - i * weekMs);
    const start = new Date(end.getTime() - weekMs);
    const count = projects.filter((p) => {
      const t = new Date(p.submittedAt).getTime();
      return t >= start.getTime() && t < end.getTime();
    }).length;
    weekBuckets.push({ label: end.toISOString().slice(5, 10), count });
  }
  const maxWeekCount = Math.max(1, ...weekBuckets.map((w) => w.count));

  const recent = [...projects]
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
    .slice(0, 20);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 diag-bg" />
        <div className="container-page relative py-12 sm:py-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-gred" /> Admin dashboard
          </div>
          <h1 className="h-display text-3xl sm:text-4xl mt-3 leading-[1.05]">Coding Jams · operations</h1>
          <p className="mt-3 text-sm text-ash">Signed in as <span className="font-medium text-ink">{email}</span>.</p>
        </div>
      </section>

      <section className="container-page py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat n={builders.size} label="builders" />
        <Stat n={projects.length} label="submissions" />
        <Stat n={chapters.length} label="GDG chapters" />
        <Stat n={countries.length} label="countries" />
      </section>

      <section className="container-page py-6 grid lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <div className="section-eyebrow">Submissions over time</div>
          <h3 className="font-display font-bold text-xl text-ink mt-1">Last 8 weeks</h3>
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
          <div className="section-eyebrow">Tracks</div>
          <h3 className="font-display font-bold text-xl text-ink mt-1">Build count per track</h3>
          <ul className="mt-5 space-y-2">
            {tracksData.map((t) => (
              <li key={t.number} className="flex items-center gap-3 text-sm">
                <div className="w-14 shrink-0 text-xs text-ash font-mono">T{trackLabel(t.number)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate text-ink">{t.name}</span>
                    <span className="text-ash tabular-nums">{t.count}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-cloud overflow-hidden">
                    <div
                      className="h-full bg-ggreen/70"
                      style={{ width: `${(t.count / maxTrackCount) * 100}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-6 grid lg:grid-cols-2 gap-5">
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
                    <div
                      className="h-full bg-gyellow/80"
                      style={{ width: `${(c.count / max) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-right tabular-nums text-ash">{c.count}</div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="container-page py-6">
        <div className="card p-6">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <div className="section-eyebrow">Builders</div>
              <h3 className="font-display font-bold text-xl text-ink mt-1">All builders</h3>
            </div>
            <div className="text-xs text-ash">{builderRows.length} total · email visible to admins only</div>
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

      <section className="container-page py-6">
        <div className="card p-6">
          <div className="section-eyebrow">Recent submissions</div>
          <h3 className="font-display font-bold text-xl text-ink mt-1">Last 20</h3>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-widest text-ash border-b border-line">
                <tr>
                  <th className="py-2 font-semibold">Project</th>
                  <th className="py-2 font-semibold">Builder</th>
                  <th className="py-2 font-semibold">Chapter</th>
                  <th className="py-2 font-semibold">Track</th>
                  <th className="py-2 font-semibold">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id} className="border-b border-line/60">
                    <td className="py-2 font-medium text-ink truncate">{p.projectName}</td>
                    <td className="py-2 text-ash truncate">{p.builderName}</td>
                    <td className="py-2 text-ink">{p.chapter}</td>
                    <td className="py-2 text-ash">T{trackLabel(p.trackNumber)}</td>
                    <td className="py-2 text-ash tabular-nums">{p.submittedAt.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="container-page py-6 pb-20">
        <AdminsManager initialAdmins={admins} currentEmail={email} />
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
