import Link from "next/link";
import Hero from "@/components/Hero";
import ChapterBoard from "@/components/ChapterBoard";
import CountryBoard from "@/components/CountryBoard";
import BuildMarquee from "@/components/BuildMarquee";
import HomeJams from "./HomeJams";
import ToolPicker from "./ToolPicker";
import { TRACKS } from "@/lib/tracks";
import { getCopy, getT } from "@/lib/i18n";
import { localizeTracks, localizeTopicView } from "@/lib/i18n/tracks";
import { G_COLORS, topicView, type TopicView } from "@/lib/topic";
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

function randomPermutation<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function Home() {
  const t = await getT();
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
  // Built-in topics lead, then the two drop-in projects. Before the catalog
  // moved to topics this was TRACKS alone, which now holds only two entries —
  // so the grid rendered two cards instead of filling its ten slots.
  // One catalog: open tracks first, then the drop-in projects.
  const localizedTracks = await localizeTracks(TRACKS);

  // Randomize the Google color palette across cards on the homepage so the grid
  // displays a vibrant, ever-changing mix without monochromatic rows or adjacent collisions.
  const palette = randomPermutation(G_COLORS);

  const readyMade = localizedTracks
    .filter((t) => !runningSlugs.has(t.slug))
    .slice(0, HOME_JAM_SLOTS)
    .map((t, idx) => ({
      slug: t.slug,
      number: t.number,
      project: t.name,
      tagline: t.summary,
      emoji: t.emoji,
      color: palette[(publishedJams.length + idx) % palette.length],
      href: `/tracks/${t.slug}`,
      eyebrow: undefined,
    }));

  // Every card's topic prose, translated once here — JamCard renders inside a
  // client component and can't reach the server-only catalogue itself.
  const jamViews: Record<string, TopicView> = {};
  for (let i = 0; i < publishedJams.length; i++) {
    const jam = publishedJams[i];
    const view = await localizeTopicView(topicView(jam.topic));
    view.color = palette[i % palette.length];
    jamViews[jam.slug] = view;
  }

  const pickerCopy = await getCopy(["tools."]);
  const jamsCopy = await getCopy(["home.jams.", "card."]);

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
              <div className="section-eyebrow">{t("home.reel.eyebrow")}</div>
              <h2 className="h-display text-2xl sm:text-3xl mt-1">{t("home.reel.title")}</h2>
            </div>
            <Link href="/showcase" className="text-sm text-gblue hover:underline shrink-0">
              {t("home.reel.all")}
            </Link>
          </div>
          <BuildMarquee projects={reel} />
        </section>
      )}

      {/* Pick your tool — the thing people get wrong before they even arrive */}
      <section className="bg-cloud border-y border-line">
        <div className="container-page py-16 sm:py-20">
          <ToolPicker copy={pickerCopy} />
        </div>
      </section>

      {/* The jams organizers are running, topped up with ready-made tracks.
          The Hero's primary CTA anchors here; scroll-mt clears the sticky nav. */}
      <section id="jams" className="container-page py-16 sm:py-20 scroll-mt-20">
        <HomeJams
          copy={jamsCopy}
          jams={jamsForClient}
          readyMade={readyMade}
          jamBuilds={Object.fromEntries(jamCounts)}
          trackBuilds={trackBuilds}
          views={jamViews}
          slots={HOME_JAM_SLOTS}
        />
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-ash">
          <p>{t("home.runOne.body")}</p>
          <Link href="/organizer" className="text-gblue hover:underline">
            {t("home.runOne.cta")}
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
              <h2 className="h-display text-3xl sm:text-4xl">{t("home.cta.title")}</h2>
              <p className="mt-3 text-white/80 max-w-md">
                {t("home.cta.body")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 sm:justify-end">
              <Link href="/organizer" className="btn bg-white text-ink hover:shadow-pop">
                {t("home.cta.kit")}
              </Link>
              <Link href="/submit" className="btn border border-white/30 text-white hover:bg-white/10">
                {t("home.cta.share")}
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
