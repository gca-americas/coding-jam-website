import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-cloud mt-24">
      <div className="container-page py-12 grid sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo />
            <div className="font-display font-bold text-ink">GDG Coding Jams</div>
          </div>
          <p className="text-sm text-ash mt-3 max-w-xs">
            Two hours. Pizza. Real code. A turnkey kit for GDG organizers everywhere.
          </p>
        </div>
        <div>
          <div className="section-eyebrow mb-3">For Builders</div>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-ink hover:text-gblue" href="/">The Lineup</Link></li>
            <li><Link className="text-ink hover:text-gblue" href="/about">About Coding Jams</Link></li>
            <li><Link className="text-ink hover:text-gblue" href="/showcase">Project showcase</Link></li>
            <li><Link className="text-ink hover:text-gblue" href="/submit">Share your build</Link></li>
          </ul>
        </div>
        <div>
          <div className="section-eyebrow mb-3">For Organizers</div>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-ink hover:text-gblue" href="/organizer">Run a Jam</Link></li>
            <li><Link className="text-ink hover:text-gblue" href="/organizer#kit">Jam Session Kit</Link></li>
            <li><Link className="text-ink hover:text-gblue" href="/organizer#timeline">Pre-workshop timeline</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page py-4 text-xs text-ash">
          <span>A community initiative for GDG chapters in the Americas.</span>
        </div>
      </div>
    </footer>
  );
}
