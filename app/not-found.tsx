import Link from "next/link";
import { getT } from "@/lib/i18n";

export default async function NotFound() {
  const t = await getT();
  return (
    <section className="container-page py-32 text-center">
      <div className="text-7xl">🎶</div>
      <h1 className="h-display text-4xl mt-6">{t("nf.title")}</h1>
      <p className="text-ash mt-3 max-w-md mx-auto">
        {t("nf.body")}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="btn-google">{t("nf.home")}</Link>
        <Link href="/#jams" className="btn-ghost">{t("nf.jams")}</Link>
      </div>
    </section>
  );
}
