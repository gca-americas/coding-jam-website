import Link from "next/link";
import Logo from "./Logo";
import { getT } from "@/lib/i18n";

export default async function Footer() {
  const t = await getT();
  return (
    <footer className="border-t border-line bg-cloud mt-24">
      <div className="container-page py-12 grid sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo />
            <div className="font-display font-bold text-ink">GDG Coding Jams</div>
          </div>
          <p className="text-sm text-ash mt-3 max-w-xs">
            {t("footer.blurb")}
          </p>
        </div>
        <div>
          <div className="section-eyebrow mb-3">{t("footer.builders")}</div>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-ink hover:text-gblue" href="/">{t("footer.lineup")}</Link></li>
            <li><Link className="text-ink hover:text-gblue" href="/about">{t("footer.about")}</Link></li>
            <li><Link className="text-ink hover:text-gblue" href="/showcase">{t("footer.showcase")}</Link></li>
            <li><Link className="text-ink hover:text-gblue" href="/submit">{t("footer.share")}</Link></li>
          </ul>
        </div>
        <div>
          <div className="section-eyebrow mb-3">{t("footer.organizers")}</div>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-ink hover:text-gblue" href="/organizer">{t("footer.runJam")}</Link></li>
            <li><Link className="text-ink hover:text-gblue" href="/#jams">{t("footer.tracks")}</Link></li>
            <li><Link className="text-ink hover:text-gblue" href="/organizer#timeline">{t("footer.timeline")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page py-4 text-xs text-ash">
          <span>{t("footer.note")}</span>
        </div>
      </div>
    </footer>
  );
}
