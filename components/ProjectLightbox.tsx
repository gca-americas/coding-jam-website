"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { PublicProject } from "@/lib/projects";
import { organizerCredit } from "@/lib/attribution";
import { googleTechLabel } from "@/lib/google-tech";
import { useT } from "@/lib/i18n/client";

/**
 * Full-screen view of a submitted build.
 *
 * Screenshots are the whole point of the showcase and a card crops them to a
 * 160px band, so this gives the image the room it deserves and moves the
 * details onto a translucent panel beside it — the image stays the subject,
 * the text sits over the same dark ground rather than in a white box.
 *
 * Closes on Escape, on a backdrop click, and on the close button. Page scroll
 * is locked while it is open so the page behind doesn't move under the overlay.
 *
 * Rendered through a portal to document.body. The card that opens it is
 * `overflow-hidden` and lifts on hover with a transform — and a transformed
 * ancestor becomes the containing block for `position: fixed`, which would
 * size and clip this overlay to the card instead of the viewport.
 */
export default function ProjectLightbox({
  project,
  onClose,
}: {
  project: PublicProject;
  onClose: () => void;
}) {
  const t = useT();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const techLabels = (project.googleTech ?? [])
    .map(googleTechLabel)
    .filter((l): l is string => Boolean(l));
  const profileHref = project.submitterProfileId ? `/u/${project.submitterProfileId}` : null;

  if (!mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.projectName} — full size`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl text-white backdrop-blur transition hover:bg-white/25"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
      >
        ×
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="grid max-h-full w-full max-w-7xl gap-4 overflow-y-auto lg:grid-cols-[minmax(0,1fr),22rem] lg:items-start lg:overflow-visible"
      >
        {/* The image, as large as the viewport allows */}
        <div className="flex items-center justify-center">
          {project.screenshotUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={project.screenshotUrl}
              alt={project.projectName}
              className="max-h-[60vh] w-full rounded-2xl object-contain shadow-2xl lg:max-h-[85vh]"
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-white/5 text-6xl">
              🛠️
            </div>
          )}
        </div>

        {/* Details, on a translucent panel over the same dark ground */}
        <aside className="rounded-2xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur-xl lg:max-h-[85vh] lg:overflow-y-auto">
          <h2 className="font-display text-2xl font-bold leading-tight">{project.projectName}</h2>

          <div className="mt-4 flex items-center gap-3">
            {project.builderImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={project.builderImage}
                alt=""
                referrerPolicy="no-referrer"
                className="h-9 w-9 shrink-0 rounded-full ring-2 ring-white/30"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
                {project.builderName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              {profileHref ? (
                <Link href={profileHref} className="block truncate font-medium hover:underline">
                  {project.builderName}
                </Link>
              ) : (
                <div className="truncate font-medium">{project.builderName}</div>
              )}
              <div className="truncate text-xs text-white/60">
                {project.chapter} · {project.country}
              </div>
            </div>
          </div>

          {project.description && (
            <p className="mt-5 text-sm leading-relaxed text-white/90">{project.description}</p>
          )}

          {project.surprise && (
            <div className="mt-5 rounded-xl bg-white/10 px-4 py-3">
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                {t("pl.surprised")}
              </div>
              <p className="mt-1 text-sm italic leading-relaxed text-white/90">
                &ldquo;{project.surprise}&rdquo;
              </p>
            </div>
          )}

          {techLabels.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {techLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/80"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {project.jamSlug && (
            <Link
              href={`/jam/${project.jamSlug}`}
              className="mt-5 block truncate text-xs text-white/60 hover:text-white hover:underline"
            >
              {project.jamTitle ?? project.jamSlug} · {organizerCredit(project)}
            </Link>
          )}

          <div className="mt-6 space-y-2">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gblue px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                {t("pc.liveDemo")}
              </a>
            )}
            <div className="flex gap-2">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-center text-sm font-medium transition hover:bg-white/10"
                >
                  Repo ↗
                </a>
              )}
              {project.videoUrl && (
                <a
                  href={project.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-center text-sm font-medium transition hover:bg-white/10"
                >
                  Video ↗
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>,
    document.body,
  );
}
