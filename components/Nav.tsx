import Link from "next/link";
import Logo from "./Logo";
import { auth, signIn, signOut } from "@/auth";
import { canManageJams } from "@/lib/organizers";
import LocaleSwitcher from "./LocaleSwitcher";
import { getLocale, getT } from "@/lib/i18n";

const LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/jams", key: "nav.jams" },
  { href: "/about", key: "nav.about" },
  { href: "/showcase", key: "nav.showcase" },
  { href: "/organizer", key: "nav.organizers" },
];

export default async function Nav() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const session = await auth();
  const user = session?.user;
  // Only organizers and admins see the console link — everyone else would just
  // hit the access-needed page.
  const showJams = await canManageJams(user?.email);

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-line">
      <div className="container-page flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Logo />
          <div className="leading-tight">
            <div className="font-display font-bold text-ink text-[15px]">GDG Coding Jams</div>
            <div className="text-[11px] text-ash -mt-0.5">{t("nav.tagline")}</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm text-ash hover:text-ink rounded-full hover:bg-cloud transition-colors"
            >
              {t(l.key)}
            </Link>
          ))}
          <div className="ml-1"><LocaleSwitcher current={locale} /></div>

          {user ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-line">
              {showJams && (
                <Link
                  href="/organizer/jams"
                  className="px-3 py-2 text-sm text-ash hover:text-ink rounded-full hover:bg-cloud transition-colors"
                >
                  {t("nav.myJams")}
                </Link>
              )}
              <Link href="/submit" className="btn-google !py-2 !px-4">
                {t("nav.shareBuild")}
              </Link>
              <div className="flex items-center gap-2 pl-1">
                <Link
                  href="/me"
                  className="rounded-full ring-2 ring-white hover:ring-gblue/40 shadow-soft transition-all"
                  title={`Your profile — ${user.name ?? user.email}`}
                >
                  {user.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={user.image}
                      alt={user.name ?? ""}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full block"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-cloud border border-line flex items-center justify-center text-xs font-semibold text-ash">
                      {(user.name ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs text-ash hover:text-ink px-2 py-1 rounded hover:bg-cloud transition-colors"
                    title={`Signed in as ${user.name ?? user.email}`}
                  >
                    {t("nav.signOut")}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-line">
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/me" });
                }}
              >
                <button
                  type="submit"
                  className="px-3 py-2 text-sm text-ash hover:text-ink rounded-full hover:bg-cloud transition-colors"
                >
                  {t("nav.signIn")}
                </button>
              </form>
              <Link href="/submit" className="btn-google !py-2 !px-4">
                {t("nav.shareBuild")}
              </Link>
            </div>
          )}
        </nav>
        <Link href="/submit" className="md:hidden btn-google !py-2 !px-4 text-xs">
          {t("nav.share")}
        </Link>
      </div>
    </header>
  );
}
