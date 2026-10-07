import Link from "next/link";
import { getCopy, getT } from "@/lib/i18n";
import { localizeTracks } from "@/lib/i18n/tracks";
import Timeline from "@/components/Timeline";
import HowItWorks from "@/components/HowItWorks";
import { TRACKS } from "@/lib/tracks";

export default async function AboutPage() {
  const t = await getT();
  const timelineCopy = await getCopy(["tl."]);
  const tracks = await localizeTracks(TRACKS);
  const hiwCopy = await getCopy(["hiw."]);
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dotted-bg opacity-50" />
        <div className="container-page relative py-20 sm:py-24">
          <Link href="/" className="inline-flex items-center gap-1.5 text-ash text-sm hover:text-ink">
            {t("about.back")}
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-gblue" /> {t("about.eyebrow")}
          </div>
          <h1 className="h-display text-5xl sm:text-7xl mt-6 max-w-3xl leading-[1.02]">
            {t("about.title.a")}<br />
            {t("about.title.b")} <span className="text-gred">{t("about.title.hackathon")}</span>{t("about.title.c")}
          </h1>
          <p className="mt-6 text-lg text-ash max-w-2xl">
            {t("about.lede")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#jams" className="btn-google">{t("about.cta.browse")}</Link>
            <Link href="/organizer" className="btn-ghost">{t("about.cta.organizer")}</Link>
          </div>
        </div>
      </section>

      {/* How it works — the 30-second visual explainer */}
      <HowItWorks copy={hiwCopy} />

      {/* The concept */}
      <section className="container-page pb-20">
        <div className="grid sm:grid-cols-3 gap-8 items-start">
          <div className="sm:col-span-1">
            <div className="section-eyebrow">{t("about.why.eyebrow")}</div>
            <h2 className="h-display text-3xl mt-2">{t("about.why.title")}</h2>
            <p className="text-ash mt-4">
              {t("about.why.p1")}
            </p>
            <p className="text-ash mt-4">
              {t("about.why.p2")}
            </p>
          </div>
          <div className="sm:col-span-2 grid sm:grid-cols-3 gap-4">
            <ValueCard
              accent="bg-gblue"
              title={t("about.value1.title")}
              body={t("about.value1.body")}
            />
            <ValueCard
              accent="bg-gred"
              title={t("about.value2.title")}
              body={t("about.value2.body")}
            />
            <ValueCard
              accent="bg-ggreen"
              title={t("about.value3.title")}
              body={t("about.value3.body")}
            />
          </div>
        </div>
      </section>

      {/* The Jam Session Kit */}

      {/* The rhythm */}
      <section className="container-page py-20">
        <div className="grid sm:grid-cols-2 gap-12 items-start">
          <div>
            <div className="section-eyebrow">{t("about.rhythm.eyebrow")}</div>
            <h2 className="h-display text-3xl mt-2">{t("about.rhythm.title")}</h2>
            <p className="text-ash mt-4 max-w-md">
              {t("about.rhythm.body")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="pill">⏱️ {t("about.pill.hours")}</span>
              <span className="pill">🚀 {t("about.pill.powered")}</span>
              <span className="pill">🍕 {t("about.pill.pizza")}</span>
              <span className="pill">💻 {t("about.pill.laptop")}</span>
              <span className="pill">🎟️ {t("about.pill.free")}</span>
            </div>
            <p className="mt-6 text-sm text-ash italic max-w-md border-l-2 border-line pl-3">
              {t("about.goal.a")}{" "}
              <span className="font-medium not-italic text-ink">{t("about.goal.b")}</span>{" "}
              {t("about.goal.c")}
            </p>
          </div>
          <Timeline copy={timelineCopy} />
        </div>
      </section>

      {/* Independence + optional throughline */}
      <section className="container-page py-20">
        <div className="grid sm:grid-cols-2 gap-12 items-start">
          <div>
            <div className="section-eyebrow">{t("about.topic.eyebrow")}</div>
            <h2 className="h-display text-3xl mt-2">{t("about.topic.title")}</h2>
            <p className="text-ash mt-4">
              {t("about.topic.p1")}
            </p>
            <p className="text-ash mt-3">
              <span className="font-medium text-ink">{t("about.topic.p2.lead")}</span>{" "}
              {t("about.topic.p2")}
            </p>
            <p className="text-ash mt-3">
              {t("about.topic.p3")}
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <Link href="/#jams" className="text-gblue hover:underline font-medium">
                {t("about.topic.browse")}
              </Link>
            </div>
            <div className="mt-6 card p-4 bg-cloud/40">
              <div className="text-xs uppercase tracking-widest font-semibold text-ash">{t("about.differ.eyebrow")}</div>
              <ul className="mt-2 text-sm text-ink space-y-1.5">
                <li><span className="font-medium">{t("about.differ.1.b")}</span> {t("about.differ.1")}</li>
                <li><span className="font-medium">{t("about.differ.2.b")}</span> {t("about.differ.2")}</li>
                <li><span className="font-medium">{t("about.differ.3.b")}</span> {t("about.differ.3")}</li>
              </ul>
            </div>
          </div>
          <ol className="card divide-y divide-line">
            {tracks.map((track, i) => (
              <ArcRow
                key={track.slug}
                label={track.emoji}
                body={`${track.name} — ${track.summary}`}
                color={["bg-gblue", "bg-gred", "bg-gyellow", "bg-ggreen"][i % 4]}
              />
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-24">
        <div className="rounded-3xl overflow-hidden relative bg-ink">
          <div className="absolute inset-0 dotted-bg opacity-10" />
          <div className="relative p-10 sm:p-14 text-white grid sm:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="h-display text-3xl sm:text-4xl">{t("about.cta2.title")}</h2>
              <p className="mt-3 text-white/80 max-w-md">
                {t("about.cta2.body")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 sm:justify-end">
              <Link href="/organizer#track-notes" className="btn bg-white text-ink hover:shadow-pop">
                {t("about.cta2.lineup")}
              </Link>
              <Link href="/organizer" className="btn border border-white/30 text-white hover:bg-white/10">
                {t("about.cta2.run")}
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


function ArcRow({ label, body, color }: { label: string; body: string; color: string }) {
  return (
    <li className="flex items-center gap-4 px-5 py-3.5">
      <span className={`h-2 w-2 rounded-full shrink-0 ${color}`} />
      <span className="text-xs font-mono font-semibold text-ash w-12 shrink-0">{label}</span>
      <span className="text-sm text-ink">{body}</span>
    </li>
  );
}
