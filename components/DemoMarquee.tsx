"use client";

import { useEffect, useState } from "react";
import { TRACKS, colorClasses, trackLabel } from "@/lib/tracks";

/**
 * Infinite horizontal marquee of all 8 demo videos.
 *
 * Pure CSS scroll (translateX 0 → -50%) on a 2× duplicated row.
 * Hover anywhere on the row pauses. Click a card opens a modal with the
 * autoplay-muted iframe. Posters come from YouTube's CDN — no assets in repo.
 *
 * Render with no props anywhere on the page:
 *   <DemoMarquee />
 *
 * Tweak the duration via the optional `durationSeconds` prop.
 */
export default function DemoMarquee({
  durationSeconds = 50,
}: {
  durationSeconds?: number;
}) {
  const tracks = TRACKS.filter((t) => t.youtubeId);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [activeId]);

  const activeTrack = activeId ? tracks.find((t) => t.youtubeId === activeId) : null;

  return (
    <>
      <style>{`
        @keyframes demo-marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .demo-marquee-track {
          animation: demo-marquee-scroll ${durationSeconds}s linear infinite;
        }
        .demo-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="relative overflow-hidden">
        {/* Edge fade-out masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="demo-marquee-track flex gap-5 w-max py-2">
          {[...tracks, ...tracks].map((t, i) => (
            <Card
              key={`${t.slug}-${i}`}
              track={t}
              onOpen={() => setActiveId(t.youtubeId ?? null)}
            />
          ))}
        </div>
      </div>

      {activeTrack && (
        <div
          onClick={() => setActiveId(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeTrack.project} demo`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black"
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeTrack.youtubeId}?autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&playsinline=1`}
              title={`${activeTrack.project} demo`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
            <button
              type="button"
              onClick={() => setActiveId(null)}
              aria-label="Close video"
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 hover:bg-white text-ink flex items-center justify-center font-bold shadow-lift z-10"
            >
              ×
            </button>
            <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 text-white text-xs backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-gred animate-pulse" />
              Track {trackLabel(activeTrack.number)} · {activeTrack.project}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Card({
  track,
  onOpen,
}: {
  track: typeof TRACKS[number];
  onOpen: () => void;
}) {
  const c = colorClasses[track.color];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative w-72 sm:w-80 shrink-0 rounded-2xl overflow-hidden bg-white border border-line shadow-soft hover:shadow-lift transition-all hover:-translate-y-1 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gblue/40"
    >
      <div className="relative aspect-video bg-cloud">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${track.youtubeId}/hqdefault.jpg`}
          alt={`${track.project} demo poster`}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-white text-ink text-2xl shadow-lift">
            ▶
          </span>
        </div>
      </div>

      <div className="p-4 text-left">
        <div className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${c.text}`}>
          Track {trackLabel(track.number)}
        </div>
        <div className="font-display font-bold text-lg mt-1 leading-tight text-ink">
          {track.project}
        </div>
      </div>
      <div className={`h-1 ${c.bg}`} />
    </button>
  );
}
