import Link from "next/link";
import Logo from "./Logo";
import { auth, signIn, signOut } from "@/auth";

const links = [
  { href: "/", label: "The Lineup" },
  { href: "/about", label: "About" },
  { href: "/showcase", label: "Showcase" },
  { href: "/organizer", label: "For Organizers" },
];

export default async function Nav() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-line">
      <div className="container-page flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Logo />
          <div className="leading-tight">
            <div className="font-display font-bold text-ink text-[15px]">GDG Coding Jams</div>
            <div className="text-[11px] text-ash -mt-0.5">Build with AI. Together.</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm text-ash hover:text-ink rounded-full hover:bg-cloud transition-colors"
            >
              {l.label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-line">
              <Link href="/submit" className="btn-google !py-2 !px-4">
                Share your build
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
                    Sign out
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
                  Sign in
                </button>
              </form>
              <Link href="/submit" className="btn-google !py-2 !px-4">
                Share your build
              </Link>
            </div>
          )}
        </nav>
        <Link href="/submit" className="md:hidden btn-google !py-2 !px-4 text-xs">
          Share
        </Link>
      </div>
    </header>
  );
}
