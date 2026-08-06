import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admins";
import { removeBlocked } from "@/lib/blocklist";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ email: string }> },
) {
  const session = await auth();
  const callerEmail = session?.user?.email?.toLowerCase();
  if (!callerEmail) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (!(await isAdmin(callerEmail))) {
    return NextResponse.json({ error: "Not an admin." }, { status: 403 });
  }

  const { email: rawEmail } = await ctx.params;
  const target = decodeURIComponent(rawEmail).trim().toLowerCase();
  if (!target) {
    return NextResponse.json({ error: "Missing email." }, { status: 400 });
  }

  const ok = await removeBlocked(target);
  if (!ok) {
    return NextResponse.json({ error: "Not on the blocklist." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
