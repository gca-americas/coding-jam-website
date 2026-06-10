import Link from "next/link";
import Hero from "@/components/Hero";
import TrackCard from "@/components/TrackCard";
import ProjectCard from "@/components/ProjectCard";
import ChapterBoard from "@/components/ChapterBoard";
import DemoMarquee from "@/components/DemoMarquee";
import { TRACKS } from "@/lib/tracks";
import { listProjects, chapterStats } from "@/lib/projects";

export default async function Home() {
  const projects = await listProjects();
  const featured = projects.slice(0, 6);
  const stats = chapterStats(projects).slice(0, 8);

  return (
    <>
      <Hero />

      {/* Builds in motion — auto-cycling reel of all 8 demos. Sits right under
          the Hero so the "pitch → proof" rhythm reads top-to-bottom. */}
      <section className="bg-white pb-12 sm:pb-16">
        <DemoMarquee />
        <p className="container-page mt-3 text-xs text-ash text-center">
          ↑ Eight demos, on a loop. Hover to pause, click to watch.
        </p>
      </section>

      {/* The Lineup — the main event */}
      <section id="lineup" className="bg-cloud scroll-mt-20">
        <div className="container-page py-16 sm:py-20">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <div className="section-eyebrow">The Lineup</div>
              <h2 className="h-display text-3xl sm:text-4xl mt-2">Eight jams. Open any one.</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ggreen/10 text-ggreen text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-ggreen" />
              No order required
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRACKS.map((t) => (
              <div
                key={t.slug}
                className={t.number === 9 ? "sm:col-span-2 lg:col-span-4" : undefined}
              >
                <TrackCard track={t} wide={t.number === 9} />
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-ash">
            <p>Each track ships a working app.</p>
            <Link href="/about" className="text-gblue hover:underline">
              How a Coding Jam works →
            </Link>
          </div>
        </div>
      </section>

      {/* Hero board + featured projects */}
      <section className="container-page py-16 sm:py-20">
        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <ChapterBoard stats={stats} />
          </div>
          <div className="lg:col-span-3">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="section-eyebrow">Fresh from the jam</div>
                <h2 className="h-display text-2xl mt-1">What builders shipped</h2>
              </div>
              <Link href="/showcase" className="text-sm text-gblue hover:underline">
                All projects →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {featured.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
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
                The Jam Session Kit has everything: starter repos, the Antigravity codelab, Spec Talk card,
                and demo videos. You bring the room and the pizza.
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
