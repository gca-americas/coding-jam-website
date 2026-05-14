import Link from "next/link";
import Timeline from "@/components/Timeline";
import { TRACKS, colorClasses, trackLabel, SPEC_TALK_QUESTIONS } from "@/lib/tracks";

export default function OrganizerPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 diag-bg" />
        <div className="container-page relative py-20 sm:py-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-gred" /> For organizers
          </div>
          <h1 className="h-display text-5xl sm:text-6xl mt-6 max-w-3xl leading-[1.05]">
            Run a Coding Jam in your city.
          </h1>
          <p className="mt-5 text-lg text-ash max-w-2xl">
            Hosting a Coding Jam is one of the best ways to connect the builders in your community — a room of
            developers leaves with a working app, a new collaborator, and someone to text the next time they get
            stuck. Bring the room; the kit brings the rest.{" "}
            <span className="text-ink font-medium">From planning to execution in 2 weeks.</span>
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#kit" className="btn-google">Get the Jam Session Kit</a>
            <a href="#timeline" className="btn-ghost">Pre-workshop timeline</a>
            <a href="#per-session" className="btn-ghost">Per-session structure</a>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section id="kit" className="container-page py-20 scroll-mt-20">
        <div className="section-eyebrow">The Jam Session Kit</div>
        <h2 className="h-display text-3xl mt-2">Everything in the box.</h2>
        <p className="text-ash mt-3 max-w-2xl">
          Each track ships with a starter, a Codelab, a slide deck outline, and a Spec Talk card. You facilitate;
          the kit handles the rest. Pick any track to host — they&rsquo;re independent.
        </p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KitCard
            color="bg-gblue"
            title="Starter repo"
            body="Scaffolded folder with context/, helper prompts, and pre-flight scripts. No solution code — participants build their own version."
          />
          <KitCard
            color="bg-gred"
            title="Codelab"
            body="A step-by-step guide that gets a participant from zero to a working app in 45 minutes. Drop-in friendly. Tested before doors open."
          />
          <KitCard
            color="bg-gyellow"
            title="Slide deck outline"
            body="8–12 slides per track. The demo cue, the Spec Talk frame, the handoff. You write the deck; we give the spine."
          />
          <KitCard
            color="bg-ggreen"
            title="Spec Talk card"
            body="The 5 Spec Talk questions on one printable. Hang it in the room. Walk through it on the projector with the room."
          />
        </div>
      </section>

      {/* The 2-hour standard schedule */}
      <section className="bg-cloud border-y border-line scroll-mt-20" id="timeline">
        <div className="container-page py-20 grid sm:grid-cols-2 gap-12">
          <div>
            <div className="section-eyebrow">The standard schedule</div>
            <h2 className="h-display text-3xl mt-2">Two hours. Five movements.</h2>
            <p className="text-ash mt-3">
              We keep the talking short and the building long. Organizers facilitate; the room creates. This shape
              repeats across every track — it&rsquo;s the muscle memory.
            </p>
            <div className="mt-6 space-y-4">
              <TipBox color="bg-gblue/10 text-gblue" label="Pro tip">
                Pre-warm the deploy target by pushing a hello-world before doors open. The first deploy of the
                night is usually the slowest.
              </TipBox>
              <TipBox color="bg-gred/10 text-gred" label="Watch out">
                Your demo is your most important deliverable. Practice it once on the morning of, with the actual
                production stack you&rsquo;ll use on stage.
              </TipBox>
            </div>
          </div>
          <Timeline />
        </div>
      </section>

      {/* The Spec Talk */}
      <section className="container-page py-20">
        <div className="grid sm:grid-cols-2 gap-12 items-start">
          <div>
            <div className="section-eyebrow">The Spec Talk</div>
            <h2 className="h-display text-3xl mt-2">The skill participants take home.</h2>
            <p className="text-ash mt-4">
              The 45-minute apps are how the room practices. The <span className="font-medium text-ink">Spec Talk</span> is what
              participants take home. Eight reps over eight tracks — by Track 8, they&rsquo;re running it solo on
              their own ideas.
            </p>
            <p className="text-ash mt-3">
              Each track puts the spotlight on one of the five questions. You&rsquo;ll find the per-track emphasis
              in the facilitator notes below.
            </p>
          </div>
          <ol className="card divide-y divide-line">
            {SPEC_TALK_QUESTIONS.map((q) => (
              <li key={q.n} className="flex gap-4 px-5 py-4">
                <div className="shrink-0 h-8 w-8 rounded-lg bg-cloud text-ink flex items-center justify-center font-display font-bold text-sm">
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
      </section>

      {/* Per-session structure */}
      <section className="bg-cloud border-y border-line scroll-mt-20" id="per-session">
        <div className="container-page py-20">
          <div className="section-eyebrow">Per-session structure</div>
          <h2 className="h-display text-3xl mt-2">A four-phase rhythm, every track.</h2>
          <div className="mt-8 grid sm:grid-cols-4 gap-4">
            <PhaseCard n="1" color="bg-gblue" time="10 min" title="Demo" body="You ship the track's app live. Participants watch, no laptops. The 'this is what's possible' moment." />
            <PhaseCard n="2" color="bg-gred" time="10 min" title="Spec Talk" body="Walk the room through the 5 questions on the projector. Highlight the question this track emphasizes." />
            <PhaseCard n="3" color="bg-gyellow" time="60-70 min" title="Build" body="Participants vibe code their version. You and TAs circulate. Help unblock; resist coding for them." />
            <PhaseCard n="4" color="bg-ggreen" time="20-30 min" title="Compare Notes" body="3 volunteer screen-shares. Celebrate the messy, the brilliant, the half-finished. Tease the polished version." />
          </div>
        </div>
      </section>

      {/* Pre-workshop timeline */}
      <section className="container-page py-20">
        <div className="section-eyebrow">Pre-workshop preparation</div>
        <h2 className="h-display text-3xl mt-2">From decision to doors-open.</h2>
        <div className="mt-10 grid sm:grid-cols-3 gap-6">
          <PrepBlock
            when="T-4 weeks"
            color="border-l-gblue"
            items={[
              "Lock workshop dates",
              "Recruit TAs — 1 per 30 attendees",
              "Set up the Wall of Vibes shared doc",
              "Pre-provision the AI API account with billing",
              "Verify image-gen + LLM API access",
            ]}
          />
          <PrepBlock
            when="T-1 week (per track)"
            color="border-l-gred"
            items={[
              "Run the Codelab end-to-end yourself, time it",
              "Practice your demo with the real stack",
              "Fix friction points found",
              "Tease the track on social",
              "Internal dry-run with TAs",
            ]}
          />
          <PrepBlock
            when="Day-of"
            color="border-l-ggreen"
            items={[
              "30-min facilitator setup before doors open",
              "Pre-warm the deploy target (push hello-world)",
              "Codelab and starter repo URL on slide",
              "Wall of Vibes link visible",
              "Pizza, water, name tags",
            ]}
          />
        </div>
      </section>

      {/* Watch for */}
      <section className="bg-cloud border-y border-line">
        <div className="container-page py-20 grid sm:grid-cols-2 gap-10">
          <div>
            <div className="section-eyebrow text-ggreen">Signs the methodology is landing</div>
            <ul className="mt-4 space-y-3">
              {[
                "Participants quote the Spec Talk question they emphasized today",
                "Someone says 'wait, that's a polished-version feature' mid-build",
                "Drop-ins on later tracks are running the Spec Talk confidently",
                "At Compare Notes, the variations between participants are wide",
              ].map((s) => (
                <li key={s} className="flex gap-2 text-ink">
                  <span className="text-ggreen font-bold">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="section-eyebrow text-gred">Signs it&rsquo;s not landing</div>
            <ul className="mt-4 space-y-3">
              {[
                "Participants copy the demo verbatim instead of making it theirs",
                "Builds keep slipping past 45 minutes because everyone added more features",
                "At Compare Notes, every project looks the same",
                "Wall of Vibes stays empty halfway through",
              ].map((s) => (
                <li key={s} className="flex gap-2 text-ink">
                  <span className="text-gred font-bold">!</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ash italic border-l-2 border-line pl-3">
              When you see the latter: pause, pull the Spec Talk card back up on the projector, and re-read the
              question this track emphasizes. The reset usually re-anchors the room.
            </p>
          </div>
        </div>
      </section>

      {/* Per-track facilitator notes */}
      <section className="container-page py-20">
        <div className="section-eyebrow">Per-track facilitator notes</div>
        <h2 className="h-display text-3xl mt-2">What to demo, what to coach, what to fish for.</h2>
        <p className="text-ash mt-3 max-w-2xl">
          Participants see the high-level rhythm. You see the Spec Talk emphasis, the line to listen for, and the
          polished-version pull-ins to tease at Compare Notes. Expand any track below.
        </p>

        <div className="mt-8 space-y-3">
          {TRACKS.map((t) => {
            const c = colorClasses[t.color];
            return (
              <details key={t.slug} className="card group overflow-hidden">
                <summary className="cursor-pointer flex items-center gap-4 p-5 hover:bg-cloud/40 transition-colors">
                  <div className={`shrink-0 h-12 w-12 rounded-xl ${c.bg} text-white flex items-center justify-center font-display font-bold`}>
                    {trackLabel(t.number)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-semibold text-ink">{t.project}</span>
                      <span className="text-ash text-sm hidden sm:inline">·</span>
                      <span className="text-ash text-sm truncate">{t.tagline}</span>
                    </div>
                    <div className="text-xs text-ash mt-0.5 italic truncate">
                      Listen for: &ldquo;{t.aha}&rdquo;
                    </div>
                  </div>
                  <span className="text-ash text-xl shrink-0 transition-transform group-open:rotate-45 select-none">+</span>
                </summary>

                <div className="border-t border-line p-5 sm:p-6 grid lg:grid-cols-2 gap-8">
                  {/* What you demo */}
                  <div>
                    <div className="section-eyebrow">The app you demo</div>
                    <p className="mt-2 text-sm text-ink leading-relaxed">{t.mmv}</p>

                    <div className="section-eyebrow mt-6">Spec Talk emphasis</div>
                    <p className="mt-2 text-sm text-ink leading-relaxed">{t.specTalkEmphasis}</p>
                  </div>

                  {/* Polished + ifStuck + links */}
                  <div>
                    <div className="section-eyebrow">Polished version (tease at Compare Notes)</div>
                    <ul className="mt-2 space-y-1.5">
                      {t.polished.map((p) => (
                        <li key={p} className="flex gap-2 items-start text-sm text-ink">
                          <span className={`mt-1.5 h-1 w-1 rounded-full shrink-0 ${c.bg}`} />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>

                    {t.ifStuck.length > 0 && (
                      <>
                        <div className="section-eyebrow mt-6">Stuck-participant safety nets</div>
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {t.ifStuck.map((f) => (
                            <li key={f}>
                              <code className="chip bg-cloud text-ink font-mono text-xs">{f}</code>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3 text-sm">
                      <a
                        href={t.codelabUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gblue hover:underline font-medium"
                      >
                        📘 Codelab ↗
                      </a>
                      <a
                        href={t.starterRepo}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ash hover:text-ink"
                      >
                        Starter repo ↗
                      </a>
                      <Link
                        href={`/tracks/${t.slug}`}
                        className="text-ash hover:text-ink"
                      >
                        Participant view ↗
                      </Link>
                    </div>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <section className="container-page py-20">
        <div className="card p-8 sm:p-12 text-center">
          <h2 className="h-display text-3xl">Got everything you need?</h2>
          <p className="text-ash mt-3 max-w-xl mx-auto">
            Open a track, grab the kit, and start preparing. Once you&rsquo;ve hosted, share what your room shipped
            on the showcase — it helps other GDGs get started.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/#lineup" className="btn-google">Browse the lineup</Link>
            <Link href="/showcase" className="btn-ghost">See the global showcase</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function KitCard({ color, title, body }: { color: string; title: string; body: string }) {
  return (
    <div className="card p-5">
      <div className={`h-2 w-10 rounded-full ${color} mb-4`} />
      <div className="font-display font-semibold text-ink">{title}</div>
      <p className="text-sm text-ash mt-2 leading-relaxed">{body}</p>
    </div>
  );
}

function PhaseCard({ n, color, time, title, body }: { n: string; color: string; time: string; title: string; body: string }) {
  return (
    <div className="card p-5 flex flex-col">
      <div className="flex items-center gap-2">
        <div className={`h-7 w-7 rounded-full ${color} text-white flex items-center justify-center font-display font-bold text-sm`}>{n}</div>
        <span className="text-xs font-mono text-ash">{time}</span>
      </div>
      <div className="font-display font-semibold text-ink mt-3">{title}</div>
      <p className="text-sm text-ash mt-1 leading-relaxed flex-1">{body}</p>
    </div>
  );
}

function PrepBlock({ when, color, items }: { when: string; color: string; items: string[] }) {
  return (
    <div className={`card p-5 border-l-4 ${color}`}>
      <div className="text-xs font-mono uppercase tracking-widest text-ash">{when}</div>
      <ul className="mt-3 space-y-2 text-sm text-ink">
        {items.map((i) => <li key={i} className="flex gap-2"><span className="text-ash">•</span><span>{i}</span></li>)}
      </ul>
    </div>
  );
}

function TipBox({ color, label, children }: { color: string; label: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <span className={`chip ${color}`}>{label}</span>
      <p className="text-sm text-ink mt-2 leading-relaxed">{children}</p>
    </div>
  );
}
