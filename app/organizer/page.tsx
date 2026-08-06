import Image from "next/image";
import Link from "next/link";
import Timeline from "@/components/Timeline";
import CodelabPhases from "@/components/CodelabPhases";
import { TRACKS, colorClasses, trackLabel } from "@/lib/tracks";
import EmailTemplate from "@/components/EmailTemplate";
import {
  CREDITS_CONTACT,
  creditsRequestBody,
  creditsRequestSubject,
  participantEmailBody,
  participantEmailSubject,
} from "@/lib/email-templates";

export default function OrganizerPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dotted-bg opacity-50" />
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
            <Link href="/organizer/jams" className="btn-ghost">Set up your jam page</Link>
            <a href="#before-you-arrive" className="btn-ghost">Before you arrive</a>
            <a href="#timeline" className="btn-ghost">The session shape</a>
            <a href="#present-submit" className="btn-ghost">Present &amp; submit</a>
            <a href="#gotchas" className="btn-ghost">Common gotchas</a>
          </div>
        </div>
      </section>

      {/* The one thing organizers skip — so it goes first, not last */}
      <section className="container-page pb-4">
        <div className="rounded-3xl overflow-hidden relative bg-ink text-white">
          <div className="absolute inset-0 dotted-bg opacity-10" />
          <div className="relative p-8 sm:p-12 grid lg:grid-cols-[1fr,auto] gap-8 items-center">
            <div>
              <div className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-gyellow">
                Don&rsquo;t skip this one
              </div>
              <h2 className="h-display text-3xl sm:text-4xl mt-3 leading-[1.05]">
                Get every build submitted before people leave.
              </h2>
              <p className="mt-4 text-white/80 max-w-2xl text-lg">
                It takes each person about two minutes and it is the single highest-value thing you
                do all session. Once everyone walks out it never happens — half-finished prototypes
                go home on laptops and nobody sees them again.
              </p>
              <ul className="mt-5 space-y-2 text-white/80 text-sm max-w-2xl">
                <li className="flex gap-2">
                  <span className="text-gyellow shrink-0">→</span>
                  Your chapter shows up on the hero board and the country map.
                </li>
                <li className="flex gap-2">
                  <span className="text-gyellow shrink-0">→</span>
                  Every build is credited to your jam and to you as the lead.
                </li>
                <li className="flex gap-2">
                  <span className="text-gyellow shrink-0">→</span>
                  Builders earn badges, and get a page they can send to their manager.
                </li>
                <li className="flex gap-2">
                  <span className="text-gyellow shrink-0">→</span>
                  You get real numbers for the write-up and the chapter KPI.
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Link href="/submit" className="btn bg-white text-ink hover:shadow-pop text-center">
                See the submit form
              </Link>
              <Link
                href="/organizer/jams"
                className="btn border border-white/30 text-white hover:bg-white/10 text-center"
              >
                Get your jam&rsquo;s link
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

      {/* Before you arrive */}
      <section id="before-you-arrive" className="bg-cloud border-y border-line scroll-mt-20">
        <div className="container-page py-20 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <div className="section-eyebrow">Before you arrive</div>
            <h2 className="h-display text-3xl mt-2">A pre-flight checklist.</h2>
            <p className="text-ash mt-4">
              What people install depends on which tool they bring, so the checklists live with the
              tools. Link the right one in your event description — half the workshop time is
              otherwise lost to setup. Drop-ins without the prereqs are still welcome; pair them
              with a TA.
            </p>
            <p className="text-ash mt-3 text-sm italic border-l-2 border-line pl-3">
              Tip: pin the link in the RSVP email 48 hours before doors open, and re-share at T-2
              hours. Point undecided people at the picker on the home page.
            </p>
          </div>
          <div className="lg:col-span-2 space-y-5">
            {/* The participant-facing setup lives on the tool guides now — one
                copy, kept current, that organizers can link straight to. */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/tools/antigravity" className="card card-hover p-5 block">
                <div className="text-2xl">🚀</div>
                <div className="font-display font-semibold text-ink mt-2">Antigravity checklist</div>
                <p className="text-sm text-ash mt-1 leading-relaxed">
                  Antigravity, Git and a Gemini API key — plus uv, Node and disk-space extras.
                  For anyone bringing a laptop they already code on.
                </p>
                <span className="text-sm text-gblue mt-3 inline-block">See the checklist →</span>
              </Link>
              <Link href="/tools/ai-studio" className="card card-hover p-5 block">
                <div className="text-2xl">🎨</div>
                <div className="font-display font-semibold text-ink mt-2">AI Studio checklist</div>
                <p className="text-sm text-ash mt-1 leading-relaxed">
                  A browser and a Google account. For everyone who&rsquo;d rather not install
                  anything — which is a preference, not a limitation.
                </p>
                <span className="text-sm text-gblue mt-3 inline-block">See the checklist →</span>
              </Link>
            </div>

            <div className="card p-5">
              <div className="font-display font-semibold text-ink">
                Optional: GCP project + Google Cloud credits
              </div>
              <p className="text-sm text-ash mt-1 leading-relaxed">
                Your job, not theirs. Recommended when running an official GDG event — Google Cloud credits
                cover API spend and tie to the chapter KPI. Note they only apply to the{" "}
                <Link href="/tools/antigravity" className="text-gblue hover:underline">
                  Antigravity path
                </Link>
                , which bills through a Cloud project; anyone on AI Studio uses its free tier and
                needs nothing from you. Skip this entirely for casual jams.
              </p>
              <p className="text-sm text-ash mt-3 leading-relaxed">
                Ask the Developer Communities team at{" "}
                <a href={`mailto:${CREDITS_CONTACT}`} className="text-gblue hover:underline font-medium">
                  {CREDITS_CONTACT}
                </a>
                . Give them a date, a headcount and your GCP project ID — the draft below has the
                shape they expect.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <EmailTemplate
                  variant="google"
                  label="Draft the credits request"
                  title="Requesting Google Cloud credits"
                  blurb={`Goes to ${CREDITS_CONTACT}. Fill in the bracketed lines before sending.`}
                  to={CREDITS_CONTACT}
                  subject={creditsRequestSubject("[your chapter]")}
                  body={creditsRequestBody({ chapter: "[your chapter]" })}
                />
                <EmailTemplate
                  label="Draft the participant email"
                  title="Email your participants"
                  blurb="Send this once people have RSVPed — it points them at the right setup guide."
                  subject={participantEmailSubject("[your jam name]")}
                  body={participantEmailBody({
                    jamTitle: "[your jam name]",
                    topicTitle: "[topic]",
                    topicTagline: "[one line on what they'll build]",
                    chapter: "[your chapter]",
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The last 25 minutes */}
      <section id="present-submit" className="container-page py-20 scroll-mt-20">
        <div className="section-eyebrow">The last 25 minutes</div>
        <h2 className="h-display text-3xl mt-2">Present, then submit.</h2>
        <p className="text-ash mt-3 max-w-2xl">
          Two things happen at the end of a jam, and rooms reliably do the first and forget the
          second. Budget for both — put them on the schedule you show the room at the start.
        </p>

        {/* Full width, but a band rather than a block — the two cards below are
            the content. The crop keeps the middle of the frame, where the people
            are; narrow screens get a taller slice so it doesn't become a sliver. */}
        <div className="mt-8 rounded-xl overflow-hidden border border-line shadow-soft">
          <Image
            src="/organizer/presenting.jpg"
            alt="Participants presenting their builds at the end of a jam."
            width={1024}
            height={434}
            sizes="(min-width: 1280px) 1152px, 100vw"
            className="w-full aspect-[5/2] sm:aspect-[5/1] object-cover object-center"
          />
        </div>

        <div className="mt-8 grid lg:grid-cols-2 gap-5">
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-gblue text-white flex items-center justify-center font-display font-bold">
                1
              </span>
              <h3 className="font-display font-bold text-xl text-ink">Get people presenting</h3>
            </div>
            <p className="text-sm text-ash mt-3 leading-relaxed">
              Three volunteers, two minutes each, screen-shared from where they&rsquo;re sitting. No
              slides, no stage.
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink">
              <li className="flex gap-2">
                <span className="text-gblue font-bold shrink-0">·</span>
                Ask for volunteers at the halfway mark, not at the end. People say yes more readily
                when the demo is still hypothetical.
              </li>
              <li className="flex gap-2">
                <span className="text-gblue font-bold shrink-0">·</span>
                Pick a broken one on purpose. A build that half works gives everyone else permission
                to show theirs.
              </li>
              <li className="flex gap-2">
                <span className="text-gblue font-bold shrink-0">·</span>
                Ask each presenter the same question: what surprised you? That answer is what the
                room remembers, and it&rsquo;s a field on the submit form.
              </li>
            </ul>
          </div>

          <div className="card p-6 ring-2 ring-gyellow/40">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-gyellow text-white flex items-center justify-center font-display font-bold">
                2
              </span>
              <h3 className="font-display font-bold text-xl text-ink">Then everyone submits</h3>
            </div>
            <p className="text-sm text-ash mt-3 leading-relaxed">
              Not just the presenters — <b className="text-ink">everyone</b>, including the people
              whose build barely runs. Do it in the room, together, before anyone packs up.
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink">
              <li className="flex gap-2">
                <span className="text-gyellow font-bold shrink-0">·</span>
                Put your jam&rsquo;s submit link on the projector and leave it there. Every jam page
                has one that pre-fills the jam, so nobody picks the wrong thing.
              </li>
              <li className="flex gap-2">
                <span className="text-gyellow font-bold shrink-0">·</span>
                Say out loud that half-finished is fine. Most people assume the showcase is for
                polished work and quietly opt out.
              </li>
              <li className="flex gap-2">
                <span className="text-gyellow font-bold shrink-0">·</span>
                Screenshot required, repo and demo optional — remind them so nobody stalls hunting
                for a live URL they never deployed.
              </li>
              <li className="flex gap-2">
                <span className="text-gyellow font-bold shrink-0">·</span>
                One submission per person per day, so it has to happen on the day.
              </li>
            </ul>
            <Link href="/organizer/jams" className="btn-google mt-5 inline-block !py-2 !px-4 text-sm">
              Get your jam&rsquo;s submit link →
            </Link>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section id="kit" className="container-page py-20 scroll-mt-20">
        <div className="section-eyebrow">The Jam Session Kit</div>
        <h2 className="h-display text-3xl mt-2">Everything in the box.</h2>
        <p className="text-ash mt-3 max-w-2xl">
          Eight ready-made kits, one per track. Each ships with a starter repo and a codelab, so you
          facilitate and the kit handles the rest. Pick any one to host — they&rsquo;re independent,
          and there&rsquo;s no order to work through.
        </p>

        <div className="mt-8 grid sm:grid-cols-2 gap-5">
          <div className="card p-6 flex flex-col">
            <div className="text-2xl">📦</div>
            <h3 className="font-display font-bold text-xl text-ink mt-3">Use a ready-made kit</h3>
            <p className="text-sm text-ash mt-2 leading-relaxed flex-1">
              Eight topics, each already scoped to ship inside 45 minutes. Open one, read the brief,
              and put its name in your event description. Nothing to write.
            </p>
            <a href="#track-notes" className="btn-google mt-5 self-start !py-2 !px-4 text-sm">
              Browse the eight kits →
            </a>
          </div>

          <div className="card p-6 flex flex-col">
            <div className="text-2xl">✏️</div>
            <h3 className="font-display font-bold text-xl text-ink mt-3">Or bring your own topic</h3>
            <p className="text-sm text-ash mt-2 leading-relaxed flex-1">
              Got a dataset, a codelab of your own, or an idea that fits your community better? Set
              up a jam page for it in a couple of minutes — title, tagline, your links, done.
            </p>
            <Link href="/organizer/jams/new" className="btn-ghost mt-5 self-start !py-2 !px-4 text-sm">
              Create your own jam →
            </Link>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-3 gap-4">
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
            title="Slides"
            body="The deck to run the room from — intro, the build, the wrap-up. Coming soon; the link lands here when it's ready."
          />
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-line bg-cloud/50 p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-display font-semibold text-ink">Resources — slide deck</div>
            <p className="text-sm text-ash mt-1">
              TBD. Drop the link in <code className="font-mono text-xs">app/organizer/page.tsx</code>{" "}
              once the deck exists and this note becomes a button.
            </p>
          </div>
          <span className="chip bg-white ring-1 ring-line text-ash text-xs shrink-0">Coming soon</span>
        </div>
      </section>

      {/* The 2-hour standard schedule */}
      <section className="bg-cloud border-y border-line scroll-mt-20" id="timeline">
        <div className="container-page py-20 grid sm:grid-cols-2 gap-12">
          <div>
            <div className="section-eyebrow">The standard schedule</div>
            <h2 className="h-display text-3xl mt-2">Two hours. Four movements.</h2>
            <p className="text-ash mt-3">
              We keep the talking short and the building long. Organizers facilitate; the room creates. This shape
              repeats across every track — it&rsquo;s the muscle memory.
            </p>
            <p className="text-ash mt-3">
              Most of the two hours is Build, and it&rsquo;s deliberately loose — the agent does the
              typing, participants decide what it&rsquo;s making. The codelab is there for anyone who
              wants a structured route through it, not a script the room has to follow.
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

      {/* Per-session structure */}
      <section className="bg-cloud border-y border-line scroll-mt-20" id="per-session">
        <div className="container-page py-20">
          <div className="section-eyebrow">Per-session structure</div>
          <h2 className="h-display text-3xl mt-2">A four-phase rhythm, every track.</h2>
          <div className="mt-8 grid sm:grid-cols-4 gap-4">
            <PhaseCard n="1" color="bg-gblue" time="15 min" title="Intro" body="Set the tone and introduce tonight's topic. Keep it short — the room is here to build, not to watch." />
            <PhaseCard n="2" color="bg-gred" time="15 min" title="Credits & setup" body="Share the Google Cloud credits, then everyone gets their tool ready — AI Studio in the browser, or Antigravity locally. Nobody should be installing once the build starts." />
            <PhaseCard n="3" color="bg-gyellow" time="60-65 min" title="Build" body="Keep it loose and let the room enjoy it. You and the TAs circulate — unblock, don't code for them. Anyone who wants structure can follow the codelab's spec-driven route." />
            <PhaseCard n="4" color="bg-ggreen" time="25 min" title="Present & submit" body="Volunteers screen-share what they built, then everyone submits it to the showcase. Both halves matter — see below." />
          </div>
          <div className="mt-10">
            <div className="section-eyebrow">Inside the Build phase</div>
            <h3 className="h-display text-xl mt-2">Spec-driven design.</h3>
            <p className="text-sm text-ash mt-2 max-w-2xl">
              The codelab runs ~48 minutes of structured time + ~20 minutes of slack for help, iteration, and
              polish. Total ~75 minutes inside the 60–70 minute Build window with room to breathe.
            </p>
            <div className="mt-5">
              <CodelabPhases />
            </div>
          </div>
        </div>
      </section>

      {/* Watch for */}
      <section className="bg-cloud border-y border-line">
        <div className="container-page py-20 grid sm:grid-cols-2 gap-10">
          <div>
            <div className="section-eyebrow text-ggreen">Signs the methodology is landing</div>
            <ul className="mt-4 space-y-3">
              {[
                "Participants can say in one line what they set out to build",
                "Someone says 'wait, that's a polished-version feature' mid-build",
                "Drop-ins are scoping their own build without being walked through it",
                "At the end, the variations between participants are wide",
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
              When you see the latter: pause, get them to say out loud what they are building, and re-read the
              question this track emphasizes. The reset usually re-anchors the room.
            </p>
          </div>
        </div>
      </section>

      {/* Common gotchas */}
      <section id="gotchas" className="bg-cloud border-y border-line scroll-mt-20">
        <div className="container-page py-20">
          <div className="section-eyebrow">Common gotchas</div>
          <h2 className="h-display text-3xl mt-2">What trips people up — and the fix.</h2>
          <p className="text-ash mt-3 max-w-2xl">
            Four issues that come up in almost every room. If a participant is stuck for more than 5 minutes,
            check these first.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <GotchaCard
              color="bg-gblue"
              title="GCP credits not linked"
              symptom="Gemini API call returns 403 / quota error halfway through Verify."
              fix="During Setup, link the Google Cloud credits to the GCP project at console.cloud.google.com/billing. If you skipped GCP entirely, AI Studio works for free in the browser — send them there instead."
            />
            <GotchaCard
              color="bg-gred"
              title="API key not in .env"
              symptom="App loads but every Gemini call returns 401."
              fix="Open the project root, confirm `.env` exists (NOT `.env.example`), and the key is `GEMINI_API_KEY=...` with no quotes around the value. Restart the dev server after editing."
            />
            <GotchaCard
              color="bg-gyellow"
              title="Antigravity on Apple Silicon"
              symptom="App opens but the agent panel hangs on first prompt."
              fix="Make sure you downloaded the arm64 build, not Intel. Quit the app fully (Cmd-Q, not just close window) and reopen. If still stuck, check Activity Monitor that the process is `Apple` architecture."
            />
            <GotchaCard
              color="bg-ggreen"
              title="uv vs pip confusion"
              symptom="Participant runs `pip install`, gets ModuleNotFoundError later."
              fix="The codelab uses uv. Direct them to `uv sync` (installs deps from pyproject.toml) and `uv run <command>` (replaces `python <command>`). pip will silently install into the wrong environment."
            />
          </div>
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
            <Link href="/#jams" className="btn-google">Browse the jams</Link>
            <Link href="/showcase" className="btn-ghost">See the global showcase</Link>
          </div>
        </div>
      </section>

      {/* Per-track facilitator notes */}
      <section id="track-notes" className="container-page py-20 scroll-mt-20">
        <div className="section-eyebrow">Per-track facilitator notes</div>
        <h2 className="h-display text-3xl mt-2">What to demo, what to coach, what to fish for.</h2>
        <p className="text-ash mt-3 max-w-2xl">
          Participants see the high-level rhythm. You see the line to listen for and the polished-version
          pull-ins to tease at the end. Expand any track below.
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


function TipBox({ color, label, children }: { color: string; label: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <span className={`chip ${color}`}>{label}</span>
      <p className="text-sm text-ink mt-2 leading-relaxed">{children}</p>
    </div>
  );
}


function GotchaCard({ color, title, symptom, fix }: { color: string; title: string; symptom: string; fix: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        <div className="font-display font-semibold text-ink">{title}</div>
      </div>
      <p className="text-sm text-ash mt-3"><span className="font-semibold text-ink">Symptom:</span> {symptom}</p>
      <p className="text-sm text-ash mt-2"><span className="font-semibold text-ink">Fix:</span> {fix}</p>
    </div>
  );
}
