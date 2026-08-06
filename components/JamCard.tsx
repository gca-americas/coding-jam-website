import Link from "next/link";
import type { Jam, PublicJam } from "@/lib/jams";
import { topicView } from "@/lib/topic";
import { colorClasses, trackLabel, type Track } from "@/lib/tracks";

/**
 * One jam, as a card. Shared by the homepage and the /jams directory so both
 * stay in step. Takes the build count as a prop rather than reading projects
 * itself — callers already have the full list and compute counts in one pass.
 */
export default function JamCard({
  jam,
  builds,
}: {
  jam: Jam | PublicJam;
  builds: number;
}) {
  const view = topicView(jam.topic);
  return (
    <CardShell
      href={`/jam/${jam.slug}`}
      eyebrow={jam.chapter}
      title={jam.title}
      emoji={view.emoji}
      color={view.color}
      topicTitle={view.title}
      tagline={view.tagline}
      footerLeft={jam.eventDate ?? jam.country}
      footerRight={`${builds} build${builds === 1 ? "" : "s"}`}
      note={`Led by ${jam.organizerName}`}
      noteBadge={jam.organizerIsGde ? "Google Developer Expert" : undefined}
    />
  );
}

/**
 * Just the track fields a card needs. The full Track carries prose arrays that
 * would otherwise be serialized into the client payload for nothing.
 */
export type ReadyMadeTrack = {
  slug: string;
  number: number;
  project: string;
  tagline: string;
  emoji: string;
  color: Track["color"];
};

/**
 * A built-in track rendered in the same shape, for filling space on the
 * homepage when few organizers have published yet.
 *
 * Deliberately labelled "Ready to run" rather than borrowing a lead's name —
 * nobody is actually running these, and implying otherwise on a page that
 * lists real events would be a lie the reader can't check.
 */
export function ReadyMadeJamCard({ track, builds }: { track: ReadyMadeTrack; builds: number }) {
  return (
    <CardShell
      href={`/tracks/${track.slug}`}
      eyebrow={`Track ${trackLabel(track.number)}`}
      title={track.project}
      emoji={track.emoji}
      color={track.color}
      tagline={track.tagline}
      footerLeft="Ready to run"
      footerRight={`${builds} build${builds === 1 ? "" : "s"}`}
      note="No lead yet — bring it to your chapter"
      muted
    />
  );
}

function CardShell({
  href,
  eyebrow,
  title,
  emoji,
  color,
  topicTitle,
  tagline,
  footerLeft,
  footerRight,
  note,
  noteBadge,
  muted,
}: {
  href: string;
  eyebrow: string;
  title: string;
  emoji: string;
  color: Track["color"];
  topicTitle?: string;
  tagline: string;
  footerLeft: string;
  footerRight: string;
  note: string;
  /** Credential shown under the note, e.g. Google Developer Expert. */
  noteBadge?: string;
  /** Ready-made cards sit back a little so real events read first. */
  muted?: boolean;
}) {
  const c = colorClasses[color];
  return (
    <Link href={href} className="card card-hover overflow-hidden flex flex-col">
      <div className={`${muted ? `${c.bgSoft} text-ink` : `${c.bg} text-white`} p-5 relative`}>
        <div className="absolute inset-0 dotted-bg opacity-20" />
        <div className="relative flex items-start justify-between gap-3">
          <div
            className={`text-xs font-mono uppercase tracking-widest truncate ${
              muted ? c.text : "opacity-90"
            }`}
          >
            {eyebrow}
          </div>
          <span className="text-2xl leading-none shrink-0">{emoji}</span>
        </div>
        <div className="relative font-display font-bold text-xl mt-2 leading-snug">{title}</div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        {topicTitle && <div className="font-medium text-ink">{topicTitle}</div>}
        <p className={`text-sm text-ash line-clamp-2 ${topicTitle ? "mt-1" : ""}`}>{tagline}</p>
        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-ash">
          <span>{footerLeft}</span>
          <span>{footerRight}</span>
        </div>
        <div className="text-xs text-ash mt-1 truncate">{note}</div>
        {noteBadge && (
          <div className="text-[11px] text-gblue font-medium mt-0.5 truncate">{noteBadge}</div>
        )}
      </div>
    </Link>
  );
}
