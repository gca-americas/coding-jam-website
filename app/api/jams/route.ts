import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admins";
import { canManageJams, getOrganizer } from "@/lib/organizers";
import {
  createJam,
  listJams,
  listJamsByOrganizer,
  MAX_JAMS_PER_ORGANIZER,
  newSlug,
  SlugTakenError,
} from "@/lib/jams";
import { parseJamInput } from "./validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * How many URLs to draw before giving up on finding a free one.
 *
 * Five digits is 90,000 addresses, so early draws almost always land clear, but
 * the odds decay as jams accumulate — at 9,000 jams each draw is a 1-in-10 miss,
 * and eight independent misses is a 1-in-100,000,000 event. Long before that
 * gets tight the answer is a sixth digit, not more retries.
 */
const SLUG_ATTEMPTS = 8;

async function requireOrganizer() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) {
    return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  }
  if (!(await canManageJams(email))) {
    return {
      error: NextResponse.json(
        { error: "Only organizers can create jams. Ask an admin to add you." },
        { status: 403 },
      ),
    };
  }
  return { email, name: session?.user?.name ?? "" };
}

/** Own jams by default; admins can pass ?all=1 to see every jam. */
export async function GET(req: Request) {
  const guard = await requireOrganizer();
  if ("error" in guard) return guard.error;

  const wantsAll = new URL(req.url).searchParams.get("all") === "1";
  const jams = wantsAll && (await isAdmin(guard.email))
    ? await listJams()
    : await listJamsByOrganizer(guard.email);
  return NextResponse.json({ jams });
}

export async function POST(req: Request) {
  try {
    const guard = await requireOrganizer();
    if ("error" in guard) return guard.error;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = parseJamInput(body, { requireAll: true });
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const mine = await listJamsByOrganizer(guard.email);
    if (mine.length >= MAX_JAMS_PER_ORGANIZER) {
      return NextResponse.json(
        { error: `You've reached the limit of ${MAX_JAMS_PER_ORGANIZER} jams. Archive an old one first.` },
        { status: 400 },
      );
    }

    // Public attribution comes from the roster record. Admins without one fall
    // back to their Google display name so they can still author a jam.
    const organizer = await getOrganizer(guard.email);
    const organizerName = organizer?.displayName || guard.name || guard.email.split("@")[0];

    const { fields } = parsed;
    const draft = {
      title: fields.title!,
      organizerEmail: guard.email,
      organizerName,
      organizerIsGde: organizer?.isGde ?? false,
      chapter: fields.chapter!,
      chapterType: fields.chapterType,
      chapterName: fields.chapterName,
      country: fields.country!,
      eventDate: fields.eventDate ?? undefined,
      deadline: fields.deadline ?? undefined,
      locationNote: fields.locationNote ?? undefined,
      rsvpUrl: fields.rsvpUrl ?? undefined,
      status: fields.status!,
      topic: fields.topic!,
    };

    // The URL is drawn here, not asked for. createJam fails loudly on a taken
    // slug, which doubles as the uniqueness check — draw again and retry. The
    // response carries whatever landed; the client reads it back rather than
    // predicting it.
    for (let attempt = 1; ; attempt++) {
      try {
        const jam = await createJam({ ...draft, slug: newSlug() });
        return NextResponse.json({ jam }, { status: 201 });
      } catch (err) {
        if (!(err instanceof SlugTakenError) || attempt >= SLUG_ATTEMPTS) throw err;
      }
    }
  } catch (err) {
    // Only reachable after SLUG_ATTEMPTS consecutive draws all landed on taken
    // URLs. Nothing the organizer did, and nothing they can fix by editing the
    // form — so ask for a retry rather than reporting a clash they never chose.
    if (err instanceof SlugTakenError) {
      return NextResponse.json(
        { error: "Couldn't assign a URL for this jam. Try saving again." },
        { status: 503 },
      );
    }
    const e = err as { message?: string; code?: number | string; details?: string };
    console.error(
      `[jams] POST /api/jams failed:`,
      JSON.stringify({ message: e?.message ?? String(err), code: e?.code, details: e?.details }, null, 2),
    );
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
