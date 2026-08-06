import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admins";
import { addBlocked, listBlocked } from "@/lib/blocklist";
import { auth } from "@/auth";

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
  const blocked = await listBlocked();
  return NextResponse.json({ blocked });
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
    const email = String(body.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Not a valid email." }, { status: 400 });
    }
    // Lockout protection — blocking yourself would end your own session.
    if (email === guard.email) {
      return NextResponse.json({ error: "You can't block yourself." }, { status: 400 });
    }
    if (await isAdmin(email)) {
      return NextResponse.json(
        { error: "That account is an admin. Remove them from admins first." },
        { status: 400 },
      );
    }
    const reason = String(body.reason || "").slice(0, 500).trim();
    const blocked = await addBlocked(email, reason, guard.email);
    return NextResponse.json({ blocked }, { status: 201 });
  } catch (err) {
    const e = err as { message?: string; code?: number | string; details?: string };
    console.error(
      `[blocklist] POST /api/blocklist failed:`,
      JSON.stringify({ message: e?.message ?? String(err), code: e?.code, details: e?.details }, null, 2),
    );
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
