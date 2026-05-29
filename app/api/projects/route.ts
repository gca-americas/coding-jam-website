import { NextResponse } from "next/server";
import { addProject, chapterMatchKey, listProjects, listProjectsRaw, normalizeChapter } from "@/lib/projects";
import { auth } from "@/auth";

// Run on Node.js (we use the filesystem for storage).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await listProjects();
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  // Identity is taken from the verified session — never from the request body.
  const session = await auth();
  const user = session?.user;
  if (!user?.email || !user.name) {
    return NextResponse.json(
      { error: "You must sign in with Google to share a build." },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // trackNumber is numeric and 0 is a valid value ("I built my own"), so don't
  // use a falsy check — only reject when it's actually absent.
  if (body.trackNumber === undefined || body.trackNumber === null || body.trackNumber === "") {
    return NextResponse.json({ error: "Missing field: trackNumber" }, { status: 400 });
  }
  const requiredStrings = ["projectName", "chapter", "country", "repoUrl", "surprise"];
  for (const k of requiredStrings) {
    if (!body[k] || (typeof body[k] === "string" && !(body[k] as string).trim())) {
      return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
    }
  }

  const trackNumber = Number(body.trackNumber);
  // 0 = "I built my own" (off-track / custom build); 1–8 are the official tracks.
  if (!Number.isInteger(trackNumber) || trackNumber < 0 || trackNumber > 8) {
    return NextResponse.json({ error: "trackNumber must be 0–8" }, { status: 400 });
  }

  const repoUrl = String(body.repoUrl);
  if (!/^https?:\/\//i.test(repoUrl)) {
    return NextResponse.json({ error: "repoUrl must start with http(s)://" }, { status: 400 });
  }

  const safeUrl = (v: unknown): string | undefined => {
    if (!v) return undefined;
    const s = String(v).trim();
    if (!s) return undefined;
    if (!/^https?:\/\//i.test(s)) return undefined;
    return s;
  };

  const country = String(body.country).slice(0, 80).trim();
  const submittedChapter = normalizeChapter(String(body.chapter).slice(0, 80));
  // If another submission already exists for this chapter+country (case-
  // insensitive match), adopt that one's display label so casing stays
  // consistent on the showcase and the map.
  const existing = await listProjectsRaw();
  const incomingKey = chapterMatchKey(submittedChapter, country);
  const match = existing.find((p) => chapterMatchKey(p.chapter, p.country) === incomingKey);
  const chapter = match ? match.chapter : submittedChapter;

  const project = await addProject({
    trackNumber,
    projectName: String(body.projectName).slice(0, 120).trim(),
    // Stamped from the verified Google identity, never from the request body.
    builderName: user.name.slice(0, 80).trim(),
    builderImage: user.image ?? undefined,
    submittedByEmail: user.email,
    chapter,
    country,
    repoUrl,
    demoUrl: safeUrl(body.demoUrl),
    videoUrl: safeUrl(body.videoUrl),
    screenshotUrl: safeUrl(body.screenshotUrl),
    description: body.description ? String(body.description).slice(0, 500).trim() : undefined,
    surprise: String(body.surprise).slice(0, 600).trim(),
  });

  // Strip private fields from the response, even though we just wrote them.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { submittedByEmail: _email, ...publicProject } = project;
  return NextResponse.json({ project: publicProject }, { status: 201 });
}
