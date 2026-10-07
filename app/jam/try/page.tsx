import type { Metadata } from "next";
import { getCopy, getT } from "@/lib/i18n";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canManageJams } from "@/lib/organizers";
import NotAnOrganizer from "@/app/organizer/jams/NotAnOrganizer";
import { TRACKS } from "@/lib/tracks";
import TryJamBuilder, { type TrackChoice } from "./TryJamBuilder";

/**
 * The jam page builder.
 *
 * Everything lives in the URL fragment, which never reaches the server, so
 * nothing is stored here. It is still organizer-only: a jam page carries a
 * chapter's name and a real event, and anyone who could make one without a
 * roster spot could publish a page that looks official.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("meta.try.title"),
    description: t("meta.try.desc"),
    // Every visit renders whatever was in someone's link — nothing here is a
    // stable page worth indexing.
    robots: { index: false, follow: false },
  };
}

const tracks: TrackChoice[] = TRACKS.map((t) => ({
  slug: t.slug,
  number: t.number,
  project: t.name,
  emoji: t.emoji,
}));

export default async function TryJamPage() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) redirect("/organizer");
  if (!(await canManageJams(email))) return <NotAnOrganizer />;

  return (
    <TryJamBuilder
      tracks={tracks}
      timelineCopy={await getCopy(["tl."])}
      pickerCopy={await getCopy(["tools."])}
    />
  );
}
