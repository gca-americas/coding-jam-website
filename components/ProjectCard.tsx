"use client";

import { useState } from "react";
import Link from "next/link";
import type { PublicProject } from "@/lib/projects";
import { organizerCredit } from "@/lib/attribution";
import { useT } from "@/lib/i18n/client";
import { googleTechLabel } from "@/lib/google-tech";
import { TRACKS, colorClasses, trackLabel } from "@/lib/tracks";
import ProjectLightbox from "./ProjectLightbox";

export default function ProjectCard({ project }: { project: PublicProject }) {
  const t = useT();
  const [zoomed, setZoomed] = useState(false);
  const isCustom = project.trackNumber === 0;
  const track = TRACKS.find((t) => t.number === project.trackNumber);
  const c = track ? colorClasses[track.color] : colorClasses.blue;
  // A build from a jam with a non-track topic has no track number to show, so
  // the chip falls back to the topic the organizer set for that week.
  const trackChipLabel = isCustom
    ? project.topicLabel ?? t("pc.builtOwn")
    : `${t("card.track")} ${trackLabel(project.trackNumber)}`;
  const fallbackEmoji = isCustom ? "🛠️" : track?.emoji ?? "✨";
  const profileHref = project.submitterProfileId ? `/u/${project.submitterProfileId}` : null;
  // Ids are stored; a tag retired from the catalog since submission resolves to
  // null and is simply not shown.
  const techLabels = (project.googleTech ?? [])
    .map(googleTechLabel)
    .filter((l): l is string => Boolean(l));

  return (
    <article className="card card-hover overflow-hidden flex flex-col">
      <button
        type="button"
        onClick={() => setZoomed(true)}
        aria-label={`Enlarge ${project.projectName}`}
        className={`group/shot relative block h-40 w-full cursor-zoom-in overflow-hidden bg-gradient-to-br text-left ${c.gradient} text-white p-5`}
      >
        {project.screenshotUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={project.screenshotUrl}
            alt={project.projectName}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0 dotted-bg opacity-30" />
            <div className="absolute right-4 bottom-3 text-7xl opacity-30">{fallbackEmoji}</div>
          </>
        )}
        <div className="relative flex items-start justify-between gap-2">
          <span className="chip bg-white/25 text-white backdrop-blur-sm shrink-0">
            {trackChipLabel}
          </span>
          <span className="chip bg-white/25 text-white backdrop-blur-sm truncate max-w-[60%]" title={`${project.chapter} · ${project.country}`}>
            {project.chapter}
          </span>
        </div>
        <div className="absolute bottom-4 left-5 right-5">
          <div className="font-display font-bold text-xl text-white drop-shadow">{project.projectName}</div>
        </div>
        {/* Affordance only on hover — the cards are already busy at rest. */}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover/shot:opacity-100">
          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink shadow-lift">
            Enlarge
          </span>
        </span>
      </button>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2.5 text-sm">
          {project.builderImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={project.builderImage}
              alt=""
              referrerPolicy="no-referrer"
              className="h-7 w-7 rounded-full ring-2 ring-white shadow-soft shrink-0"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-cloud border border-line flex items-center justify-center text-[11px] font-semibold text-ash shrink-0">
              {project.builderName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            {profileHref ? (
              <Link href={profileHref} className="font-medium text-ink truncate hover:text-gblue hover:underline block">
                {project.builderName}
              </Link>
            ) : (
              <div className="font-medium text-ink truncate">{project.builderName}</div>
            )}
            {project.jamSlug && (
              <Link
                href={`/jam/${project.jamSlug}`}
                className="text-[11px] text-ash hover:text-gblue truncate block"
                title={`${project.jamTitle ?? project.jamSlug} — led by ${organizerCredit(project)}`}
              >
                {project.jamTitle ?? project.jamSlug} · {organizerCredit(project)}
              </Link>
            )}
          </div>
        </div>
        {project.description && (
          <p className="mt-3 text-sm text-ink leading-relaxed">
            {project.description}
          </p>
        )}
        {project.surprise && (
          <p className="mt-3 text-sm text-ink italic leading-relaxed border-l-2 border-line pl-3">
            &ldquo;{project.surprise}&rdquo;
          </p>
        )}
        {techLabels.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {techLabels.map((label) => (
              <span
                key={label}
                className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-cloud border border-line text-ash"
              >
                {label}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto pt-4 space-y-3">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2 rounded-lg bg-gblue text-white text-sm font-semibold hover:bg-gblue/90 transition-colors shadow-soft"
            >
              {t("pc.liveDemo")}
            </a>
          )}
          <div className="flex items-center gap-3 text-xs">
            {project.repoUrl && (
              <a className="text-ash hover:text-ink font-medium" href={project.repoUrl} target="_blank" rel="noreferrer">
                Repo
              </a>
            )}
            {project.videoUrl && (
              <a className="text-ash hover:text-ink font-medium" href={project.videoUrl} target="_blank" rel="noreferrer">
                Video
              </a>
            )}
          </div>
        </div>
      </div>
      {zoomed && <ProjectLightbox project={project} onClose={() => setZoomed(false)} />}
    </article>
  );
}
