import path from "node:path";
import Link from "next/link";
import StepMedia from "./StepMedia";
import { imageSize, type ImageSize } from "./imageSize";

/**
 * Shared frame for the two tool setup guides.
 *
 * Both pages are placeholders for now — the shell and the routes exist so the
 * homepage picker has somewhere real to send people, and so filling in the
 * steps later is an edit rather than a new page.
 */
export type ChecklistItem = {
  title: string;
  body: string;
  /** Tailwind bg-* class for the number chip. */
  color: string;
  /** Where to actually get the thing, when the item is a download. */
  link?: { href: string; label: string };
};

export type ChecklistGroup = {
  heading: string;
  note?: string;
  items: ChecklistItem[];
};

export type GuideStep = {
  title: string;
  body: string;
  /** Console link this step sends you to, if any. */
  href?: string;
  /**
   * Screen capture for the step, as a path under public/.
   * Until the file lands, a labelled placeholder renders in its place naming
   * the exact path to drop it at — so the gap is visible rather than a broken
   * image, and it disappears on its own once the file exists.
   *
   * No dimensions here on purpose: they're read from the file itself at build
   * time, so re-recording a capture at a different size is a drop-in with no
   * code to update. `kind` only labels the placeholder.
   */
  media?: { src: string; alt: string; kind: "PNG" | "GIF" };
};

/**
 * Real pixel size of a capture, or null when the file isn't there yet.
 * Doubles as the exists check — no size, no image, show the placeholder.
 */
