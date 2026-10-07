import Link from "next/link";
import { getT } from "@/lib/i18n";

/**
 * Shown to a signed-in user who isn't on the organizer roster. A plain 404
 * would read as "broken link"; this explains the gate and where to go next.
 */
export default async function NotAnOrganizer() {
  const t = await getT();
  return (
    <section className="container-page py-24">
      <div className="card p-10 max-w-xl mx-auto text-center">
        <div className="text-4xl">🔑</div>
        <h1 className="h-display text-3xl mt-4">{t("notorg.title")}</h1>
        <p className="text-ash mt-3">
          {t("notorg.body")}
        </p>
        <div className="mt-7 flex flex-wrap gap-3 justify-center">
          <Link href="/organizer" className="btn-google">{t("notorg.kit")}</Link>
          <Link href="/#jams" className="btn-ghost">{t("notorg.tracks")}</Link>
        </div>
      </div>
    </section>
  );
}
