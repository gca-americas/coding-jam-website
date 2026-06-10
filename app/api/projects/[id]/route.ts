import { NextResponse } from "next/server";
import {
  chapterMatchKey,
  deleteProject,
  getProjectById,
  listProjectsRaw,
  normalizeChapter,
  updateProject,
} from "@/lib/projects";
import { emailToProfileId } from "@/lib/profile";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Shape an arbitrary candidate URL into a safe http(s) string or undefined. */
function safeUrl(v: unknown): string | undefined {
  if (!v) return undefined;
  const s = String(v).trim();
  if (!s) return undefined;
  if (!/^https?:\/\//i.test(s)) return undefined;
  return s;
}

/** Same email-list normalization as POST /api/projects. */
function normalizeCollaboratorEmails(raw: unknown): string[] | undefined {
  if (raw === undefined || raw === null) return undefined;
  const candidates = Array.isArray(raw)
    ? raw.map((e) => String(e))
    : String(raw).split(/[,\s]+/);
  const cleaned = candidates
    .map((e) => e.trim().toLowerCase())
    .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
    .map((e) => e.slice(0, 254));
  const unique = Array.from(new Set(cleaned));
  return unique.slice(0, 10);
}

async function loadOwnedProject(req: Request, id: string) {
  const session = await auth();
  const user = session?.user;
  if (!user?.email) {
    return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  }
  const project = await getProjectById(id);
  if (!project) {
    return { error: NextResponse.json({ error: "Project not found." }, { status: 404 }) };
  }
  // Only the original submitter can edit/delete. Collaborators don't have rights.
  if (project.submittedByEmail?.toLowerCase() !== user.email.toLowerCase()) {
    return { error: NextResponse.json({ error: "Not your build." }, { status: 403 }) };
  }
  return { user, project };
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const guard = await loadOwnedProject(req, id);
  if ("error" in guard) return guard.error;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  if (body.trackNumber !== undefined) {
    const n = Number(body.trackNumber);
    if (!Number.isInteger(n) || n < 0 || n > 9) {
      return NextResponse.json({ error: "trackNumber must be 0–9" }, { status: 400 });
    }
    patch.trackNumber = n;
  }

  if (typeof body.projectName === "string") {
    const v = body.projectName.slice(0, 120).trim();
    if (!v) return NextResponse.json({ error: "projectName cannot be empty" }, { status: 400 });
    patch.projectName = v;
  }

  if (typeof body.surprise === "string") {
    const v = body.surprise.slice(0, 600).trim();
    if (!v) return NextResponse.json({ error: "surprise cannot be empty" }, { status: 400 });
    patch.surprise = v;
  }

  if (typeof body.description === "string") {
    patch.description = body.description.slice(0, 500).trim() || undefined;
  }

  if (body.repoUrl !== undefined) patch.repoUrl = safeUrl(body.repoUrl);
  if (body.demoUrl !== undefined) patch.demoUrl = safeUrl(body.demoUrl);
  if (body.videoUrl !== undefined) patch.videoUrl = safeUrl(body.videoUrl);
  if (body.screenshotUrl !== undefined) patch.screenshotUrl = safeUrl(body.screenshotUrl);

  if (typeof body.chapter === "string" && typeof body.country === "string") {
    const country = body.country.slice(0, 80).trim();
    const submittedChapter = normalizeChapter(body.chapter.slice(0, 80));
    if (!country || !submittedChapter) {
      return NextResponse.json({ error: "chapter and country cannot be empty" }, { status: 400 });
    }
    const existing = await listProjectsRaw();
    const incomingKey = chapterMatchKey(submittedChapter, country);
    const match = existing.find((p) => p.id !== id && chapterMatchKey(p.chapter, p.country) === incomingKey);
    patch.chapter = match ? match.chapter : submittedChapter;
    patch.country = country;
  }

  if (body.collaboratorEmails !== undefined) {
    const list = normalizeCollaboratorEmails(body.collaboratorEmails);
    patch.collaboratorEmails = list && list.length ? list : undefined;
    patch.collaboratorProfileIds = list && list.length ? list.map((e) => emailToProfileId(e)) : undefined;
  }

  const updated = await updateProject(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { submittedByEmail: _e, collaboratorEmails: _c, ...publicProject } = updated;
  /* eslint-enable @typescript-eslint/no-unused-vars */
  return NextResponse.json({ project: publicProject });
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const guard = await loadOwnedProject(req, id);
  if ("error" in guard) return guard.error;

  const ok = await deleteProject(id);
  if (!ok) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
