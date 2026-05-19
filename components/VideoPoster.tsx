"use client";

import { useEffect, useState } from "react";

type Props = {
  /** 11-char YouTube video ID. */
  id: string;
  /** Title for a11y / iframe title. */
  title: string;
  /** Optional className applied to the wrapper. Set the aspect ratio + sizing here. */
  className?: string;
  /** Defaults to true. Set false on mobile-only contexts to skip the auto-upgrade. */
  autoplay?: boolean;
  /** ms delay before swapping <img> for autoplay <iframe>. Default 600. */
  upgradeDelay?: number;
};

const POSTER = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
// Autoplay+loop requires playlist=self-id. mute=1 is required for browsers to honor autoplay.
const AUTOPLAY_SRC = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&playsinline=1&rel=0`;
// Muted + controls hidden + keyboard disabled — visitors can't unmute on the site.
// (A determined user can still right-click → "Watch on YouTube" and unmute there.
// For guaranteed silence, strip the audio from the source video in YouTube Studio.)
const MODAL_SRC = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&playsinline=1`;

export default function VideoPoster({
  id,
  title,
  className = "aspect-video w-full",
  autoplay = true,
  upgradeDelay = 600,
}: Props) {
  const [upgraded, setUpgraded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  // Mobile detection guards against autoplay-blocked + bandwidth-heavy iframe on phones.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!autoplay || isMobile) return;
    const t = window.setTimeout(() => setUpgraded(true), upgradeDelay);
    return () => window.clearTimeout(t);
  }, [autoplay, upgradeDelay, isMobile]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [modalOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label={`Open ${title} full screen`}
        className={`${className} relative group rounded-2xl overflow-hidden border border-line shadow-lift bg-cloud block`}
      >
        {upgraded && !isMobile ? (
          <iframe
            src={AUTOPLAY_SRC(id)}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            loading="lazy"
            // Disable iframe pointer events so the parent <button> handles clicks.
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={POSTER(id)}
            alt={`${title} demo`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Play badge — always visible, signals "click for sound" */}
        <div className="absolute inset-0 flex items-end justify-end p-3 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 text-white text-xs px-3 py-1.5 backdrop-blur-sm group-hover:bg-black/85 transition">
            ▶ Watch fullscreen
          </span>
        </div>
      </button>

      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black"
          >
            <iframe
              src={MODAL_SRC(id)}
              title={title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              aria-label="Close video"
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 hover:bg-white text-ink flex items-center justify-center font-bold shadow-lift"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
