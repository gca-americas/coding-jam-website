import Link from "next/link";

export const metadata = {
  title: "Account suspended",
  robots: { index: false, follow: false },
};

/**
 * Where auth.ts sends a blocked account after a sign-in attempt. No session is
 * ever issued, so this page is static — it can't name the account.
 */
export default function BannedPage() {
  return (
    <section className="container-page py-24">
      <div className="max-w-xl mx-auto card p-8 sm:p-10">
        <div className="text-4xl">🚫</div>
        <h1 className="font-display font-bold text-3xl text-ink mt-4">
          Your account is banned.
        </h1>
        <p className="text-ash mt-4">
          This Google account has been suspended from GDG Coding Jams for violating the
          submission rules, and any projects submitted from it have been removed.
        </p>
        <p className="text-ash mt-3">
          This sign-in attempt has been logged and reported to the jam organizers, who
          can see the reason for the suspension along with every attempt to sign in
          since it was applied. You will not be able to sign in or submit a project.
        </p>
        <p className="text-ash mt-3">
          If you believe this was a mistake, reply to the organizers through your GDG
          chapter — a suspension can be lifted by an admin.
        </p>
        <div className="mt-8 pt-6 border-t border-line">
          <Link href="/" className="btn-ghost">
            ← Back to the showcase
          </Link>
        </div>
      </div>
    </section>
  );
}
