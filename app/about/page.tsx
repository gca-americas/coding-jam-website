import Link from "next/link";
import Timeline from "@/components/Timeline";
import HowItWorks from "@/components/HowItWorks";
import { SPEC_TALK_QUESTIONS, TRACKS } from "@/lib/tracks";

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dotted-bg opacity-50" />
        <div className="container-page relative py-20 sm:py-24">
          <Link href="/" className="inline-flex items-center gap-1.5 text-ash text-sm hover:text-ink">
            ← Back to home
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-gblue" /> About the initiative
          </div>
          <h1 className="h-display text-5xl sm:text-7xl mt-6 max-w-3xl leading-[1.02]">
            A jam session.<br />
            Not a <span className="text-gred">hackathon</span>.
          </h1>
          <p className="mt-6 text-lg text-ash max-w-2xl">
            GDG Coding Jams transform standard tech meetups into vibrant, hands-on community sandboxes where
            developers actually <em>build</em> together. Two hours, a slice of pizza, Google&rsquo;s AI stack — and a
            real prototype walking out the door.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#lineup" className="btn-google">Browse the lineup</Link>
            <Link href="/organizer" className="btn-ghost">I&rsquo;m an organizer</Link>
          </div>
        </div>
      </section>

      {/* How it works — the 30-second visual explainer */}
      <HowItWorks />

      {/* The concept */}
      <section className="container-page pb-20">
        <div className="grid sm:grid-cols-3 gap-8 items-start">
          <div className="sm:col-span-1">
            <div className="section-eyebrow">Why it works</div>
            <h2 className="h-display text-3xl mt-2">A jam, not a hackathon.</h2>
            <p className="text-ash mt-4">
              Think of a musical jam or an after-work pottery class. Instruments out, a creative prompt, two hours
              of making something tangible alongside friends. We bring that energy to software.
            </p>
            <p className="text-ash mt-4">
              No sit-and-listen tech talks. No 48-hour competitive hackathon grind. Just blueprints, tech access,
              and collaborative space.
            </p>
          </div>
          <div className="sm:col-span-2 grid sm:grid-cols-3 gap-4">
            <ValueCard
              accent="bg-gblue"
              title="Frictionless upskilling"
              body="Developers learn Google's AI tools best when they're actively building. We remove the blank-page syndrome."
            />
            <ValueCard
              accent="bg-gred"
              title="Low organizer burden"
              body="Materials, timelines, and goals provided. Organizers book a room and bring the snacks."
            />
            <ValueCard
              accent="bg-ggreen"
              title="Stronger communities"
              body="Collaborative problem-solving builds a deeper network than passive networking ever does."
            />
          </div>
        </div>
      </section>

      {/* The Jam Session Kit */}
      <section className="bg-cloud border-y border-line">
        <div className="container-page py-20">
          <div className="grid sm:grid-cols-3 gap-10 items-start">
            <div className="sm:col-span-1">
              <div className="section-eyebrow">The Jam Session Kit</div>
              <h2 className="h-display text-3xl mt-2">Turnkey, by design.</h2>
              <p className="text-ash mt-4">
                A complete kit with starter code, frictionless API access, and an 8-track app curriculum. Every
                track ships with the same three ingredients.
              </p>
              <Link href="/organizer#kit" className="inline-flex items-center mt-4 text-sm font-medium text-gblue hover:underline">
                See the full kit →
              </Link>
            </div>
            <div className="sm:col-span-2 grid sm:grid-cols-3 gap-4">
              <KitTile color="bg-gblue" title="Starter repo" body="Scaffolded folder with context/, helper prompts, and pre-flight scripts." />
              <KitTile color="bg-gred" title="Codelab" body="A step-by-step guide that gets a participant from zero to a working app in 45 minutes." />
              <KitTile color="bg-ggreen" title="Spec Talk card" body="The 5 Spec Talk questions on one printable. Hang it in the room." />
            </div>
          </div>
        </div>
      </section>

      {/* The rhythm */}
      <section className="container-page py-20">
        <div className="grid sm:grid-cols-2 gap-12 items-start">
          <div>
            <div className="section-eyebrow">The rhythm of a jam</div>
            <h2 className="h-display text-3xl mt-2">Two hours, five movements.</h2>
            <p className="text-ash mt-4 max-w-md">
              Predictable, fast-paced, engaging. We keep the talking short and the building long. Organizers act as
              facilitators, guiding the room through a unified creative process.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="pill">⏱️ 2 hours</span>
              <span className="pill">🚀 Antigravity-powered</span>
              <span className="pill">🍕 Pizza included</span>
              <span className="pill">💻 Bring your laptop</span>
              <span className="pill">🎟️ Free</span>
            </div>
            <p className="mt-6 text-sm text-ash italic max-w-md border-l-2 border-line pl-3">
              The goal in the room is always to ship the <span className="font-medium not-italic text-ink">core
              feature in 45 minutes</span> — the one thing that proves the concept. Push toward the polished
              version on your own time.
            </p>
          </div>
          <Timeline />
        </div>
      </section>

      {/* The Spec Talk */}
      <section className="bg-cloud border-y border-line">
        <div className="container-page py-20">
          <div className="grid sm:grid-cols-2 gap-12 items-start">
            <div>
              <div className="section-eyebrow">The Spec Talk</div>
              <h2 className="h-display text-3xl mt-2">
                The skill participants take home.
              </h2>
              <p className="text-ash mt-4">
                The apps are how the room practices. The <span className="font-medium text-ink">Spec Talk</span> is
                what participants take home. Two minutes of structured talking — five questions, a sharpie, and a
                projector — shapes the next 45 minutes of building.
              </p>
              <p className="text-ash mt-3">
                Eight reps over eight tracks. The apps are the practice; the Spec Talk is the muscle. By Track 8,
                participants are running it solo on their own original ideas.
              </p>
              <p className="text-ash mt-3">
                In Antigravity, the Spec Talk becomes the PRD — and the PRD generates the UI doc, the engineering
                doc, and the code. The <span className="font-medium text-ink">fix-the-doc-not-the-code</span> loop
                starts here.
              </p>
              <p className="mt-4 text-sm text-ash italic border-l-2 border-line pl-3">
                &ldquo;Demo first, theory never&rdquo; — participants see something cool, then build their version.
                No lectures on tool calls or prompt engineering.
              </p>
            </div>
            <ol className="card divide-y divide-line">
              {SPEC_TALK_QUESTIONS.map((q) => (
                <li key={q.n} className="flex gap-4 px-5 py-4">
                  <div className="shrink-0 h-9 w-9 rounded-lg bg-cloud text-ink flex items-center justify-center font-display font-bold">
                    {q.n}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-semibold text-ink">{q.name}</div>
                    <div className="text-sm text-ash mt-0.5">{q.ask}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Independence + optional throughline */}
      <section className="container-page py-20">
        <div className="grid sm:grid-cols-2 gap-12 items-start">
          <div>
            <div className="section-eyebrow">Independent by design</div>
            <h2 className="h-display text-3xl mt-2">Eight standalone apps. Pick any one.</h2>
            <p className="text-ash mt-4">
              Every track is a complete, drop-in project that ships in two hours. They don&rsquo;t depend on each
              other. Start with whichever sounds most fun for your community.
            </p>
            <p className="text-ash mt-3">
              <span className="font-medium text-ink">Shared skill, not shared codebase.</span> The Spec Talk is the
              connective tissue — eight reps over eight tracks.
            </p>
            <div className="mt-6 card p-4 bg-cloud/40">
              <div className="text-xs uppercase tracking-widest font-semibold text-ash">Loose grouping (if curious)</div>
              <ul className="mt-2 text-sm text-ink space-y-1.5">
                <li><span className="font-mono text-xs text-ash mr-2">01–02</span> Image-gen pair — same tech, different prompt patterns</li>
                <li><span className="font-mono text-xs text-ash mr-2">03</span> The turn — from pretty things to organizing your life</li>
                <li><span className="font-mono text-xs text-ash mr-2">04–07</span> Language-driven utility</li>
                <li><span className="font-mono text-xs text-ash mr-2">08</span> Open canvas — graduation</li>
              </ul>
            </div>
          </div>
          <ol className="card divide-y divide-line">
            {TRACKS.map((t, i) => {
              const accents = ["bg-gblue", "bg-gred", "bg-gyellow", "bg-ggreen"];
              const dot = accents[i % 4];
              return (
                <ArcRow
                  key={t.slug}
                  label={t.number.toString().padStart(2, "0")}
                  body={`${t.project} — ${t.tagline}`}
                  color={dot}
                />
              );
            })}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-24">
        <div className="rounded-3xl overflow-hidden relative bg-ink">
          <div className="absolute inset-0 dotted-bg opacity-10" />
          <div className="relative p-10 sm:p-14 text-white grid sm:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="h-display text-3xl sm:text-4xl">Ready to jam?</h2>
              <p className="mt-3 text-white/80 max-w-md">
                Open any track and ship a working app in the next 45 minutes. Or grab the kit and host a jam in
                your city.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 sm:justify-end">
              <Link href="/#lineup" className="btn bg-white text-ink hover:shadow-pop">
                Browse the lineup
              </Link>
              <Link href="/organizer" className="btn border border-white/30 text-white hover:bg-white/10">
                Run a jam
              </Link>
            </div>
          </div>
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

function ValueCard({ accent, title, body }: { accent: string; title: string; body: string }) {
  return (
    <div className="card p-5">
      <div className={`h-2 w-10 rounded-full ${accent} mb-4`} />
      <div className="font-display font-semibold text-ink">{title}</div>
      <p className="text-sm text-ash mt-2 leading-relaxed">{body}</p>
    </div>
  );
}

function KitTile({ color, title, body }: { color: string; title: string; body: string }) {
  return (
    <div className="card p-5">
      <div className={`h-2 w-10 rounded-full ${color} mb-4`} />
      <div className="font-display font-semibold text-ink">{title}</div>
      <p className="text-sm text-ash mt-2 leading-relaxed">{body}</p>
    </div>
  );
}

function ArcRow({ label, body, color }: { label: string; body: string; color: string }) {
  return (
    <li className="flex items-center gap-4 px-5 py-3.5">
      <span className={`h-2 w-2 rounded-full shrink-0 ${color}`} />
      <span className="text-xs font-mono font-semibold text-ash w-12 shrink-0">{label}</span>
      <span className="text-sm text-ink">{body}</span>
    </li>
  );
}
