"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TRACKS } from "@/lib/tracks";

const VIDEO_MS = 6000;
const TOGETHER_LETTERS = ["T", "o", "g", "e", "t", "h", "e", "r"];
const LETTER_COLORS = [
  "text-gblue", "text-gred", "text-gyellow", "text-gblue",
  "text-ggreen", "text-gred", "text-gyellow", "text-ggreen",
];

export default function AnimationsPreview() {
  const tracks = TRACKS.filter((t) => t.youtubeId);
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => {
      // Fade out → swap → fade in pattern
      setFading(true);
      window.setTimeout(() => {
        setIdx((i) => (i + 1) % tracks.length);
        setFading(false);
      }, 350);
    }, VIDEO_MS);
    return () => window.clearInterval(t);
  }, [tracks.length]);

  const current = tracks[idx];

  return (
    <div className="bg-white min-h-screen">
      <style>{`
        @keyframes preview-slide-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes preview-letter-drop {
          0%   { opacity: 0; transform: translateY(-32px) scale(0.7); }
          60%  { opacity: 1; transform: translateY(4px) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes preview-chip-in {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes preview-particle {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          10%  { opacity: 0.5; }
          90%  { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        .anim-fade-up    { opacity: 0; animation: preview-slide-up 700ms ease-out forwards; }
        .anim-letter     { display: inline-block; opacity: 0; animation: preview-letter-drop 600ms cubic-bezier(.34,1.56,.64,1) forwards; }
        .anim-chip       { opacity: 0; animation: preview-chip-in 500ms ease-out forwards; }
        .particle        { position: absolute; bottom: -10px; width: 6px; height: 6px; border-radius: 50%; animation: preview-particle 12s linear infinite; }
      `}</style>

      {/* Banner */}
      <div className="bg-ink text-white">
        <div className="container-page py-3 flex items-center justify-between flex-wrap gap-3 text-sm">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gyellow animate-pulse" />
            <span className="opacity-80">Animation preview · refresh the page to replay</span>
          </span>
          <Link href="/" className="opacity-80 hover:opacity-100 underline-offset-4 hover:underline">
            ← Compare to current /
          </Link>
        </div>
      </div>

      <section className="relative overflow-hidden">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 dotted-bg opacity-50" />
        {/* Slow drifting particles in Google colors */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {Array.from({ length: 24 }).map((_, i) => {
            const colors = ["bg-gblue", "bg-gred", "bg-gyellow", "bg-ggreen"];
            const color = colors[i % colors.length];
            const leftPct = (i * 37) % 100;
            const delaySec = (i * 0.7) % 12;
            return (
              <span
                key={i}
                className={`particle ${color}`}
                style={{ left: `${leftPct}%`, animationDelay: `${delaySec}s` }}
              />
            );
          })}
        </div>

        <div className="container-page relative pt-16 pb-16 sm:pt-24 sm:pb-20">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <Link
                href="/about"
                className="anim-fade-up inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft hover:shadow-lift hover:text-ink transition-all"
                style={{ animationDelay: "0ms" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-ggreen animate-pulse" />
                <span>8 independent jams for GDG communities · What&rsquo;s a Coding Jam? →</span>
              </Link>

              <h1 className="font-display font-bold tracking-tight text-5xl sm:text-7xl mt-6 leading-[1.02] text-ink">
                <span className="anim-fade-up inline-block" style={{ animationDelay: "150ms" }}>
                  Build with AI.
                </span>
                <br />
                <span>
                  {TOGETHER_LETTERS.map((ch, i) => (
                    <span
                      key={i}
                      className={`anim-letter ${LETTER_COLORS[i]}`}
                      style={{ animationDelay: `${500 + i * 80}ms` }}
                    >
                      {ch}
                    </span>
                  ))}
                  <span
                    className="anim-letter text-ink"
                    style={{ animationDelay: `${500 + TOGETHER_LETTERS.length * 80}ms` }}
                  >
                    .
                  </span>
                </span>
                <br />
                <span className="anim-fade-up inline-block" style={{ animationDelay: "1300ms" }}>
                  In two hours.
                </span>
              </h1>

              <p className="anim-fade-up mt-6 text-lg text-ash max-w-2xl" style={{ animationDelay: "1500ms" }}>
                Pick any track. Open the kit. Ship a real AI prototype before the pizza gets cold.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#"
                  className="anim-fade-up btn-google"
                  style={{ animationDelay: "1700ms" }}
                >
                  Jump to the lineup ↓
                </Link>
                <Link
                  href="#"
                  className="anim-fade-up btn-tonal"
                  style={{ animationDelay: "1800ms" }}
                >
                  See community builds
                </Link>
                <Link
                  href="#"
                  className="anim-fade-up btn-text"
                  style={{ animationDelay: "1900ms" }}
                >
                  I&rsquo;m an organizer
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-2">
                {[
                  { label: "8 weekly jams", dot: "bg-gblue" },
                  { label: "2hr per session", dot: "bg-gred" },
                  { label: "Antigravity-driven", dot: "bg-gyellow" },
                  { label: "∞ drop-ins welcome", dot: "bg-ggreen" },
                ].map((s, i) => (
                  <span
                    key={s.label}
                    className="anim-chip inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-line text-sm text-ink"
                    style={{ animationDelay: `${2050 + i * 100}ms` }}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Cycling video reel */}
            <div className="lg:col-span-5">
              <div
                className="anim-fade-up relative aspect-video rounded-2xl overflow-hidden border border-line shadow-lift bg-cloud"
                style={{ animationDelay: "300ms" }}
              >
                <iframe
                  key={current.youtubeId}
                  src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${current.youtubeId}&controls=0&disablekb=1&modestbranding=1&rel=0&playsinline=1`}
                  title={`${current.project} demo`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  loading="lazy"
                  className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
                />
                {/* Now-playing label */}
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 text-white text-xs backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-gred animate-pulse" />
                  Track {String(current.number).padStart(2, "0")} · {current.project}
                </div>
                {/* Progress dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {tracks.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === idx ? "w-6 bg-white" : "w-1.5 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-xs text-ash text-center sm:text-left">
                Auto-cycling through all 8 tracks · {idx + 1} / {tracks.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="container-page py-12">
        <div className="rounded-2xl bg-cloud border border-line p-6 max-w-3xl">
          <div className="section-eyebrow">What&rsquo;s animating</div>
          <ul className="mt-3 space-y-2 text-sm text-ink leading-relaxed">
            <li>
              <span className="font-semibold">0–150ms</span> · the &ldquo;8 independent jams&rdquo; pill fades up.
            </li>
            <li>
              <span className="font-semibold">150–500ms</span> · &ldquo;Build with AI.&rdquo; slides up.
            </li>
            <li>
              <span className="font-semibold">500–1200ms</span> · the 8 letters of &ldquo;Together&rdquo; drop in
              one at a time, each in its Google color, with a slight overshoot bounce.
            </li>
            <li>
              <span className="font-semibold">1300–1900ms</span> · &ldquo;In two hours.&rdquo;, the description,
              and the 3 buttons cascade in.
            </li>
            <li>
              <span className="font-semibold">2050ms+</span> · the 4 stat chips ripple in left-to-right.
            </li>
            <li>
              <span className="font-semibold">Background</span> · 24 tiny dots in the Google colors drift
              upward at random speeds and offsets — pure CSS, no JS.
            </li>
            <li>
              <span className="font-semibold">Video reel</span> · the right-side iframe auto-advances through
              all 8 tracks every 6 seconds with a crossfade. A &ldquo;now playing&rdquo; chip and a 8-dot
              progress indicator at the bottom keep you oriented.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
