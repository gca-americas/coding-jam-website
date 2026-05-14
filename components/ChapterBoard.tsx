import { ChapterStat } from "@/lib/projects";

const accents = ["bg-gblue", "bg-gred", "bg-gyellow", "bg-ggreen"];

export default function ChapterBoard({ stats }: { stats: ChapterStat[] }) {
  if (!stats.length) {
    return (
      <div className="card p-6 text-center text-ash">
        No chapters yet — be the first to ship a project from your GDG.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-line bg-cloud/60">
        <div className="flex items-end justify-between flex-wrap gap-2">
          <div>
            <div className="section-eyebrow">Hero board</div>
            <h3 className="font-display font-bold text-2xl text-ink mt-1">
              GDG chapters jamming
            </h3>
          </div>
          <div className="text-sm text-ash">
            {stats.length} {stats.length === 1 ? "chapter" : "chapters"} ·{" "}
            {stats.reduce((s, c) => s + c.count, 0)} projects shipped
          </div>
        </div>
      </div>
      <ul className="divide-y divide-line">
        {stats.map((s, i) => (
          <li key={`${s.chapter}-${s.country}`} className="flex items-center gap-4 px-6 py-4">
            <div className={`h-9 w-9 rounded-full ${accents[i % 4]} text-white flex items-center justify-center font-display font-bold text-sm shrink-0`}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-semibold text-ink truncate">{s.chapter}</div>
            </div>
            <div className="font-display font-bold text-ink shrink-0 tabular-nums">{s.count}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
