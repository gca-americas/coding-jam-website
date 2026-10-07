import Image from "next/image";
import { getT, getCopy } from "@/lib/i18n";
import { localizeTracks } from "@/lib/i18n/tracks";
import Link from "next/link";
import Timeline from "@/components/Timeline";
import CodelabPhases from "@/components/CodelabPhases";
import { TRACKS } from "@/lib/tracks";
import TrackNotes from "@/components/TrackNotes";
import EmailTemplate from "@/components/EmailTemplate";
import {
  CREDITS_CONTACT,
  ORGANIZER_SIGNUP_CONTACT,
  creditsRequestBody,
  creditsRequestSubject,
  organizerSignupBody,
  organizerSignupSubject,
  participantEmailBody,
  participantEmailSubject,
} from "@/lib/email-templates";
import { auth } from "@/auth";

export default async function OrganizerPage() {
  const t = await getT();
  /* The roster is keyed on a Google account, so the request has to name one.
     Signed in, we already know it and write it into the draft; signed out, the
     draft asks for it. */
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  const timelineCopy = await getCopy(["tl."]);
  const localizedTracks = await localizeTracks(TRACKS);
  const notesCopy = await getCopy(["notes."]);
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dotted-bg opacity-50" />
        <div className="container-page relative py-20 sm:py-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-gred" /> {t("org.hero.eyebrow")}
          </div>
          <h1 className="h-display text-5xl sm:text-6xl mt-6 max-w-3xl leading-[1.05]">
            {t("org.hero.title")}
          </h1>
          <p className="mt-5 text-lg text-ash max-w-2xl">
            {t("org.hero.lede")}{" "}
            <span className="text-ink font-medium">{t("org.hero.lede.strong")}</span>
          </p>
          {/* Both always shown. Joining is dark and creating is blue so they
              read as two different jobs rather than one primary and one
              also-ran — an organizer still forwards the join button to someone,
              and hiding it would make the page look different to whoever is
              maintaining it. */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <EmailTemplate
              variant="hero"
              label={t("org.signup.label")}
              title={t("org.signup.title")}
              blurb={t("org.signup.blurb")}
              to={ORGANIZER_SIGNUP_CONTACT}
              subject={organizerSignupSubject()}
              body={organizerSignupBody({
                name: session?.user?.name ?? undefined,
                email,
              })}
            />
            <Link
              href="/organizer/jams/new"
              className="btn-google text-base sm:text-lg !px-7 !py-4 font-semibold shadow-lift"
            >
              {t("org.hero.cta.create")}
            </Link>
          </div>
          <p className="mt-3 text-sm text-ash max-w-xl">{t("org.signup.note")}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/organizer/jams" className="btn-ghost">{t("org.hero.cta.setup")}</Link>
            <a href="#before-you-arrive" className="btn-ghost">{t("org.hero.cta.before")}</a>
            <a href="#timeline" className="btn-ghost">{t("org.hero.cta.shape")}</a>
            <a href="#present-submit" className="btn-ghost">{t("org.hero.cta.present")}</a>
            <a href="#gotchas" className="btn-ghost">{t("org.hero.cta.faq")}</a>
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
                {t("org.skip.eyebrow")}
              </div>
              <h2 className="h-display text-3xl sm:text-4xl mt-3 leading-[1.05]">
                {t("org.skip.title")}
              </h2>
              <p className="mt-4 text-white/80 max-w-2xl text-lg">
                {t("org.skip.lede")}
              </p>
              {/* Four reasons as tiles rather than four sentences — this block is
                  read standing up, minutes before doors open. */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
                {[
                  { icon: "🌍", label: t("org.skip.r1") },
                  { icon: "🏷️", label: t("org.skip.r2") },
                  { icon: "🏅", label: t("org.skip.r3") },
                  { icon: "📊", label: t("org.skip.r4") },
                ].map((r) => (
                  <div key={r.label} className="rounded-2xl bg-white/10 px-4 py-4 text-center">
                    <div className="text-2xl" aria-hidden="true">{r.icon}</div>
                    <div className="mt-2 text-xs leading-snug text-white/85">{r.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Link href="/organizer/jams/new" className="btn bg-white text-ink hover:shadow-pop text-center">
                {t("org.skip.cta")}
              </Link>
              <Link
                href="/organizer/jams"
                className="btn border border-white/30 text-white hover:bg-white/10 text-center"
              >
                {t("org.getLink")}
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

      {/* {t("org.preflight.eyebrow")} */}
      <section id="before-you-arrive" className="bg-cloud border-y border-line scroll-mt-20">
        <div className="container-page py-20 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <div className="section-eyebrow">{t("org.preflight.eyebrow")}</div>
            <h2 className="h-display text-3xl mt-2">{t("org.preflight.title")}</h2>
            <p className="text-ash mt-4">
              {t("org.preflight.lede")}
            </p>
            {/* When to send it, as a timeline rather than a sentence. */}
            <ol className="mt-5 space-y-3">
              {[
                ["T-48h", t("org.preflight.t48")],
                ["T-2h", t("org.preflight.t2")],
                ["Doors", t("org.preflight.doors")],
              ].map(([when, what]) => (
                <li key={when} className="flex items-center gap-3">
                  <span className="shrink-0 w-14 text-center rounded-md bg-ink px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white">
                    {when}
                  </span>
                  <span className="text-sm text-ink">{what}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-2 space-y-5">
            {/* The participant-facing setup lives on the tool guides now — one
                copy, kept current, that organizers can link straight to. */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/tools/antigravity" className="card card-hover p-5 block">
                <div className="text-2xl">🚀</div>
                <div className="font-display font-semibold text-ink mt-2">{t("org.checklist.ag.title")}</div>
                <p className="text-sm text-ash mt-1 leading-relaxed">
                  {t("org.checklist.ag.body")}
                </p>
                <span className="text-sm text-gblue mt-3 inline-block">{t("org.checklist.see")}</span>
              </Link>
              <Link href="/tools/ai-studio" className="card card-hover p-5 block">
                <div className="text-2xl">🎨</div>
                <div className="font-display font-semibold text-ink mt-2">{t("org.checklist.ai.title")}</div>
                <p className="text-sm text-ash mt-1 leading-relaxed">
                  {t("org.checklist.ai.body")}
                </p>
                <span className="text-sm text-gblue mt-3 inline-block">{t("org.checklist.see")}</span>
              </Link>
            </div>

            <div className="card p-5">
              <div className="font-display font-semibold text-ink">
                {t("org.credits.title")}
              </div>
              <p className="text-sm text-ash mt-1 leading-relaxed">
                {t("org.credits.a")}{" "}
                <Link href="/tools/antigravity" className="text-gblue hover:underline">
                  {t("org.credits.link")}
                </Link>
                {t("org.credits.b")}
              </p>
              <p className="text-sm text-ash mt-3 leading-relaxed">
                Ask{" "}
                <a href={`mailto:${CREDITS_CONTACT}`} className="text-gblue hover:underline font-medium">
                  {CREDITS_CONTACT}
                </a>{" "}
                {t("org.credits.ask")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <EmailTemplate
                  variant="google"
                  label={t("org.credits.draft")}
                  title={t("org.credits.reqTitle")}
                  blurb={`Goes to ${CREDITS_CONTACT}. Fill in the bracketed lines before sending.`}
                  to={CREDITS_CONTACT}
                  subject={creditsRequestSubject("[your chapter]")}
                  body={creditsRequestBody({ chapter: "[your chapter]" })}
                />
                <EmailTemplate
                  label={t("org.credits.email")}
                  title={t("org.credits.emailTitle")}
                  blurb={t("org.credits.emailBlurb")}
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

      {/* {t("org.present.eyebrow")} */}
      <section id="present-submit" className="container-page py-20 scroll-mt-20">
        <div className="section-eyebrow">{t("org.present.eyebrow")}</div>
        <h2 className="h-display text-3xl mt-2">{t("org.present.title")}</h2>
        <p className="text-ash mt-3 max-w-2xl">
          {t("org.present.lede")}
        </p>

        {/* Full width, but a band rather than a block — the two cards below are
            the content. The crop keeps the middle of the frame, where the people
            are; narrow screens get a taller slice so it doesn't become a sliver. */}
        <div className="mt-8 rounded-xl overflow-hidden border border-line shadow-soft">
          <Image
            src="/organizer/presenting.jpg"
            alt={t("org.present.alt")}
            width={1024}
            height={434}
            sizes="(min-width: 1280px) 1152px, 100vw"
            className="w-full aspect-[5/2] sm:aspect-[5/1] object-cover object-center"
          />
        </div>

        {/* Each step is three short rules, not three paragraphs. An organizer
            reads this with a room in front of them. */}
        <div className="mt-8 grid lg:grid-cols-2 gap-5">
          {[
            {
              n: 1,
              title: t("org.present.s1.title"),
              lede: t("org.present.s1.lede"),
              accent: "bg-gblue",
              rules: [
                ["⏱️", t("org.present.s1.r1")],
                ["🔧", t("org.present.s1.r2")],
                ["💬", t("org.present.s1.r3")],
              ],
            },
            {
              n: 2,
              title: t("org.present.s2.title"),
              lede: t("org.present.s2.lede"),
              accent: "bg-gyellow",
              rules: [
                ["📽️", t("org.present.s2.r1")],
                ["🤷", t("org.present.s2.r2")],
                ["📸", t("org.present.s2.r3")],
              ],
            },
          ].map((step) => (
            <div key={step.n} className="card p-6">
              <div className="flex items-center gap-3">
                <span
                  className={`h-9 w-9 rounded-lg ${step.accent} text-white flex items-center justify-center font-display font-bold`}
                >
                  {step.n}
                </span>
                <h3 className="font-display font-bold text-xl text-ink">{step.title}</h3>
              </div>
              <p className="text-sm text-ash mt-3">{step.lede}</p>
              <ul className="mt-4 space-y-2.5">
                {step.rules.map(([icon, rule]) => (
                  <li key={rule} className="flex items-center gap-3 text-sm text-ink">
                    <span className="text-lg shrink-0" aria-hidden="true">{icon}</span>
                    {rule}
                  </li>
                ))}
              </ul>
              {step.n === 2 && (
                <Link href="/organizer/jams" className="btn-google mt-5 inline-block !py-2 !px-4 text-sm">
                  {t("org.getSubmitLink")}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* The 2-hour standard schedule */}
      <section className="bg-cloud border-y border-line scroll-mt-20" id="timeline">
        <div className="container-page py-20 grid sm:grid-cols-2 gap-12">
          <div>
            <div className="section-eyebrow">{t("sched.eyebrow")}</div>
            <h2 className="h-display text-3xl mt-2">{t("sched.title")}</h2>
            <p className="text-ash mt-3">
              {t("sched.lede")}
            </p>
            <p className="text-ash mt-3">
              {t("sched.note")}
            </p>
            <div className="mt-6 space-y-4">
              <TipBox color="bg-gblue/10 text-gblue" label={t("sched.protip.label")}>
                {t("sched.protip")}
              </TipBox>
              <TipBox color="bg-gred/10 text-gred" label={t("sched.watch.label")}>
                {t("sched.watch")}
              </TipBox>
            </div>
          </div>
          <Timeline copy={timelineCopy} />
        </div>
      </section>

      {/* Watch for */}
      <section className="bg-cloud border-y border-line">
        <div className="container-page py-20 grid sm:grid-cols-2 gap-10">
          <div>
            <div className="section-eyebrow text-ggreen">{t("org.signs.good")}</div>
            <ul className="mt-4 space-y-3">
              {[
                t("org.signs.g1"),
                t("org.signs.g2"),
                t("org.signs.g3"),
                t("org.signs.g4"),
              ].map((s) => (
                <li key={s} className="flex gap-2 text-ink">
                  <span className="text-ggreen font-bold">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="section-eyebrow text-gred">{t("org.signs.bad")}</div>
            <ul className="mt-4 space-y-3">
              {[
                t("org.signs.b1"),
                t("org.signs.b2"),
                t("org.signs.b3"),
                t("org.signs.b4"),
              ].map((s) => (
                <li key={s} className="flex gap-2 text-ink">
                  <span className="text-gred font-bold">!</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ash italic border-l-2 border-line pl-3">
              {t("org.signs.reset")}
            </p>
          </div>
        </div>
      </section>

      {/* {t("org.hero.cta.faq")} */}
      <section id="gotchas" className="bg-cloud border-y border-line scroll-mt-20">
        <div className="container-page py-20">
          <div className="section-eyebrow">FAQ</div>
          <h2 className="h-display text-3xl mt-2">FAQ</h2>
          <p className="text-ash mt-3 max-w-2xl">
            {t("org.faq.lede")}
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <GotchaCard
              symptomLabel={t("faq.symptom")}
              fixLabel={t("faq.fix")}
              color="bg-gblue"
              title={t("faq.c1.title")}
              symptom={t("faq.c1.sym")}
              fix={t("faq.c1.fix")}
            />
            <GotchaCard
              symptomLabel={t("faq.symptom")}
              fixLabel={t("faq.fix")}
              color="bg-gred"
              title={t("faq.c2.title")}
              symptom={t("faq.c2.sym")}
              fix={t("faq.c2.fix")}
            />
            <GotchaCard
              symptomLabel={t("faq.symptom")}
              fixLabel={t("faq.fix")}
              color="bg-gyellow"
              title={t("faq.c3.title")}
              symptom={t("faq.c3.sym")}
              fix={t("faq.c3.fix")}
            />
            <GotchaCard
              symptomLabel={t("faq.symptom")}
              fixLabel={t("faq.fix")}
              color="bg-ggreen"
              title={t("faq.c4.title")}
              symptom={t("faq.c4.sym")}
              fix={t("faq.c4.fix")}
            />
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="card p-8 sm:p-12 text-center">
          <h2 className="h-display text-3xl">{t("org.cta.title")}</h2>
          <p className="text-ash mt-3 max-w-xl mx-auto">
            {t("org.cta.body")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/#jams" className="btn-google">{t("org.cta.jams")}</Link>
            <Link href="/showcase" className="btn-ghost">{t("org.cta.showcase")}</Link>
          </div>
        </div>
      </section>

      {/* Per-track facilitator notes — shared with /organizer/jams/new */}
      <div className="container-page py-20">
        <TrackNotes tracks={localizedTracks} copy={notesCopy} />
      </div>

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


function GotchaCard({
  color, title, symptom, fix, symptomLabel, fixLabel,
}: {
  color: string; title: string; symptom: string; fix: string;
  symptomLabel: string; fixLabel: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        <div className="font-display font-semibold text-ink">{title}</div>
      </div>
      <p className="text-sm text-ash mt-3"><span className="font-semibold text-ink">{symptomLabel}</span> {symptom}</p>
      <p className="text-sm text-ash mt-2"><span className="font-semibold text-ink">{fixLabel}</span> {fix}</p>
    </div>
  );
}
