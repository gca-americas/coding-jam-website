"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type FilterState = {
  q: string;
  chapter: string;
  jam: string;
  from: string;
  to: string;
};

/**
 * Showcase filters.
 *
 * State lives in the URL rather than in this component, so a filtered view is
 * shareable and the server-side pagination below stays correct. Changes are
 * debounced into a single navigation — typing a build name doesn't fire a
 * request per keystroke.
 *
 * `track` is threaded through untouched. It has no control of its own here any
 * more, but the per-track pages still link in with it, so dropping it would
 * silently widen the results out from under someone who arrived that way.
 */
export default function ShowcaseFilters({
  chapters,
  jams,
  initial,
  track,
  resultCount,
}: {
  chapters: Array<{ chapter: string; count: number }>;
  jams: Array<{ slug: string; title: string; count: number }>;
  initial: FilterState;
  track?: string;
  resultCount: number;
}) {
  const router = useRouter();
  const [f, setF] = useState<FilterState>(initial);

  const serialize = (state: FilterState) => {
    const p = new URLSearchParams();
    if (track) p.set("track", track);
    if (state.q.trim()) p.set("q", state.q.trim());
    if (state.chapter) p.set("chapter", state.chapter);
    if (state.jam) p.set("jam", state.jam);
    if (state.from) p.set("from", state.from);
    if (state.to) p.set("to", state.to);
    // `page` is deliberately dropped — a new filter starts at page 1.
    return p.toString();
  };

  const lastPushed = useRef(serialize(initial));

  useEffect(() => {
    const next = serialize(f);
    if (next === lastPushed.current) return;
    const timer = setTimeout(() => {
      lastPushed.current = next;
      router.push(next ? `/showcase?${next}` : "/showcase", { scroll: false });
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.q, f.chapter, f.jam, f.from, f.to, track]);

  const set = (patch: Partial<FilterState>) => setF((prev) => ({ ...prev, ...patch }));
  const active = Boolean(f.q.trim() || f.chapter || f.jam || f.from || f.to);

  return (
    <div className="card p-6">
      <div className="flex items-baseline justify-between gap-3">
        <div className="section-eyebrow">Find a build</div>
        {active && (
          <button
            type="button"
            onClick={() => setF({ q: "", chapter: "", jam: "", from: "", to: "" })}
            className="text-xs text-gblue hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="text-xs text-ash">Build name</span>
          <input
            type="search"
            value={f.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Search by project name…"
            className="input mt-1"
          />
        </label>

        <label className="block">
          <span className="text-xs text-ash">GDG group</span>
          <select
            value={f.chapter}
            onChange={(e) => set({ chapter: e.target.value })}
            className="input mt-1"
          >
            <option value="">All groups</option>
            {chapters.map((c) => (
              <option key={c.chapter} value={c.chapter}>
                {c.chapter} ({c.count})
              </option>
            ))}
          </select>
        </label>

        {jams.length > 0 && (
          <label className="block">
            <span className="text-xs text-ash">Jam</span>
            <select
              value={f.jam}
              onChange={(e) => set({ jam: e.target.value })}
              className="input mt-1"
            >
              <option value="">All jams</option>
              {jams.map((j) => (
                <option key={j.slug} value={j.slug}>
                  {j.title} ({j.count})
                </option>
              ))}
            </select>
          </label>
        )}

        <div>
          <span className="text-xs text-ash">Submitted between</span>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <input
              type="date"
              value={f.from}
              max={f.to || undefined}
              onChange={(e) => set({ from: e.target.value })}
              className="input"
              aria-label="Submitted on or after"
            />
            <input
              type="date"
              value={f.to}
              min={f.from || undefined}
              onChange={(e) => set({ to: e.target.value })}
              className="input"
              aria-label="Submitted on or before"
            />
          </div>
        </div>
      </div>

      {active && (
        <p className="text-xs text-ash mt-4">
          {resultCount === 0
            ? "Nothing matches those filters."
            : `${resultCount} ${resultCount === 1 ? "build" : "builds"} match.`}
        </p>
      )}
    </div>
  );
}
