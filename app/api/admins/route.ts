import { NextResponse } from "next/server";
import { addAdmin, isAdmin, listAdmins } from "@/lib/admins";
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
  const admins = await listAdmins();
  return NextResponse.json({ admins });
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
    const admin = await addAdmin(email, guard.email);
    return NextResponse.json({ admin }, { status: 201 });
  } catch (err) {
    const e = err as { message?: string; code?: number | string; details?: string };
    console.error(
      `[admins] POST /api/admins failed:`,
      JSON.stringify({ message: e?.message ?? String(err), code: e?.code, details: e?.details }, null, 2),
    );
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
