"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type JamFilterState = {
  q: string;
  country: string;
  chapter: string;
  from: string;
  to: string;
};

/**
 * Filters for the jams directory.
 *
 * State lives in the URL, unlike the homepage's version. This is a destination
 * page people land on and share — "every jam in Germany next month" should be a
 * link. The homepage filters in the browser instead, because a round trip there
 * would reshuffle the build reel above them.
 *
 * Changes are debounced into a single navigation so typing doesn't fire a
 * request per keystroke.
 */
export default function JamsFilters({
  countries,
  chapters,
  initial,
  resultCount,
}: {
  countries: Array<{ name: string; count: number }>;
  chapters: Array<{ name: string; count: number }>;
  initial: JamFilterState;
  resultCount: number;
}) {
  const router = useRouter();
  const [f, setF] = useState<JamFilterState>(initial);

  const serialize = (s: JamFilterState) => {
    const p = new URLSearchParams();
    if (s.q.trim()) p.set("q", s.q.trim());
    if (s.country) p.set("country", s.country);
    if (s.chapter) p.set("chapter", s.chapter);
    if (s.from) p.set("from", s.from);
    if (s.to) p.set("to", s.to);
    return p.toString();
  };

  const lastPushed = useRef(serialize(initial));

  useEffect(() => {
    const next = serialize(f);
    if (next === lastPushed.current) return;
    const timer = setTimeout(() => {
      lastPushed.current = next;
      router.push(next ? `/jams?${next}` : "/jams", { scroll: false });
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.q, f.country, f.chapter, f.from, f.to]);

  const set = (patch: Partial<JamFilterState>) => setF((prev) => ({ ...prev, ...patch }));
  const active = Boolean(f.q.trim() || f.country || f.chapter || f.from || f.to);

  return (
    <div className="card p-5 sm:p-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <label className="block lg:col-span-1">
          <span className="block text-xs text-ash">Search</span>
          <input
            type="search"
            value={f.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Jam or topic name…"
            className="input mt-1"
          />
        </label>

        <label className="block">
          <span className="block text-xs text-ash">Country</span>
          <select value={f.country} onChange={(e) => set({ country: e.target.value })} className="input mt-1">
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-xs text-ash">GDG group</span>
          <select value={f.chapter} onChange={(e) => set({ chapter: e.target.value })} className="input mt-1">
            <option value="">All groups</option>
            {chapters.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-xs text-ash">From</span>
          <input
            type="date"
            value={f.from}
            max={f.to || undefined}
            onChange={(e) => set({ from: e.target.value })}
            className="input mt-1"
            aria-label="Jams on or after"
          />
        </label>

        <label className="block">
          <span className="block text-xs text-ash">To</span>
          <input
            type="date"
            value={f.to}
            min={f.from || undefined}
            onChange={(e) => set({ to: e.target.value })}
            className="input mt-1"
            aria-label="Jams on or before"
          />
        </label>
      </div>

      {active && (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <span className="text-ash">
            {resultCount === 0
              ? "No jams match."
              : `${resultCount} jam${resultCount === 1 ? "" : "s"} match.`}
          </span>
          <button
            type="button"
            onClick={() => setF({ q: "", country: "", chapter: "", from: "", to: "" })}
            className="text-gblue hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
