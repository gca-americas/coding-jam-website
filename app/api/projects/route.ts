import { NextResponse } from "next/server";
import { addProject, chapterMatchKey, listProjects, listProjectsRaw, normalizeChapter } from "@/lib/projects";
import { emailToProfileId } from "@/lib/profile";
import { isBlocked } from "@/lib/blocklist";
import { canonicalChapterName, isChapterType, resolveChapter } from "@/lib/chapters";
import { canonicalCountry } from "@/lib/countries";
import { getJam } from "@/lib/jams";
import { parseGoogleTech } from "@/lib/google-tech";
import { topicView } from "@/lib/topic";
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

  // Defense in depth — auth.ts already blocks sign-in, but a session cookie
  // issued before the block landed would still be valid.
  if (await isBlocked(user.email)) {
    return NextResponse.json(
      { error: "This account is not permitted to submit projects." },
      { status: 403 },
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
  const requiredStrings = ["projectName", "chapter", "country", "surprise"];
  for (const k of requiredStrings) {
    if (!body[k] || (typeof body[k] === "string" && !(body[k] as string).trim())) {
      return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
    }
  }

  let trackNumber = Number(body.trackNumber);
  // 0 = legacy "I built my own" option; 1–8 are the official tracks; 9 is the
  // "build your own idea" off-menu track.
  if (!Number.isInteger(trackNumber) || trackNumber < 0 || trackNumber > 9) {
    return NextResponse.json({ error: "trackNumber must be 0–9" }, { status: 400 });
  }

  /*
   * Optional jam attribution. Everything stored here is read off the jam
   * record server-side — the client sends only a slug, so a submitter can't
   * credit themselves to an organizer they had nothing to do with.
   *
   * Only published jams accept submissions; a draft isn't a real event yet.
   * Fields are denormalized onto the project so counts and credit survive the
   * jam later being edited, renamed, or deleted.
   */
  let jamFields: {
    jamSlug?: string;
    jamTitle?: string;
    organizerName?: string;
    organizerEmail?: string;
    topicLabel?: string;
  } = {};

  if (body.jamSlug) {
    const jam = await getJam(String(body.jamSlug));
    if (!jam || jam.status !== "published") {
      return NextResponse.json(
        { error: "That jam isn't accepting submissions." },
        { status: 400 },
      );
    }
    const view = topicView(jam.topic);
    jamFields = {
      jamSlug: jam.slug,
      jamTitle: jam.title,
      organizerName: jam.organizerName,
      organizerEmail: jam.organizerEmail,
      topicLabel: view.title,
    };
    // The jam decides the track, not the form. A jam on a built-in track keeps
    // that track's number so existing per-track counts stay correct; a custom
    // or open topic lands on 0, which renders as "I built my own".
    trackNumber = view.track ? view.track.number : 0;
  }

  const safeUrl = (v: unknown): string | undefined => {
    if (!v) return undefined;
    const s = String(v).trim();
    if (!s) return undefined;
    if (!/^https?:\/\//i.test(s)) return undefined;
    return s;
  };

  const screenshotUrl = safeUrl(body.screenshotUrl);
  if (!screenshotUrl) {
    return NextResponse.json({ error: "Missing field: screenshotUrl" }, { status: 400 });
  }

  const repoUrl = safeUrl(body.repoUrl);
  if (!repoUrl) {
    return NextResponse.json({ error: "Missing field: repoUrl" }, { status: 400 });
  }

  // The client picker is a convenience, not a gate — re-validate the country and
  // the chapter against the directories here.
  const country = canonicalCountry(String(body.country));
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

  const rawChapterName = String(body.chapter).slice(0, 120);
  const resolved = resolveChapter(chapterType, rawChapterName);
  if (!resolved) {
    return NextResponse.json(
      { error: `"${rawChapterName.trim()}" isn't in the ${chapterType === "campus" ? "GDG on Campus" : "GDG"} directory.` },
      { status: 400 },
    );
  }
  const chapterName =
    chapterType === "other"
      ? rawChapterName.replace(/\s+/g, " ").trim().slice(0, 80)
      : canonicalChapterName(chapterType, rawChapterName)!;

  // If another submission already exists for this chapter+country (case-
  // insensitive match), adopt that one's display label so casing stays
  // consistent on the showcase and the map.
  const existing = await listProjectsRaw();
  const incomingKey = chapterMatchKey(resolved, country);
  const match = existing.find((p) => chapterMatchKey(p.chapter, p.country) === incomingKey);
  const chapter = match ? match.chapter : normalizeChapter(resolved);

  // Optional collaborator emails — accept either an array or a
  // comma/whitespace-separated string. Lowercase, dedupe, drop anything that
  // doesn't look like an address. Capped at 10 to limit abuse.
  const collaboratorEmails = (() => {
    const raw = body.collaboratorEmails;
    if (!raw) return undefined;
    const candidates = Array.isArray(raw)
      ? raw.map((e) => String(e))
      : String(raw).split(/[,\s]+/);
    const cleaned = candidates
      .map((e) => e.trim().toLowerCase())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
      .map((e) => e.slice(0, 254));
    const unique = Array.from(new Set(cleaned));
    return unique.length ? unique.slice(0, 10) : undefined;
  })();

  const submitterEmail = user.email.toLowerCase();

  // One submission per person per day (UTC). submittedAt is ISO 8601, so the
  // first 10 chars are the calendar date.
  const today = new Date().toISOString().slice(0, 10);
  const alreadyToday = existing.some(
    (p) => p.submittedByEmail === submitterEmail && p.submittedAt.slice(0, 10) === today,
  );
  if (alreadyToday) {
    return NextResponse.json(
      { error: "You’ve already shared a build today — come back tomorrow to ship another." },
      { status: 429 },
    );
  }

  const picked = parseGoogleTech(body.googleTech);
  const googleTech = picked.length ? picked : undefined;

  const submitterProfileId = emailToProfileId(submitterEmail);
  const collaboratorProfileIds = collaboratorEmails?.map((e) => emailToProfileId(e));

  const project = await addProject({
    trackNumber,
    projectName: String(body.projectName).slice(0, 120).trim(),
    // Stamped from the verified Google identity, never from the request body.
    builderName: user.name.slice(0, 80).trim(),
    builderImage: user.image ?? undefined,
    // Lowercased so /me's listProjectsByEmail matches exactly in Firestore.
    submittedByEmail: submitterEmail,
    collaboratorEmails,
    // Opaque, irreversible — safe to expose publicly on PublicProject.
    submitterProfileId,
    collaboratorProfileIds,
    chapter,
    chapterType,
    chapterName,
    country,
    repoUrl,
    demoUrl: safeUrl(body.demoUrl),
    videoUrl: safeUrl(body.videoUrl),
    screenshotUrl,
    description: body.description ? String(body.description).slice(0, 500).trim() : undefined,
    surprise: String(body.surprise).slice(0, 600).trim(),
    // Whitelisted against the catalog — unknown ids are dropped, not rejected.
    googleTech,
    ...jamFields,
  });

  // Strip private fields from the response, even though we just wrote them.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    submittedByEmail: _email,
    collaboratorEmails: _collabs,
    organizerEmail: _organizer,
    ...publicProject
  } = project;
  /* eslint-enable @typescript-eslint/no-unused-vars */
  return NextResponse.json({ project: publicProject }, { status: 201 });
}
