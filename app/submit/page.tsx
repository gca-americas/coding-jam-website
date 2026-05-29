import Link from "next/link";
import SubmitForm from "./SubmitForm";
import SignInGate from "./SignInGate";
import { TRACKS } from "@/lib/tracks";
import { auth } from "@/auth";

export default async function SubmitPage() {
  const session = await auth();
  const user = session?.user;
  const signedIn = Boolean(user?.email);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 diag-bg" />
        <div className="container-page relative py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-gblue" /> Share your build
          </div>
          <h1 className="h-display text-5xl sm:text-6xl mt-6 max-w-3xl leading-[1.05]">
            Put your GDG on the <span className="gradient-text">hero board.</span>
          </h1>
          <p className="mt-5 text-lg text-ash max-w-2xl">
            Drop a link to your repo, your live demo, and the one moment that surprised you. Other builders find
            inspiration. Other organizers find proof. Your chapter gets a flag pin.
          </p>
        </div>
      </section>

      <section className="container-page py-10 pb-20 grid lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2">
          {signedIn && user?.name ? (
            <SubmitForm
              tracks={TRACKS.map((t) => ({ number: t.number, project: t.project }))}
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
            <div className="section-eyebrow">What makes a great share</div>
            <ul className="mt-4 space-y-3 text-sm text-ink">
              <li className="flex gap-2"><span className="text-gblue font-bold">1.</span><span><b>A live URL.</b> Even half-finished. A clickable demo beats a clean README every time.</span></li>
              <li className="flex gap-2"><span className="text-gred font-bold">2.</span><span><b>Your surprise.</b> 1-2 sentences on what you didn&rsquo;t expect. Other builders learn from this most.</span></li>
              <li className="flex gap-2"><span className="text-gyellow font-bold">3.</span><span><b>A short pitch.</b> 2-4 sentences on what your project does and who it&rsquo;s for. Helps people decide what to click on.</span></li>
              <li className="flex gap-2"><span className="text-ggreen font-bold">4.</span><span><b>Your chapter.</b> Where in the world is the jam happening? Pin your GDG on the map.</span></li>
            </ul>
          </div>
          <div className="card p-6 bg-cloud/50">
            <div className="text-xs uppercase tracking-widest font-semibold text-ash">Heads up</div>
            <p className="text-sm text-ink mt-2 leading-relaxed">
              Submissions go live immediately on the showcase. Make sure the URLs you share are public and the
              repo isn&rsquo;t leaking any API keys.
            </p>
            <p className="text-xs text-ash mt-3 leading-relaxed">
              Sign-in is via Google. Your name and avatar appear publicly with the build; your email is stored
              privately for moderation only.
            </p>
          </div>
          {!signedIn && (
            <div className="card p-6">
              <div className="text-xs uppercase tracking-widest font-semibold text-ash">Why sign-in?</div>
              <p className="text-sm text-ink mt-2 leading-relaxed">
                It keeps the showcase real — no spam bots, no impersonation, accurate attribution to the GDG that
                shipped the work.
              </p>
              <Link href="/showcase" className="text-sm text-gblue hover:underline mt-3 inline-block">
                Just browsing? See community builds →
              </Link>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
