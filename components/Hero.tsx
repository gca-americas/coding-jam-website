import Link from "next/link";
import VideoPoster from "./VideoPoster";

// Swap this constant to feature a different track's video in the hero.
const HERO_VIDEO_ID = "dpzHIClbkyI"; // Track 4 — Fridge to Recipe
const HERO_VIDEO_TITLE = "Fridge to Recipe — demo";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 dotted-bg opacity-50" />
      <div className="container-page relative pt-16 pb-16 sm:pt-24 sm:pb-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft hover:shadow-lift hover:text-ink transition-all"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-ggreen animate-pulse" />
              <span>8 independent jams for GDG communities · What&rsquo;s a Coding Jam? →</span>
            </Link>
            <h1 className="h-display text-5xl sm:text-7xl mt-6 leading-[1.02]">
              Build with AI.<br />
              <GoogleColoredWord word="Together" />.<br />
              In two hours.
            </h1>
            <p className="mt-6 text-lg text-ash max-w-2xl">
              Pick any track. Open the kit. Ship a real AI prototype before the pizza gets cold.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#lineup" className="btn-google">
                Jump to the lineup ↓
              </Link>
              <Link href="/showcase" className="btn-tonal">
                See community builds
              </Link>
              <Link href="/organizer" className="btn-text">
                I&rsquo;m an organizer
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
              <Stat label="8 weekly jams" dotColor="bg-gblue" />
              <Stat label="2hr per session" dotColor="bg-gred" />
              <Stat label="Antigravity-driven" dotColor="bg-gyellow" />
              <Stat label="∞ drop-ins welcome" dotColor="bg-ggreen" />
            </div>
          </div>

          <div className="lg:col-span-5">
            <VideoPoster id={HERO_VIDEO_ID} title={HERO_VIDEO_TITLE} />
            <p className="mt-3 text-xs text-ash text-center sm:text-left">
              ↑ Track 4 demo. <Link href="/#lineup" className="text-gblue hover:underline">All 8 →</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, dotColor }: { label: string; dotColor: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-line text-sm text-ink">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}

/** Renders each letter in one of the four Google brand colors, like the Google logo. */
function GoogleColoredWord({ word }: { word: string }) {
  const colors = ["text-gblue", "text-gred", "text-gyellow", "text-gblue", "text-ggreen", "text-gred", "text-gyellow", "text-ggreen"];
  return (
    <span>
      {word.split("").map((ch, i) => (
        <span key={i} className={colors[i % colors.length]}>
          {ch}
        </span>
      ))}
    </span>
  );
}
