import Link from "next/link";
import { Track, colorClasses, trackLabel } from "@/lib/tracks";

export default function TrackCard({ track }: { track: Track }) {
  const c = colorClasses[track.color];
  return (
    <Link
      href={`/tracks/${track.slug}`}
      className="group relative flex flex-col rounded-3xl bg-white border border-line overflow-hidden hover:shadow-lift transition-all hover:-translate-y-0.5"
    >
      {/* Header — neutral by default; YouTube poster fades in on hover (preview-on-hover). */}
      <div className="relative p-5 flex items-start justify-between bg-white overflow-hidden min-h-[88px]">
        {track.youtubeId && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${track.youtubeId}/hqdefault.jpg`}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            {/* Gradient scrim so the text on the left stays readable when the thumbnail appears */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        )}
        <div className="relative">
          <div className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${c.text}`}>
            Track {trackLabel(track.number)}
          </div>
          <div className="font-display font-bold text-xl mt-1 leading-tight text-ink">{track.project}</div>
        </div>
        {/* Colored icon plate — fades out on hover so the thumbnail can breathe */}
        <div className={`relative shrink-0 h-14 w-14 rounded-2xl ${c.bgSoft} flex items-center justify-center text-3xl transition-opacity duration-300 group-hover:opacity-0`}>
          {track.emoji}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-5 flex-1 flex flex-col">
        <p className="text-sm text-ash leading-relaxed line-clamp-2">{track.tagline}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {track.tech.slice(0, 2).map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cloud border border-line text-[11px] font-medium text-ash"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
          {track.dropIn ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-ggreen font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-ggreen" />
              Drop-in friendly
            </span>
          ) : <span />}
          <span className={`text-sm font-medium ${c.text} group-hover:translate-x-0.5 transition-transform ml-auto`}>
            Open →
          </span>
        </div>
      </div>

      {/* Bottom accent bar — the track's color identity */}
      <div className={`h-1 ${c.bg}`} />
    </Link>
  );
}
