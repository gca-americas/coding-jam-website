import type { Metadata } from "next";
import { TRACKS } from "@/lib/tracks";
import TryJamBuilder, { type TrackChoice } from "./TryJamBuilder";

/**
 * The no-login jam builder.
 *
 * Everything lives in the URL fragment, which never reaches the server — this
 * page is a static shell and all the work happens client-side. Nothing is
 * stored, so there's no spam surface and nothing to moderate.
 */
export const metadata: Metadata = {
  title: "Build a jam page — GDG Coding Jams",
  description: "Put together a Coding Jam page in two minutes. No account needed.",
  // Every visit renders whatever was in someone's link — nothing here is a
  // stable page worth indexing.
  robots: { index: false, follow: false },
};

const tracks: TrackChoice[] = TRACKS.map((t) => ({
  slug: t.slug,
  number: t.number,
  project: t.project,
  emoji: t.emoji,
}));

export default function TryJamPage() {
  return <TryJamBuilder tracks={tracks} />;
}
