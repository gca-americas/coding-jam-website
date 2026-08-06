import Link from "next/link";
import Hero from "@/components/Hero";
import ChapterBoard from "@/components/ChapterBoard";
import CountryBoard from "@/components/CountryBoard";
import BuildMarquee from "@/components/BuildMarquee";
import HomeJams from "./HomeJams";
import ToolPicker from "./ToolPicker";
import { TRACKS } from "@/lib/tracks";
import {
  listProjects,
  chapterStats,
  countryStats,
  jamSubmissionCounts,
  sampleRecent,
} from "@/lib/projects";
import { listPublishedJams, toPublicJam } from "@/lib/jams";

// The featured sample is drawn per request. Without this the page could be
// rendered once at build time and show the same six builds forever.
export const dynamic = "force-dynamic";

const MARQUEE_BUILDS = 20;
/** Slots in the jams grid. Real jams first; built-in tracks fill the rest. */
const HOME_JAM_SLOTS = 10;

export default async function Home() {
  const [projects, publishedJams] = await Promise.all([listProjects(), listPublishedJams()]);
  // A different twenty on every load, drawn from the most recent submissions —
  // so a build doesn't drop off the homepage the moment someone else ships.
  const reel = sampleRecent(projects, MARQUEE_BUILDS);
  const stats = chapterStats(projects).slice(0, 8);
  const countries = countryStats(projects);
  const jamCounts = jamSubmissionCounts(projects);

  // Filtering happens client-side, so hand over every published jam — stripped
  // of the organizer's email, since this crosses into the client payload.
  const jamsForClient = publishedJams.map(toPublicJam);

  // Built-in tracks that top up an unfiltered grid. Tracks a jam is already
  // running are left out so the same topic never appears twice.
  const runningSlugs = new Set(
    publishedJams.map((j) => (j.topic.kind === "track" ? j.topic.trackSlug : null)).filter(Boolean),
  );
  const readyMade = TRACKS.filter((t) => !runningSlugs.has(t.slug))
    .slice(0, HOME_JAM_SLOTS)
    .map((t) => ({
      slug: t.slug,
      number: t.number,
      project: t.project,
      tagline: t.tagline,
      emoji: t.emoji,
      color: t.color,
    }));

  const trackBuilds: Record<number, number> = {};
  for (const p of projects) trackBuilds[p.trackNumber] = (trackBuilds[p.trackNumber] ?? 0) + 1;

  return (
    <>
      <Hero />

      {/* Builds in motion — a reel of what the community actually shipped. Sits
          right under the Hero so the "pitch → proof" rhythm reads top-to-bottom. */}
      {reel.length > 0 && (
        <section className="bg-white pb-12 sm:pb-16">
          <div className="container-page flex items-end justify-between gap-4 flex-wrap mb-5">
            <div>
              <div className="section-eyebrow">Straight from the rooms</div>
              <h2 className="h-display text-2xl sm:text-3xl mt-1">What builders shipped</h2>
            </div>
            <Link href="/showcase" className="text-sm text-gblue hover:underline shrink-0">
              Browse all builds →
            </Link>
          </div>
          <BuildMarquee projects={reel} />
        </section>
      )}

      {/* Pick your tool — the thing people get wrong before they even arrive */}
      <section className="bg-cloud border-y border-line">
        <div className="container-page py-16 sm:py-20">
          <ToolPicker />
        </div>
      </section>

      {/* The jams organizers are running, topped up with ready-made tracks.
          The Hero's primary CTA anchors here; scroll-mt clears the sticky nav. */}
      <section id="jams" className="container-page py-16 sm:py-20 scroll-mt-20">
        <HomeJams
          jams={jamsForClient}
          readyMade={readyMade}
          jamBuilds={Object.fromEntries(jamCounts)}
          trackBuilds={trackBuilds}
          slots={HOME_JAM_SLOTS}
        />
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-ash">
          <p>Running one at your chapter? Publish a page for it in a couple of minutes.</p>
          <Link href="/organizer" className="text-gblue hover:underline">
            Run a jam →
          </Link>
        </div>
      </section>

      {/* Where the builds are coming from */}
      <section className="container-page pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-2 gap-6">
          <ChapterBoard stats={stats} />
          <CountryBoard stats={countries} limit={10} />
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-24">
        <div className="rounded-3xl overflow-hidden relative bg-ink">
          <div className="absolute inset-0 dotted-bg opacity-10" />
          <div className="relative p-10 sm:p-14 text-white grid sm:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="h-display text-3xl sm:text-4xl">Ready to bring this to your GDG?</h2>
              <p className="mt-3 text-white/80 max-w-md">
                The Jam Session Kit has everything: starter repos, the codelab, and demo videos.
                You bring the room and the pizza.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 sm:justify-end">
              <Link href="/organizer" className="btn bg-white text-ink hover:shadow-pop">
                Get the Kit
              </Link>
              <Link href="/submit" className="btn border border-white/30 text-white hover:bg-white/10">
                Share what you built
              </Link>
            </div>
          </div>
          {/* Google color bar — the brand signature without the rainbow gradient */}
          <div className="relative grid grid-cols-4 h-2">
            <div className="bg-gblue" />
            <div className="bg-gred" />
            <div className="bg-gyellow" />
            <div className="bg-ggreen" />
          </div>
        </div>
      </section>
    </>
  );
}
