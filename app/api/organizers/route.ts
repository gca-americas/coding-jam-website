import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admins";
import { isBlocked } from "@/lib/blocklist";
import { addOrganizer, listOrganizers } from "@/lib/organizers";
import { parseOrganizerInput } from "./validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  if (!(await isAdmin(email))) return { error: NextResponse.json({ error: "Not an admin." }, { status: 403 }) };
  return { email };
}

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const organizers = await listOrganizers();
  return NextResponse.json({ organizers });
}

export async function POST(req: Request) {
  try {
    const guard = await requireAdmin();
    if ("error" in guard) return guard.error;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = parseOrganizerInput(body, { requireAll: true });
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { email, fields } = parsed;
    if (!email) {
      return NextResponse.json({ error: "Not a valid email." }, { status: 400 });
    }

    // A banned account must not be handed publishing rights. The blocklist
    // already stops them at sign-in; this keeps the roster honest either way.
    if (await isBlocked(email)) {
      return NextResponse.json(
        { error: "That email is on the blocklist. Unblock them first." },
        { status: 400 },
      );
    }

    const organizer = await addOrganizer({
      email,
      displayName: fields.displayName!,
      chapter: fields.chapter!,
      chapterType: fields.chapterType,
      chapterName: fields.chapterName,
      country: fields.country!,
      isGde: fields.isGde ?? false,
      addedBy: guard.email,
    });
    return NextResponse.json({ organizer }, { status: 201 });
  } catch (err) {
    const e = err as { message?: string; code?: number | string; details?: string };
    console.error(
      `[organizers] POST /api/organizers failed:`,
      JSON.stringify({ message: e?.message ?? String(err), code: e?.code, details: e?.details }, null, 2),
    );
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
