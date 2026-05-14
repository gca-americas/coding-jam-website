import Link from "next/link";
import Hero from "@/components/Hero";
import TrackCard from "@/components/TrackCard";
import ProjectCard from "@/components/ProjectCard";
import ChapterBoard from "@/components/ChapterBoard";
import { TRACKS } from "@/lib/tracks";
import { listProjects, chapterStats } from "@/lib/projects";

export default async function Home() {
  const projects = await listProjects();
  const featured = projects.slice(0, 6);
  const stats = chapterStats(projects).slice(0, 8);

  return (
    <>
      <Hero />

      {/* The Lineup — the main event */}
      <section id="lineup" className="container-page py-16 sm:py-20 scroll-mt-20">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-3">
          <div>
            <div className="section-eyebrow">The Lineup</div>
            <h2 className="h-display text-3xl sm:text-4xl mt-2">Eight jams. Open any one.</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/about" className="btn-ghost text-sm">New here? →</Link>
            <Link href="/showcase" className="btn-ghost text-sm">Community builds →</Link>
          </div>
        </div>
        <div className="card !bg-cloud/60 !border-line p-4 sm:p-5 mb-8 flex flex-wrap items-center gap-3">
          <span className="chip bg-ggreen/10 text-ggreen ring-1 ring-ggreen/30 shrink-0">
            🔀 No order required
          </span>
          <p className="text-sm text-ink">
            Every track is a complete, standalone jam. Start with whichever sounds fun — they don&rsquo;t depend on
            each other.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TRACKS.map((t) => (
            <TrackCard key={t.slug} track={t} />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-ash">
          <p>Each track ships a working app.</p>
          <Link href="/about" className="text-gblue hover:underline">
            How a Coding Jam works →
          </Link>
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
        <div className="rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gblue via-ggreen to-gyellow opacity-95" />
          <div className="absolute inset-0 dotted-bg opacity-40" />
          <div className="relative p-10 sm:p-14 text-white grid sm:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="h-display text-3xl sm:text-4xl">Ready to bring this to your GDG?</h2>
              <p className="mt-3 text-white/90 max-w-md">
                The Jam Session Kit has everything: starter repos, slides, INSTRUCTIONS, doctrine cards, and a
                deploy script. You bring the room and the pizza.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 sm:justify-end">
              <Link href="/organizer" className="btn bg-white text-ink hover:shadow-pop">
                Get the Kit
              </Link>
              <Link href="/submit" className="btn border border-white/40 text-white hover:bg-white/10">
                Share what you built
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
