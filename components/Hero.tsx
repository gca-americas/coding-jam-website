import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 diag-bg" />
      <div className="absolute inset-0 dotted-bg opacity-60" />
      <div className="container-page relative pt-16 pb-16 sm:pt-24 sm:pb-20">
        <div className="max-w-3xl">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft hover:shadow-lift hover:text-ink transition-all"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-ggreen animate-pulse" />
            <span>8 independent jams for GDG communities · What&rsquo;s a Coding Jam? →</span>
          </Link>
          <h1 className="h-display text-5xl sm:text-7xl mt-6 leading-[1.02]">
            Build with AI.<br />
            <span className="gradient-text">Together.</span><br />
            In two hours.
          </h1>
          <p className="mt-6 text-lg text-ash max-w-2xl">
            Pick any track. Open the kit. Ship a real AI prototype before the pizza gets cold.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#lineup" className="btn-google">
              Jump to the lineup ↓
            </Link>
            <Link href="/showcase" className="btn-ghost">
              See community builds
            </Link>
            <Link href="/organizer" className="btn-ghost">
              I&rsquo;m an organizer
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ash">
            <Stat n="8" label="weekly jams" color="bg-gblue" />
            <Stat n="2hr" label="per session" color="bg-gred" />
            <Stat n="45 min" label="working app" color="bg-gyellow" />
            <Stat n="∞" label="drop-ins welcome" color="bg-ggreen" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label, color }: { n: string; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="font-display font-bold text-ink text-base">{n}</span>
      <span className="text-ash">{label}</span>
    </div>
  );
}
