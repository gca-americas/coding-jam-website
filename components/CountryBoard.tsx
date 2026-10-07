import { CountryStat } from "@/lib/projects";
import { getT } from "@/lib/i18n";

/**
 * Top countries by projects shipped.
 *
 * One measure, one series — so one hue, no legend, and no rank-cycled colors
 * (color must follow the entity, not its position). Bars carry magnitude; the
 * counts are direct-labeled in ink tokens rather than the bar color.
 */
export default async function CountryBoard({
  stats,
  limit = 10,
}: {
  stats: CountryStat[];
  limit?: number;
}) {
  const t = await getT();
  if (!stats.length) {
    return (
      <div className="card p-6 text-center text-ash">
        {t("country.empty")}
      </div>
    );
  }

  const top = stats.slice(0, limit);
  const max = Math.max(...top.map((s) => s.count));
  const totalProjects = stats.reduce((s, c) => s + c.count, 0);
  const hidden = stats.length - top.length;

  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-line bg-cloud/60">
        <div className="flex items-end justify-between flex-wrap gap-2">
          <div>
            <div className="section-eyebrow">{t("country.dashboard")}</div>
            <h3 className="font-display font-bold text-2xl text-ink mt-1">
              {t("country.top").replace("{n}", String(top.length))}
            </h3>
          </div>
          <div className="text-sm text-ash">
            {t(stats.length === 1 ? "country.summaryOne" : "country.summaryMany")
              .replace("{c}", String(stats.length))
              .replace("{p}", String(totalProjects))}
          </div>
        </div>
      </div>

      <ul className="divide-y divide-line">
        {top.map((s, i) => {
          // Floor the width so a 1-project country is still a visible mark.
          const pct = Math.max(4, Math.round((s.count / max) * 100));
          return (
            <li key={s.country} className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-6 shrink-0 font-display font-bold text-sm text-ash tabular-nums">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display font-semibold text-ink truncate">{s.country}</span>
                    <span className="text-xs text-ash shrink-0 tabular-nums">
                      {t(s.chapters === 1 ? "country.chapterOne" : "country.chapterMany").replace("{n}", String(s.chapters))}
                    </span>
                  </div>
                  {/* Track + fill. 2px surface gap via the inset track background. */}
                  <div
                    className="mt-2 h-2 w-full rounded-full bg-cloud overflow-hidden"
                    role="img"
                    aria-label={`${s.country}: ${s.count}`}
                    title={`${s.country} — ${s.count}`}
                  >
                    <div
                      className="h-full rounded-full bg-gblue"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="font-display font-bold text-ink shrink-0 tabular-nums w-8 text-right">
                  {s.count}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {hidden > 0 && (
        <div className="px-6 py-3 border-t border-line bg-cloud/40 text-xs text-ash">
          {t(hidden === 1 ? "country.hiddenOne" : "country.hiddenMany").replace("{n}", String(hidden))}
        </div>
      )}
    </div>
  );
}
