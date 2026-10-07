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
import { canonicalChapterName, isChapterType, resolveChapter } from "@/lib/chapters";
import { canonicalCountry } from "@/lib/countries";
import { getJam, isPastDeadline } from "@/lib/jams";
import { parseGoogleTech } from "@/lib/google-tech";
import { topicView } from "@/lib/topic";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admins";

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

/**
 * `allowAdmin` widens the check for moderation, and the returned `isOwner` says
 * which of the two got you in — callers narrow what an admin may change.
 *
 * Admins can delete any build and correct which jam it belongs to. They cannot
 * touch the prose: removing spam or fixing an attribution is moderation,
 * rewriting someone's project description is putting words in their mouth.
 */
async function loadOwnedProject(req: Request, id: string, allowAdmin = false) {
  const session = await auth();
  const user = session?.user;
  if (!user?.email) {
    return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  }
  const project = await getProjectById(id);
  if (!project) {
    return { error: NextResponse.json({ error: "Project not found." }, { status: 404 }) };
  }
  const isOwner = project.submittedByEmail?.toLowerCase() === user.email.toLowerCase();
  if (!isOwner && !(allowAdmin && (await isAdmin(user.email)))) {
    return { error: NextResponse.json({ error: "Not your build." }, { status: 403 }) };
  }
  return { user, project, isOwner };
}

/**
 * What an admin may PATCH on a build that is not theirs.
 *
 * Builders pick their jam from a dropdown and get it wrong often enough that
 * whole rooms end up unattributed, and only an admin can see the whole picture
 * well enough to fix it. Everything stored for the new jam is read off the jam
 * record server-side, so this cannot be used to write arbitrary text.
 */
const ADMIN_PATCHABLE = new Set(["jamSlug"]);

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const guard = await loadOwnedProject(req, id, true);
  if ("error" in guard) return guard.error;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!guard.isOwner) {
    const outOfScope = Object.keys(body).filter((k) => !ADMIN_PATCHABLE.has(k));
    if (outOfScope.length > 0) {
      return NextResponse.json(
        { error: `Admins can only reassign the jam, not ${outOfScope.join(", ")}.` },
        { status: 403 },
      );
    }
  }

  const patch: Record<string, unknown> = {};

  if (body.trackNumber !== undefined) {
    const n = Number(body.trackNumber);
    if (!Number.isInteger(n) || n < 0 || n > 9) {
      return NextResponse.json({ error: "trackNumber must be 0–9" }, { status: 400 });
    }
    patch.trackNumber = n;
  }

  /*
   * Jam attribution. As on POST, everything stored is read off the jam record
   * server-side — the client sends only a slug. "" clears the attribution back
   * to NA. When a jam is set it also decides the track, so an edit can't leave
   * the two disagreeing.
   */
  if (body.jamSlug !== undefined) {
    const slug = String(body.jamSlug || "").trim();
    if (!slug) {
      patch.jamSlug = null;
      patch.jamTitle = null;
      patch.organizerName = null;
      patch.organizerEmail = null;
      patch.topicLabel = null;
    } else {
      const jam = await getJam(slug);
      if (!jam || jam.status !== "published") {
        return NextResponse.json({ error: "That jam isn't accepting submissions." }, { status: 400 });
      }
      if (guard.isOwner && slug !== guard.project.jamSlug && isPastDeadline(jam)) {
        return NextResponse.json(
          { error: `Submissions for this jam closed at the end of ${jam.deadline}.` },
          { status: 400 },
        );
      }
      const view = topicView(jam.topic);
      patch.jamSlug = jam.slug;
      patch.jamTitle = jam.title;
      patch.organizerName = jam.organizerName;
      patch.organizerEmail = jam.organizerEmail;
      patch.topicLabel = view.title;
      patch.trackNumber = view.track?.number ?? 0;
    }
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

  // Untagging a build entirely is a legitimate edit, so an empty selection sends
  // null (clear) — undefined would be read as "field absent, leave alone".
  if (body.googleTech !== undefined) {
    const picked = parseGoogleTech(body.googleTech);
    patch.googleTech = picked.length ? picked : null;
  }

  if (body.repoUrl !== undefined) {
    const v = safeUrl(body.repoUrl);
    if (!v) return NextResponse.json({ error: "repoUrl cannot be empty" }, { status: 400 });
    patch.repoUrl = v;
  }
  if (body.demoUrl !== undefined) patch.demoUrl = safeUrl(body.demoUrl);
  if (body.videoUrl !== undefined) patch.videoUrl = safeUrl(body.videoUrl);
  if (body.screenshotUrl !== undefined) {
    const v = safeUrl(body.screenshotUrl);
    if (!v) return NextResponse.json({ error: "screenshotUrl cannot be empty" }, { status: 400 });
    patch.screenshotUrl = v;
  }

  if (typeof body.chapter === "string" && typeof body.country === "string") {
    const country = canonicalCountry(body.country);
    if (!country) {
      return NextResponse.json({ error: "Unknown country." }, { status: 400 });
    }
    const chapterType = body.chapterType;
    if (!isChapterType(chapterType)) {
      return NextResponse.json(
        { error: "chapterType must be 'gdg', 'campus', or 'other'." },
        { status: 400 },
      );
    }
    const rawChapterName = body.chapter.slice(0, 120);
    const resolved = resolveChapter(chapterType, rawChapterName);
    if (!resolved) {
      return NextResponse.json(
        { error: `"${rawChapterName.trim()}" isn't in the ${chapterType === "campus" ? "GDG on Campus" : "GDG"} directory.` },
        { status: 400 },
      );
    }
    const existing = await listProjectsRaw();
    const incomingKey = chapterMatchKey(resolved, country);
    const match = existing.find((p) => p.id !== id && chapterMatchKey(p.chapter, p.country) === incomingKey);
    patch.chapter = match ? match.chapter : normalizeChapter(resolved);
    patch.chapterType = chapterType;
    patch.chapterName =
      chapterType === "other"
        ? rawChapterName.replace(/\s+/g, " ").trim().slice(0, 80)
        : canonicalChapterName(chapterType, rawChapterName)!;
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
  // Moderation: an admin can remove any build, per loadOwnedProject's contract.
  const guard = await loadOwnedProject(req, id, true);
  if ("error" in guard) return guard.error;

  const ok = await deleteProject(id);
  if (!ok) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
