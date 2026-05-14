import { NextResponse } from "next/server";
import { addProject, listProjects } from "@/lib/projects";
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

  const required = ["trackNumber", "projectName", "chapter", "country", "repoUrl", "surprise"];
  for (const k of required) {
    if (!body[k] || (typeof body[k] === "string" && !(body[k] as string).trim())) {
      return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
    }
  }

  const trackNumber = Number(body.trackNumber);
  if (!Number.isInteger(trackNumber) || trackNumber < 1 || trackNumber > 8) {
    return NextResponse.json({ error: "trackNumber must be 1–8" }, { status: 400 });
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

  const project = await addProject({
    trackNumber,
    projectName: String(body.projectName).slice(0, 120).trim(),
    // Stamped from the verified Google identity, never from the request body.
    builderName: user.name.slice(0, 80).trim(),
    builderImage: user.image ?? undefined,
    submittedByEmail: user.email,
    chapter: String(body.chapter).slice(0, 80).trim(),
    country: String(body.country).slice(0, 80).trim(),
    repoUrl,
    demoUrl: safeUrl(body.demoUrl),
    videoUrl: safeUrl(body.videoUrl),
    screenshotUrl: safeUrl(body.screenshotUrl),
    doctrineScreenshotUrl: safeUrl(body.doctrineScreenshotUrl),
    surprise: String(body.surprise).slice(0, 600).trim(),
  });

  // Strip private fields from the response, even though we just wrote them.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { submittedByEmail: _email, ...publicProject } = project;
  return NextResponse.json({ project: publicProject }, { status: 201 });
}
