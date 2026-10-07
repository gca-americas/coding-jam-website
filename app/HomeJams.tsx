"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import JamCard, { ReadyMadeJamCard, type ReadyMadeTrack } from "@/components/JamCard";
import type { PublicJam } from "@/lib/jams";
import type { TopicView } from "@/lib/topic";

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
  copy,
  jams,
  readyMade,
  jamBuilds,
  trackBuilds,
  views,
  slots,
}: {
  /** Catalogue slice from the server page — getT() can't run in a client component. */
  copy?: Record<string, string>;
  jams: PublicJam[];
  readyMade: ReadyMadeTrack[];
  jamBuilds: Record<string, number>;
  trackBuilds: Record<number, number>;
  /** Localized topic view per jam slug, built on the server. */
  views?: Record<string, TopicView>;
  slots: number;
}) {
  const t = (key: string, fallback: string) => copy?.[key] ?? fallback;
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
          <div className="section-eyebrow">{t("home.jams.eyebrow", "Fresh from the jam")}</div>
          <h2 className="h-display text-3xl sm:text-4xl mt-2">{t("home.jams.title", "Jams to join, or run yourself.")}</h2>
          <p className="text-ash mt-3 max-w-2xl">
            {jams.length > 0
              ? t("home.jams.lede", "Organizers pick their own topic for the week. The rest are ready-made — pick one and host it.")
              : t("home.jams.ledeEmpty", "No one has published a jam yet. These are ready to run as-is — pick one and host it.")}
          </p>
        </div>
        <Link href="/jams" className="text-sm text-gblue hover:underline shrink-0">
          {t("home.jams.all", "All jams →")}
        </Link>
      </div>

      {jams.length > 0 && (
        <div className="mb-6 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="block text-xs text-ash">{t("home.jams.country", "Country")}</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input mt-1 sm:w-56"
            >
              <option value="">{t("home.jams.allCountries", "All countries")}</option>
              {countries.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-xs text-ash">{t("home.jams.from", "From")}</span>
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
              className="input mt-1"
              aria-label={t("home.jams.onAfter", "Jams on or after")}
            />
          </label>

          <label className="block">
            <span className="block text-xs text-ash">{t("home.jams.to", "To")}</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
              className="input mt-1"
              aria-label={t("home.jams.onBefore", "Jams on or before")}
            />
          </label>

          {filtering && (
            <div className="flex items-center gap-3 pb-2.5 text-sm">
              <span className="text-ash">
                {visible.length === 0
                  ? t("home.jams.noMatch", "No jams match.")
                  : t(visible.length === 1 ? "home.jams.countOne" : "home.jams.countMany", visible.length === 1 ? "{n} jam" : "{n} jams").replace("{n}", String(visible.length))}
              </span>
              <button type="button" onClick={clear} className="text-gblue hover:underline">
                {t("home.jams.clear", "Clear")}
              </button>
            </div>
          )}
        </div>
      )}

      {shown.length === 0 && padding.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-3xl">🔍</div>
          <h3 className="font-display font-semibold text-ink mt-3">{t("home.jams.emptyTitle", "No jams match those filters")}</h3>
          <p className="text-sm text-ash mt-2">
            {t("home.jams.emptyBody", "Try another country or a wider date range — or")}{" "}
            <Link href="/jams" className="text-gblue hover:underline">
              {t("home.jams.browseAll", "browse them all")}
            </Link>
            .
          </p>
          <button type="button" onClick={clear} className="btn-ghost mt-5 !py-2 !px-4 text-sm">
            {t("home.jams.clearFilters", "Clear filters")}
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {shown.map((jam) => (
            <JamCard
              key={jam.slug}
              jam={jam}
              builds={jamBuilds[jam.slug] ?? 0}
              view={views?.[jam.slug]}
              copy={copy}
            />
          ))}
          {padding.map((t) => (
            <ReadyMadeJamCard
              key={t.slug}
              track={t}
              builds={t.number === undefined ? 0 : trackBuilds[t.number] ?? 0}
              copy={copy}
            />
          ))}
        </div>
      )}
    </>
  );
}
