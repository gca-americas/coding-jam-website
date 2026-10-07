import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCopy, getT } from "@/lib/i18n";
import { isAdmin } from "@/lib/admins";
import { canManageJams, getOrganizer } from "@/lib/organizers";
import { canEditJam, getJam } from "@/lib/jams";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import AssistedJamForm from "./AssistedJamForm";
import NotAnOrganizer from "../NotAnOrganizer";
import { trackOptions } from "../trackOptions";

export const dynamic = "force-dynamic";

/** ?from=<slug> starts this form pre-filled from a jam the organizer already ran. */
type SP = { from?: string };

export default async function NewJamPage({ searchParams }: { searchParams: Promise<SP> }) {
  const t = await getT();
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) redirect("/");
  if (!(await canManageJams(email))) return <NotAnOrganizer />;

  // Seed the chapter and country from the roster record so the common case is
  // one field of typing. Admins without a record start from the defaults.
  const organizer = await getOrganizer(email);

  /* Copying is only offered for jams you could otherwise edit. Anything else —
     missing, or someone else's — silently starts a blank form rather than
     confirming the slug exists. */
  const { from } = await searchParams;
  const source = from ? await getJam(from) : null;
  const copyFrom =
    source && canEditJam(source, email, await isAdmin(email)) ? source : null;

  return (
    <>
      <section className="container-page pt-10">
        <Link href="/organizer/jams" className="text-sm text-ash hover:text-ink">{t("newjam.back")}</Link>
        <h1 className="h-display text-4xl mt-3">
          {copyFrom ? t("newjam.again") : t("newjam.create")}
        </h1>
        <p className="text-ash mt-2 max-w-2xl">
          {copyFrom ? (
            <>
              {t("newjam.copyFrom.a")}{" "}
              <span className="font-medium text-ink">{copyFrom.title}</span>{" "}
              {t("newjam.copyFrom.b")}
            </>
          ) : (
            <>{t("newjam.draftFirst")}</>
          )}
        </p>
      </section>
      <section className="container-page py-8 pb-24 max-w-3xl">
        <AssistedJamForm
          notesCopy={await getCopy(["notes."])}
          copyFrom={copyFrom ?? undefined}
          tracks={trackOptions}
          defaults={{
            chapterType: organizer?.chapterType ?? "gdg",
            chapterName: organizer?.chapterName ?? "",
            country: organizer?.country ?? DEFAULT_COUNTRY,
          }}
        />
      </section>
    </>
  );
}
