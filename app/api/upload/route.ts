import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admins";
import { canEditJam, getJam, validateSlug } from "@/lib/jams";
import { uploadScreenshot, UploadError } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Resolves the bucket prefix for this upload.
 *
 * The client never supplies a path — it names an intent ("screenshot" or a jam
 * slug) and the prefix is derived here. Accepting a caller-supplied prefix
 * would let anyone write anywhere in the bucket, including over another jam's
 * images.
 *
 *   screenshot          → screenshots/          (any signed-in builder)
 *   jam + <slug>        → jams/<slug>/          (that jam's owner, or an admin)
 */
async function resolvePrefix(
  form: FormData,
  email: string,
): Promise<{ prefix: string } | { error: NextResponse }> {
  const kind = String(form.get("kind") ?? "screenshot");

  if (kind === "screenshot") return { prefix: "screenshots" };

  if (kind === "jam") {
    const raw = String(form.get("jam") ?? "");
    const checked = validateSlug(raw);
    if ("error" in checked) {
      return { error: NextResponse.json({ error: checked.error }, { status: 400 }) };
    }
    const jam = await getJam(checked.slug);
    // Same 404-not-403 posture as the jam routes — don't confirm a jam exists
    // to someone who has no business editing it.
    if (!jam) {
      return { error: NextResponse.json({ error: "Jam not found." }, { status: 404 }) };
    }
    if (!canEditJam(jam, email, await isAdmin(email))) {
      return { error: NextResponse.json({ error: "Jam not found." }, { status: 404 }) };
    }
    return { prefix: `jams/${jam.slug}` };
  }

  return { error: NextResponse.json({ error: "Unknown upload kind." }, { status: 400 }) };
}

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) {
    return NextResponse.json(
      { error: "You must sign in with Google to upload an image." },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart body." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'file' field." }, { status: 400 });
  }

  const resolved = await resolvePrefix(form, email);
  if ("error" in resolved) return resolved.error;

  try {
    const { url } = await uploadScreenshot(file, resolved.prefix);
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[upload] failed", message);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
