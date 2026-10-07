import Link from "next/link";
import { getT } from "@/lib/i18n";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("meta.banned.title"), robots: { index: false, follow: false } };
}

/**
 * Where auth.ts sends a blocked account after a sign-in attempt. No session is
 * ever issued, so this page is static — it can't name the account.
 */
export default async function BannedPage() {
  const t = await getT();
  return (
    <section className="container-page py-24">
      <div className="max-w-xl mx-auto card p-8 sm:p-10">
        <div className="text-4xl">🚫</div>
        <h1 className="font-display font-bold text-3xl text-ink mt-4">
          {t("banned.title")}
        </h1>
        <p className="text-ash mt-4">
          {t("banned.p1")}
        </p>
        <p className="text-ash mt-3">
          {t("banned.p2")}
        </p>
        <p className="text-ash mt-3">
          {t("banned.p3")}
        </p>
        <div className="mt-8 pt-6 border-t border-line">
          <Link href="/" className="btn-ghost">
            {t("banned.back")}
          </Link>
        </div>
      </div>
    </section>
  );
}
