"use client";

import { useRouter } from "next/navigation";

/**
 * Date-range control for the admin dashboard.
 *
 * The range lives in the URL so it survives tab switches and can be pasted to
 * another admin. Every number on the page — the stat tiles, the per-jam
 * submission counts, the builder table — is derived from submissions inside it.
 *
 * Presets compute "today" in the browser on click rather than at render, so
 * there's nothing time-dependent in the server-rendered HTML to mismatch.
 */
export default function AdminDateRange({
  tab,
  from,
  to,
}: {
  tab: string;
  from: string;
  to: string;
}) {
  const router = useRouter();

  function apply(next: { from?: string; to?: string }) {
    const p = new URLSearchParams();
    if (tab && tab !== "overview") p.set("tab", tab);
    const f = next.from ?? from;
    const t = next.to ?? to;
    if (f) p.set("from", f);
    if (t) p.set("to", t);
    const q = p.toString();
    router.push(q ? `/admin?${q}` : "/admin", { scroll: false });
  }

  function preset(days: number | null) {
    if (days === null) {
      const p = new URLSearchParams();
      if (tab && tab !== "overview") p.set("tab", tab);
      const q = p.toString();
      router.push(q ? `/admin?${q}` : "/admin", { scroll: false });
      return;
    }
    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    const start = new Date(now.getTime() - days * 86_400_000).toISOString().slice(0, 10);
    apply({ from: start, to: end });
  }

  const active = Boolean(from || to);

  return (
    <div className="card p-4 flex flex-wrap items-end gap-3">
      <label className="block">
        <span className="block text-xs text-ash">From</span>
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => apply({ from: e.target.value })}
          className="input mt-1"
          aria-label="Submissions on or after"
        />
      </label>
      <label className="block">
        <span className="block text-xs text-ash">To</span>
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => apply({ to: e.target.value })}
          className="input mt-1"
          aria-label="Submissions on or before"
        />
      </label>

      <div className="flex flex-wrap gap-2 pb-1">
        {[
          { label: "7 days", days: 7 },
          { label: "30 days", days: 30 },
          { label: "90 days", days: 90 },
        ].map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => preset(p.days)}
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-line bg-white text-ink hover:border-gblue hover:text-gblue transition-colors"
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => preset(null)}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
            active
              ? "border-line bg-white text-ink hover:border-gblue hover:text-gblue"
              : "border-ink bg-ink text-white"
          }`}
        >
          All time
        </button>
      </div>

      <div className="pb-2 text-xs text-ash ml-auto">
        {active ? (
          <>
            Showing <span className="font-medium text-ink">{from || "the start"}</span> →{" "}
            <span className="font-medium text-ink">{to || "today"}</span>
          </>
        ) : (
          "Showing all time"
        )}
      </div>
    </div>
  );
}
