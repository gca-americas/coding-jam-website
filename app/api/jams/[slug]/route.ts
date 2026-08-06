import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admins";
import { canEditJam, deleteJam, getJam, updateJam, type JamPatch } from "@/lib/jams";
import { parseJamInput } from "../validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Resolves the jam and checks the caller may edit it. Returns 404 rather than
 * 403 for a jam that exists but isn't theirs — an unpublished jam's existence
 * isn't something to leak to whoever guesses the URL.
 */
async function requireEditable(slugRaw: string) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) {
    return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  }
  const slug = decodeURIComponent(slugRaw).trim().toLowerCase();
  const jam = await getJam(slug);
  if (!jam) return { error: NextResponse.json({ error: "Jam not found." }, { status: 404 }) };
  const admin = await isAdmin(email);
  if (!canEditJam(jam, email, admin)) {
    return { error: NextResponse.json({ error: "Jam not found." }, { status: 404 }) };
  }
  return { email, jam, slug };
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const guard = await requireEditable(slug);
  if ("error" in guard) return guard.error;
  return NextResponse.json({ jam: guard.jam });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const guard = await requireEditable(slug);
    if ("error" in guard) return guard.error;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = parseJamInput(body, { requireAll: false });
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const jam = await updateJam(guard.slug, parsed.fields as JamPatch);
    if (!jam) return NextResponse.json({ error: "Jam not found." }, { status: 404 });
    return NextResponse.json({ jam });
  } catch (err) {
    const e = err as { message?: string; code?: number | string; details?: string };
    console.error(
      `[jams] PATCH /api/jams/[slug] failed:`,
      JSON.stringify({ message: e?.message ?? String(err), code: e?.code, details: e?.details }, null, 2),
    );
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const guard = await requireEditable(slug);
  if ("error" in guard) return guard.error;

  const ok = await deleteJam(guard.slug);
  if (!ok) return NextResponse.json({ error: "Jam not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
