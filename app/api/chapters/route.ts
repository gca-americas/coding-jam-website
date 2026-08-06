import { NextResponse } from "next/server";
import { chapterList, isChapterType } from "@/lib/chapters";

export const runtime = "nodejs";

/**
 * Serves a chapter directory to the picker. Public — this is a published list
 * of GDG chapters, nothing private. Immutable at runtime (it ships with the
 * build), so it caches hard.
 */
export async function GET(req: Request) {
  const type = new URL(req.url).searchParams.get("type");
  if (!isChapterType(type) || type === "other") {
    return NextResponse.json({ error: "type must be 'gdg' or 'campus'" }, { status: 400 });
  }
  return NextResponse.json(
    { chapters: chapterList(type) },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
  );
}
