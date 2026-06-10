import { NextResponse } from "next/server";
import { isAdmin, removeAdmin } from "@/lib/admins";
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
  // Lockout protection — admins can't remove themselves.
  if (target === callerEmail) {
    return NextResponse.json(
      { error: "You can't remove yourself. Ask another admin to do it." },
      { status: 400 },
    );
  }

  const ok = await removeAdmin(target);
  if (!ok) {
    return NextResponse.json({ error: "Admin not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