function publicImageSize(src: string): ImageSize | null {
  return imageSize(path.join(process.cwd(), "public", src.replace(/^\//, "")));
}

export default function ToolGuideShell({
  eyebrow,
  emoji,
  title,
  tagline,
  forWhom,
  accent,
  checklist,
  notice,
  codelab,
  steps,
  otherHref,
  otherLabel,
}: {
  eyebrow: string;
  emoji: string;
  title: string;
  tagline: string;
  forWhom: string;
  /** Tailwind bg-* class for the hero band. */
  accent: string;
  /** What to install before the day. Real content, unlike `steps`. */
  checklist: ChecklistGroup[];
  /** Big "start here" callout at the foot of the page. Omit for tools without one. */
  codelab?: { href: string; heading: string; blurb: string };
  /** Warning above the checklist, for gotchas that change what people do. */
  notice?: { heading: string; body: React.ReactNode };
  steps: GuideStep[];
  otherHref: string;
  otherLabel: string;
}) {
  return (
    <>
      <section className={`relative overflow-hidden ${accent} text-white`}>
        <div className="absolute inset-0 dotted-bg opacity-20" />
        <div className="container-page relative py-16 sm:py-20">
          <Link href="/#jams" className="inline-flex items-center gap-1.5 text-white/80 text-sm hover:text-white">
            ← Back to the jams
          </Link>
          <div className="mt-6 text-xs font-mono font-semibold tracking-[0.2em] uppercase opacity-90">
            {eyebrow}
          </div>
          <h1 className="h-display text-4xl sm:text-6xl mt-3 leading-[1.05]">
            {emoji} {title}
          </h1>
          <p className="mt-5 text-lg opacity-90 max-w-2xl">{tagline}</p>
          <div className="mt-6 inline-flex items-start gap-2 rounded-xl bg-white/10 backdrop-blur border border-white/20 px-4 py-3 max-w-2xl">
            <span className="text-sm">👤</span>
            <p className="text-sm opacity-95">{forWhom}</p>
          </div>
        </div>
      </section>

      <section className="container-page py-14 grid lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2">
          <div className="section-eyebrow">Before you arrive</div>
          <h2 className="h-display text-3xl mt-2">A pre-flight checklist.</h2>
          <p className="text-ash mt-3 max-w-2xl">
            Do this at home, on decent wifi. Half the workshop time is otherwise lost to setup —
            this gives it back. Turning up without it is still fine; pair with a TA.
          </p>

          {notice && (
            <div className="rounded-xl border border-gyellow/50 bg-gyellow/10 p-5 mt-6">
              <div className="font-display font-semibold text-ink">{notice.heading}</div>
              <div className="text-sm text-ink/90 mt-2 leading-relaxed space-y-2">{notice.body}</div>
            </div>
          )}

          {checklist.map((group) => (
            <div key={group.heading} className="mt-8">
              <div className="flex items-baseline gap-3 flex-wrap">
                <h3 className="font-display font-bold text-lg text-ink">{group.heading}</h3>
                {group.note && <span className="text-xs text-ash">{group.note}</span>}
              </div>
              <ol className="card divide-y divide-line mt-3">
                {group.items.map((item, i) => (
                  <li key={item.title} className="flex gap-4 px-5 py-4">
                    <div
                      className={`shrink-0 h-9 w-9 rounded-lg ${item.color} text-white flex items-center justify-center font-display font-bold`}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-semibold text-ink">{item.title}</div>
                      <p className="text-sm text-ash mt-1 leading-relaxed">{item.body}</p>
                      {item.link && (
                        <a
                          href={item.link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-gblue hover:underline"
                        >
                          {item.link.label} ↗
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}

          <div className="section-eyebrow mt-12">The walkthrough</div>
          <h2 className="h-display text-2xl mt-2">What you&rsquo;ll do, step by step.</h2>

          <ol className="mt-6 space-y-5">
            {steps.map((s, i) => {
              const size = s.media ? publicImageSize(s.media.src) : null;
              return (
                <li key={s.title} className="card p-5">
                  <div className="flex gap-4">
                    <span className="font-display font-bold text-2xl text-ash tabular-nums shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium text-ink">{s.title}</div>
                      <p className="text-sm text-ash mt-1 leading-relaxed">{s.body}</p>
                      {s.href && (
                        <a
                          href={s.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-gblue hover:underline mt-2 inline-block break-all"
                        >
                          {s.href} ↗
                        </a>
                      )}
                    </div>
                  </div>

                  {s.media &&
                    (size ? (
                      <StepMedia
                        src={s.media.src}
                        alt={s.media.alt}
                        width={size.width}
                        height={size.height}
                      />
                    ) : (
                      <div
                        /* 16:9 — the shape a screen capture usually lands in,
                           and all we can guess before the file exists. */
                        className="mt-4 aspect-video w-full rounded-xl border-2 border-dashed border-line bg-cloud/50 p-6 text-center flex flex-col items-center justify-center"
                      >
                        <div className="text-2xl">{s.media.kind === "GIF" ? "🎞️" : "🖼️"}</div>
                        <div className="text-sm font-medium text-ink mt-2">
                          {s.media.kind} goes here
                        </div>
                        <p className="text-xs text-ash mt-1">{s.media.alt}</p>
                        <code className="inline-block mt-3 text-[11px] font-mono bg-white border border-line rounded px-2 py-1 text-ash break-all">
                          public{s.media.src}
                        </code>
                      </div>
                    ))}
                </li>
              );
            })}
          </ol>
        </div>

        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          <div className="card p-6">
            <div className="section-eyebrow">Not sure yet?</div>
            <p className="text-sm text-ink mt-2 leading-relaxed">
              The two tools suit different rooms. If this one doesn&rsquo;t sound like you, the other
              probably does.
            </p>
            <Link href={otherHref} className="btn-ghost w-full mt-4 text-center block !py-2 text-sm">
              {otherLabel}
            </Link>
            <Link href="/#jams" className="text-sm text-gblue hover:underline mt-3 inline-block">
              Retake the picker →
            </Link>
          </div>

          <div className="card p-6 bg-cloud/50">
            <div className="text-xs uppercase tracking-widest font-semibold text-ash">
              Running the jam?
            </div>
            <p className="text-sm text-ink mt-2 leading-relaxed">
              Put whichever tool you&rsquo;ve chosen in the event description, so people arrive with
              it ready instead of installing during the session.
            </p>
            <Link href="/organizer" className="text-sm text-gblue hover:underline mt-3 inline-block">
              The organizer kit →
            </Link>
          </div>
        </aside>
      </section>

      {codelab && (
        <section className="container-page pb-20">
          <a
            href={codelab.href}
            target="_blank"
            rel="noreferrer"
            className="group block rounded-3xl overflow-hidden relative bg-ink text-white hover:shadow-lift transition-shadow"
          >
            <div className="absolute inset-0 dotted-bg opacity-10" />
            <div className="relative p-8 sm:p-12 grid md:grid-cols-[1fr,auto] gap-8 items-center">
              <div>
                <div className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-white/70">
                  Don&rsquo;t know where to start?
                </div>
                <h2 className="h-display text-3xl sm:text-5xl mt-3 leading-[1.05]">
                  {codelab.heading}
                </h2>
                <p className="mt-4 text-white/80 max-w-xl text-lg">{codelab.blurb}</p>
              </div>
              <span className="btn bg-white text-ink group-hover:shadow-pop shrink-0 text-base">
                Open the codelab ↗
              </span>
            </div>
            <div className="relative grid grid-cols-4 h-2">
              <div className="bg-gblue" />
              <div className="bg-gred" />
              <div className="bg-gyellow" />
              <div className="bg-ggreen" />
            </div>
          </a>
        </section>
      )}
    </>
  );
}
