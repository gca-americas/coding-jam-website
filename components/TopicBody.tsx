import { colorClasses } from "@/lib/tracks";
import type { TopicView } from "@/lib/topic";

/**
 * The body of a jam page, rendered from the normalized TopicView.
 *
 * Shared by /jam/[slug] and the no-login builder at /jam/try so a page you
 * mock up anonymously looks exactly like the one you'd publish. Pure props, no
 * server imports — it renders on either side of the client boundary.
 */
export default function TopicBody({ view }: { view: TopicView }) {
  const c = colorClasses[view.color];
  return (
    <div className="space-y-8">
      {view.heroImageUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={view.heroImageUrl} alt="" className="rounded-2xl border border-line w-full" />
      )}

      {view.youtubeId && (
        <div className="aspect-video rounded-2xl overflow-hidden border border-line">
          <iframe
            src={`https://www.youtube.com/embed/${view.youtubeId}`}
            title="Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}

      {view.mmv && (
        <div>
          <div className="section-eyebrow">What ships today</div>
          <h2 className="h-display text-2xl mt-2">The version everyone leaves with.</h2>
          <Prose text={view.mmv} className="mt-3" />
        </div>
      )}

      {view.thinkAbout.length > 0 && (
        <div>
          <div className="section-eyebrow">While you build</div>
          <h2 className="h-display text-2xl mt-2">Things worth deciding early.</h2>
          <ul className="mt-4 space-y-3">
            {view.thinkAbout.map((t, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className={`h-6 w-6 rounded-full shrink-0 ${c.bgSoft} ${c.text} text-xs font-bold flex items-center justify-center`}
                >
                  {i + 1}
                </span>
                <span className="text-ink">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {view.polished.length > 0 && (
        <div>
          <div className="section-eyebrow">The polished version</div>
          <h2 className="h-display text-2xl mt-2">What the at-home build adds.</h2>
          <ul className="mt-4 grid sm:grid-cols-2 gap-2">
            {view.polished.map((p, i) => (
              <li key={i} className="text-sm text-ink flex gap-2">
                <span className="text-ash">→</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}

/**
 * Organizer-authored prose. Rendered as plain text split on blank lines —
 * never as HTML — since this is untrusted input on a public page.
 */
export function Prose({ text, className = "" }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n{2,}/).filter(Boolean);
  return (
    <div className={`space-y-3 ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-ink leading-relaxed whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}
