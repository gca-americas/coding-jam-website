import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admins";
import { removeOrganizer, updateOrganizer } from "@/lib/organizers";
import { parseOrganizerInput } from "../validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  if (!(await isAdmin(email))) return { error: NextResponse.json({ error: "Not an admin." }, { status: 403 }) };
  return { email };
}

function targetFrom(raw: string): string {
  return decodeURIComponent(raw).trim().toLowerCase();
}

export async function PATCH(req: Request, ctx: { params: Promise<{ email: string }> }) {
  try {
    const guard = await requireAdmin();
    if ("error" in guard) return guard.error;

    const { email: rawEmail } = await ctx.params;
    const target = targetFrom(rawEmail);
    if (!target) return NextResponse.json({ error: "Missing email." }, { status: 400 });

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = parseOrganizerInput(body, { requireAll: false });
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const organizer = await updateOrganizer(target, parsed.fields);
    if (!organizer) {
      return NextResponse.json({ error: "Organizer not found." }, { status: 404 });
    }
    return NextResponse.json({ organizer });
  } catch (err) {
    const e = err as { message?: string; code?: number | string; details?: string };
    console.error(
      `[organizers] PATCH /api/organizers/[email] failed:`,
      JSON.stringify({ message: e?.message ?? String(err), code: e?.code, details: e?.details }, null, 2),
    );
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ email: string }> }) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { email: rawEmail } = await ctx.params;
  const target = targetFrom(rawEmail);
  if (!target) return NextResponse.json({ error: "Missing email." }, { status: 400 });

  // Removing an organizer does not touch the jams they already published —
  // those stay live and admin-editable. Phase 3 adds the archive action.
  const ok = await removeOrganizer(target);
  if (!ok) {
    return NextResponse.json({ error: "Organizer not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
