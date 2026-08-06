"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import JamCard, { ReadyMadeJamCard, type ReadyMadeTrack } from "@/components/JamCard";
import type { PublicJam } from "@/lib/jams";

/**
 * The homepage jams grid, with country and date filters.
 *
 * Filtering happens in the browser rather than through the URL, unlike the
 * showcase. Two reasons: the published-jam list is small enough to hand over
 * whole, and a round trip would re-render the whole page — which would reshuffle
 * the build reel above every time someone touched a dropdown.
 *
 * Jams arrive as PublicJam so the organizer's email never reaches the client.
 */
export default function HomeJams({
  jams,
  readyMade,
  jamBuilds,
  trackBuilds,
  slots,
}: {
  jams: PublicJam[];
  readyMade: ReadyMadeTrack[];
  jamBuilds: Record<string, number>;
  trackBuilds: Record<number, number>;
  slots: number;
}) {
  const [country, setCountry] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const countries = useMemo(() => {
    const counts = new Map<string, number>();
    for (const j of jams) counts.set(j.country, (counts.get(j.country) ?? 0) + 1);
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, "en"));
  }, [jams]);

  const filtering = Boolean(country || from || to);

  const visible = useMemo(() => {
    return jams.filter((j) => {
      if (country && j.country !== country) return false;
      // A jam with no date can't satisfy a date range, so a date filter hides
      // undated ones rather than silently letting them through.
      if ((from || to) && !j.eventDate) return false;
      if (from && j.eventDate! < from) return false;
      if (to && j.eventDate! > to) return false;
      return true;
    });
  }, [jams, country, from, to]);

  // Ready-made tracks only pad an unfiltered grid. Once someone is filtering by
  // country or date, topping up with tracks that have neither would be noise.
  const shown = visible.slice(0, slots);
  const padding = filtering ? [] : readyMade.slice(0, Math.max(0, slots - shown.length));

  function clear() {
    setCountry("");
    setFrom("");
    setTo("");
  }

  return (
    <>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="section-eyebrow">Fresh from the jam</div>
          <h2 className="h-display text-3xl sm:text-4xl mt-2">Jams to join, or run yourself.</h2>
          <p className="text-ash mt-3 max-w-2xl">
            {jams.length > 0
              ? "Organizers pick their own topic for the week. The rest are ready-made — pick one and host it."
              : "No one has published a jam yet. These are ready to run as-is — pick one and host it."}
          </p>
        </div>
        <Link href="/jams" className="text-sm text-gblue hover:underline shrink-0">
          All jams →
        </Link>
      </div>

      {jams.length > 0 && (
        <div className="mb-6 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="block text-xs text-ash">Country</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input mt-1 sm:w-56"
            >
              <option value="">All countries</option>
              {countries.map((c) => (
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
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
              className="input mt-1"
              aria-label="Jams on or after"
            />
          </label>

          <label className="block">
            <span className="block text-xs text-ash">To</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
              className="input mt-1"
              aria-label="Jams on or before"
            />
          </label>

          {filtering && (
            <div className="flex items-center gap-3 pb-2.5 text-sm">
              <span className="text-ash">
                {visible.length === 0
                  ? "No jams match."
                  : `${visible.length} jam${visible.length === 1 ? "" : "s"}`}
              </span>
              <button type="button" onClick={clear} className="text-gblue hover:underline">
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {shown.length === 0 && padding.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-3xl">🔍</div>
          <h3 className="font-display font-semibold text-ink mt-3">No jams match those filters</h3>
          <p className="text-sm text-ash mt-2">
            Try another country or a wider date range — or{" "}
            <Link href="/jams" className="text-gblue hover:underline">
              browse them all
            </Link>
            .
          </p>
          <button type="button" onClick={clear} className="btn-ghost mt-5 !py-2 !px-4 text-sm">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {shown.map((jam) => (
            <JamCard key={jam.slug} jam={jam} builds={jamBuilds[jam.slug] ?? 0} />
          ))}
          {padding.map((t) => (
            <ReadyMadeJamCard key={t.slug} track={t} builds={trackBuilds[t.number] ?? 0} />
          ))}
        </div>
      )}
    </>
  );
}
