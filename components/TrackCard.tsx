import Link from "next/link";
import { Track, colorClasses, trackLabel } from "@/lib/tracks";

export default function TrackCard({ track }: { track: Track }) {
  const c = colorClasses[track.color];
  return (
    <Link
      href={`/tracks/${track.slug}`}
      className="card card-hover overflow-hidden group flex flex-col"
    >
      <div className={`relative h-32 bg-gradient-to-br ${c.gradient} text-white p-5 flex items-start justify-between`}>
        <div>
          <div className="text-[11px] font-mono font-semibold tracking-widest uppercase opacity-90">
            Track {trackLabel(track.number)}
          </div>
          <div className="font-display font-bold text-xl mt-1 leading-tight">{track.project}</div>
        </div>
        <div className="text-4xl drop-shadow-sm">{track.emoji}</div>
        <div className="absolute -right-6 -bottom-8 text-[120px] leading-none font-display font-bold text-white/15 select-none">
          {track.number}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <p className="text-sm text-ash line-clamp-2">{track.tagline}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {track.tech.slice(0, 3).map((t) => (
            <span key={t} className={`chip ${c.chip}`}>{t}</span>
          ))}
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between">
          {track.dropIn ? (
            <span className="pill !text-ggreen !border-ggreen/30 !bg-ggreen/5">
              <span className="h-1.5 w-1.5 rounded-full bg-ggreen" /> Drop-in friendly
            </span>
          ) : <span />}
          <span className={`text-sm font-medium ${c.text} group-hover:translate-x-0.5 transition-transform`}>
            Open track →
          </span>
        </div>
      </div>
    </Link>
  );
}
