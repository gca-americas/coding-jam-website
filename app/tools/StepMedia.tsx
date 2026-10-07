"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/client";

/**
 * A walkthrough capture that opens full-screen when clicked.
 *
 * The captures are console UI — dense menus and small text that a reader is
 * meant to match against their own screen — and inline they only get the width
 * of one card. So the whole thing is a button, and the overlay redraws it as
 * large as the viewport allows.
 *
 * `width`/`height` are the file's real pixel size, used for aspect ratio in
 * both places rather than a hard-coded box, so a replacement capture at another
 * shape needs no CSS change.
 */
export default function StepMedia({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    // The page behind shouldn't scroll under the overlay.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  /* Blowing a capture up to fill the viewport would turn a 544px GIF to mush,
     so the enlarged width is whichever comes first: the viewport, the height
     budget, or twice the file's own resolution. */
  const enlargedWidth = `min(96vw, ${(width / height).toFixed(4)} * 85vh, ${width * 2}px)`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ maxWidth: width }}
        className="group relative block w-full mx-auto mt-4 cursor-zoom-in rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gblue focus-visible:ring-offset-2"
        aria-label={`Enlarge: ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          /* Six animated GIFs on one page is tens of megabytes — only fetch
             the ones someone actually scrolls to. */
          loading="lazy"
          decoding="async"
          className="w-full rounded-xl border border-line transition-shadow group-hover:shadow-lift"
        />
        <span className="pointer-events-none absolute bottom-3 right-3 hidden sm:inline-flex items-center gap-1.5 rounded-full bg-ink/75 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {t("sm.enlarge")}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm sm:p-8"
        >
          <button
            type="button"
            autoFocus
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Close ✕
          </button>
          <figure
            /* Clicks on the image itself shouldn't dismiss — only the backdrop. */
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-full flex-col items-center gap-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              width={width}
              height={height}
              style={{ width: enlargedWidth }}
              className="h-auto max-w-full rounded-lg shadow-lift"
            />
            <figcaption className="max-w-2xl text-center text-sm text-white/80">{alt}</figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
