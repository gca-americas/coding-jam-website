import Link from "next/link";
import SubmitForm from "./SubmitForm";
import SignInGate from "./SignInGate";
import { getCopy, getT } from "@/lib/i18n";
import { getJam, jamsOpenForSubmission, listPublishedJams } from "@/lib/jams";
import { topicView } from "@/lib/topic";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ jam?: string }>;
}) {
  const t = await getT();
  const formCopy = await getCopy(["sf.", "chapter."]);
  const session = await auth();
  const user = session?.user;
  const signedIn = Boolean(user?.email);

  // Arriving from a jam page locks the topic to that jam. An unknown or
  // unpublished slug is ignored rather than erroring — the plain submit form
  // is always a valid fallback.
  const { jam: jamSlug } = await searchParams;
  const jam = jamSlug ? await getJam(jamSlug) : null;

  // Free-standing submissions pick their jam from the last two weeks.
  const jamChoices = jamsOpenForSubmission(await listPublishedJams()).map((j) => ({
    slug: j.slug,
    title: j.title,
    chapter: j.chapter,
    eventDate: j.eventDate,
  }));
  const jamContext =
    jam && jam.status === "published"
      ? {
          slug: jam.slug,
          title: jam.title,
          organizerName: jam.organizerName,
          chapter: jam.chapter,
          country: jam.country,
          chapterType: jam.chapterType,
          chapterName: jam.chapterName,
          topicTitle: topicView(jam.topic).title,
          topicEmoji: topicView(jam.topic).emoji,
        }
      : null;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 diag-bg" />
        <div className="container-page relative pt-16 pb-10 sm:pt-20 sm:pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-gblue" /> {t("submit.eyebrow")}
          </div>
          <h1 className="h-display text-5xl sm:text-6xl mt-6 max-w-3xl leading-[1.05]">
            {t("submit.title.a")} <span className="gradient-text">{t("submit.title.b")}</span>
          </h1>
          <p className="mt-5 text-lg text-ash max-w-2xl">
            {t("submit.lede")}
          </p>
        </div>
      </section>

      {/* Arriving here cold means picking the jam from a dropdown, which is the
          step people get wrong — and a quiet strip above the form is read by
          nobody in a hurry. So this is a full band in the room's own colour,
          sitting between the headline and the first field, with a button rather
          than a text link. Skipping it has to be a decision, not an accident. */}
      {!jamContext && (
        <section className="container-page">
          <div className="rounded-2xl border-2 border-gblue bg-gblue/5 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
            <span
              className="shrink-0 h-14 w-14 rounded-2xl bg-gblue text-white text-3xl flex items-center justify-center shadow-soft"
              aria-hidden="true"
            >
              📍
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-ink leading-snug">
                {t("submit.fromJam.title")}
              </h2>
              <p className="text-ink/80 mt-1.5 leading-relaxed">
                {t("submit.fromJam.body")}
              </p>
            </div>
            <Link href="/jams" className="btn-google shrink-0 self-start sm:self-auto">
              {t("submit.fromJam.cta")}
            </Link>
          </div>
        </section>
      )}

      <section className="container-page pt-8 pb-20 grid lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2">
          {signedIn && user?.name ? (
            <SubmitForm
              copy={formCopy}
              jamChoices={jamChoices}
              jam={jamContext}
              builder={{
                name: user.name,
                email: user.email ?? "",
                image: user.image ?? null,
              }}
            />
          ) : (
            <SignInGate />
          )}
        </div>

        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          <div className="card p-6">
            <div className="section-eyebrow">{t("submit.great.eyebrow")}</div>
            <ul className="mt-4 space-y-3 text-sm text-ink">
              <li className="flex gap-2"><span className="text-gblue font-bold">1.</span><span><b>{t("submit.great.1.b")}</b> {t("submit.great.1")}</span></li>
              <li className="flex gap-2"><span className="text-gred font-bold">2.</span><span><b>{t("submit.great.2.b")}</b> {t("submit.great.2")}</span></li>
              <li className="flex gap-2"><span className="text-gyellow font-bold">3.</span><span><b>{t("submit.great.3.b")}</b> {t("submit.great.3")}</span></li>
              <li className="flex gap-2"><span className="text-ggreen font-bold">4.</span><span><b>{t("submit.great.4.b")}</b> {t("submit.great.4")}</span></li>
            </ul>
          </div>
          <div className="card p-6 bg-cloud/50">
            <div className="text-xs uppercase tracking-widest font-semibold text-ash">{t("submit.heads.eyebrow")}</div>
            <p className="text-sm text-ink mt-2 leading-relaxed">
              {t("submit.heads.body")}
            </p>
            <p className="text-xs text-ash mt-3 leading-relaxed">
              {t("submit.heads.privacy")}
            </p>
          </div>
          {!signedIn && (
            <div className="card p-6">
              <div className="text-xs uppercase tracking-widest font-semibold text-ash">{t("submit.why.eyebrow")}</div>
              <p className="text-sm text-ink mt-2 leading-relaxed">
                {t("submit.why.body")}
              </p>
              <Link href="/showcase" className="text-sm text-gblue hover:underline mt-3 inline-block">
                {t("submit.why.cta")}
              </Link>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
