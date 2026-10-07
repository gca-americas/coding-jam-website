import Link from "next/link";
import { getT } from "@/lib/i18n";
import { TRACKS, colorClasses, trackLabel } from "@/lib/tracks";

/**
 * Track 09 is the "bring your own idea" option rather than a ready-made topic,
 * so it's neither a tile nor part of the count — that keeps the grid a clean
 * 4×2 and the chip honest about how many topics are actually written for you.
 */
/**
 * The tile grid. Built-in topics lead, then the drop-in projects — this was
 * TRACKS alone, which now holds two entries and rendered a two-tile grid.
 * "Build your own idea" is left out: the grid is for picking a subject.
 */
const READY_MADE = TRACKS.map((t) => ({
  slug: t.slug,
  href: `/tracks/${t.slug}`,
  label: t.name,
  emoji: t.emoji,
  color: t.color,
  badge: t.number !== undefined ? trackLabel(t.number) : "",
}));

export default async function Hero() {
  const t = await getT();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 dotted-bg opacity-50" />
      <div className="container-page relative pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft hover:shadow-lift hover:text-ink transition-all"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-ggreen animate-pulse" />
              <span>{t("hero.badge")}</span>
            </Link>
            <h1 className="font-display font-bold tracking-tight text-5xl sm:text-7xl mt-6 leading-[1.02] text-ink">
              {t("hero.title.line1")}<br />
              <GoogleColoredWord word={t("hero.title.together")} />
              {t("hero.title.afterTogether")}
              <br />
              {t("hero.title.line3")}
            </h1>
            <p className="mt-6 text-lg text-ash max-w-2xl">
              {t("hero.lede")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#jams" className="btn-google">
                {t("hero.cta.jams")}
              </Link>
              <Link href="/showcase" className="btn-tonal">
                {t("hero.cta.builds")}
              </Link>
              <Link href="/organizer" className="btn-text">
                {t("hero.cta.organizer")}
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              <Stat label={t("hero.chip.create")} dotColor="bg-gblue" />
              <Stat label={t("hero.chip.twoHours")} dotColor="bg-gred" />
              <Stat label={t("hero.chip.tools")} dotColor="bg-gyellow" />
              <Stat label={t("hero.chip.dropIn")} dotColor="bg-ggreen" />
            </div>
          </div>

          {/* 4×2 tile grid — fast-access navigator, doubles as visual balance for the headline. */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-4 gap-3">
              {READY_MADE.map((t) => {
                const c = colorClasses[t.color];
                return (
                  <Link
                    key={t.slug}
                    href={t.href}
                    aria-label={t.label}
                    className={`group relative aspect-square rounded-2xl ${c.bgSoft} border border-transparent hover:border-line hover:shadow-lift transition-all hover:-translate-y-1 hover:scale-[1.04] flex items-center justify-center overflow-hidden`}
                  >
                    <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform" aria-hidden>
                      {t.emoji}
                    </span>
                    {t.badge && (
                      <span className={`absolute top-1.5 left-2 text-[10px] font-mono font-bold tracking-widest ${c.text} opacity-80`}>
                        {t.badge}
                      </span>
                    )}
                    <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${c.bg} opacity-50 group-hover:opacity-100 transition-opacity`} />
                  </Link>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-ash text-center">
              {t("hero.tiles.hint")}
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
  const colors = [
    "text-gblue", "text-gred", "text-gyellow", "text-gblue",
    "text-ggreen", "text-gred", "text-gyellow", "text-ggreen",
  ];
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
