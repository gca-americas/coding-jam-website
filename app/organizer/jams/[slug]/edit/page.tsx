import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getT } from "@/lib/i18n";
import { isAdmin } from "@/lib/admins";
import { canManageJams } from "@/lib/organizers";
import { canEditJam, getJam } from "@/lib/jams";
import JamForm from "../../JamForm";
import NotAnOrganizer from "../../NotAnOrganizer";
import { trackOptions } from "../../trackOptions";

export const dynamic = "force-dynamic";

export default async function EditJamPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ imageError?: string }>;
}) {
  const t = await getT();
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) redirect("/");
  if (!(await canManageJams(email))) return <NotAnOrganizer />;

  const { slug } = await params;
  const jam = await getJam(slug);
  // 404 rather than 403 for someone else's jam — see the note in the API route.
  if (!jam) notFound();
  if (!canEditJam(jam, email, await isAdmin(email))) notFound();

  // Set when a create saved the jam but its hero image failed to attach.
  const { imageError } = await searchParams;

  return (
    <>
      <section className="container-page pt-10">
        <Link href="/organizer/jams" className="text-sm text-ash hover:text-ink">{t("newjam.back")}</Link>
        <h1 className="h-display text-4xl mt-3">{jam.title}</h1>
        <p className="text-ash mt-2 font-mono text-sm">/jam/{jam.slug}</p>
      </section>
      <section className="container-page py-8 pb-24 max-w-3xl">
        <JamForm
          mode="edit"
          jam={jam}
          initialError={
            imageError ? `The jam was saved, but the image didn't upload: ${imageError} Try adding it again below.` : undefined
          }
          tracks={trackOptions}
          defaults={{
            chapterType: jam.chapterType ?? "other",
            chapterName: jam.chapterName ?? jam.chapter,
            country: jam.country,
          }}
        />
      </section>
    </>
  );
}
