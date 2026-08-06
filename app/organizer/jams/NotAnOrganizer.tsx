import Link from "next/link";

/**
 * Shown to a signed-in user who isn't on the organizer roster. A plain 404
 * would read as "broken link"; this explains the gate and where to go next.
 */
export default function NotAnOrganizer() {
  return (
    <section className="container-page py-24">
      <div className="card p-10 max-w-xl mx-auto text-center">
        <div className="text-4xl">🔑</div>
        <h1 className="h-display text-3xl mt-4">Organizer access needed.</h1>
        <p className="text-ash mt-3">
          Jam pages are published by organizers on the roster. If you&rsquo;re running a Coding Jam
          for your chapter, ask an admin to add your Google account and this page will open up.
        </p>
        <div className="mt-7 flex flex-wrap gap-3 justify-center">
          <Link href="/organizer" className="btn-google">Read the organizer kit</Link>
          <Link href="/jam/try" className="btn-ghost">Build a page without an account</Link>
        </div>
        <p className="text-xs text-ash mt-6">
          That last one needs no roster spot — it makes a shareable page you can hand out today.
        </p>
      </div>
    </section>
  );
}
