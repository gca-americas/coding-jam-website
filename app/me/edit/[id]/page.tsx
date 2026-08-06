import Link from "next/link";
import { notFound } from "next/navigation";
import SubmitForm from "@/app/submit/SubmitForm";
import SignInGate from "@/app/submit/SignInGate";
import { getProjectById } from "@/lib/projects";
import { getJam, jamsOpenForSubmission, listPublishedJams } from "@/lib/jams";
import { parseChapter } from "@/lib/chapters";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user;
  const signedIn = Boolean(user?.email && user.name);

  if (!signedIn) {
    return (
      <section className="container-page py-16">
        <SignInGate />
      </section>
    );
  }

  const project = await getProjectById(id);
  if (!project) notFound();
  // Only the original submitter can edit.
  if (project.submittedByEmail?.toLowerCase() !== user!.email!.toLowerCase()) {
    notFound();
  }

  // Parsed on the server so the ~1,500-entry directories stay out of the bundle.
  // Legacy labels that don't resolve fall back to the free-text "other" type.
  const parsed = project.chapterType
    ? { type: project.chapterType, name: project.chapterName ?? project.chapter }
    : parseChapter(project.chapter);

  // Offer the same two-week window as a fresh submission, plus whichever jam
  // this build is already credited to — otherwise editing an older build would
  // silently drop its jam the moment the window moved past it.
  const window = jamsOpenForSubmission(await listPublishedJams());
  const current =
    project.jamSlug && !window.some((j) => j.slug === project.jamSlug)
      ? await getJam(project.jamSlug)
      : null;
  const jamChoices = [...(current ? [current] : []), ...window].map((j) => ({
    slug: j.slug,
    title: j.title,
    chapter: j.chapter,
    eventDate: j.eventDate,
  }));

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 diag-bg" />
        <div className="container-page relative py-14 sm:py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs text-ash shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-gyellow" /> Editing your build
          </div>
          <h1 className="h-display text-4xl sm:text-5xl mt-4 max-w-3xl leading-[1.05]">
            Update <span className="gradient-text">{project.projectName}</span>
          </h1>
          <p className="mt-4 text-ash">
            <Link href="/me" className="text-gblue hover:underline">Cancel and go back</Link>.
          </p>
        </div>
      </section>
      <section className="container-page py-10 pb-20">
        <SubmitForm
          editId={project.id}
          jamChoices={jamChoices}
          builder={{
            name: user!.name!,
            email: user!.email!,
            image: user!.image ?? null,
          }}
          initial={{
            trackNumber: project.trackNumber,
            jamSlug: project.jamSlug,
            projectName: project.projectName,
            chapterType: parsed.type,
            chapterName: parsed.name,
            country: project.country,
            repoUrl: project.repoUrl,
            demoUrl: project.demoUrl,
            videoUrl: project.videoUrl,
            screenshotUrl: project.screenshotUrl,
            description: project.description,
            surprise: project.surprise,
            collaboratorEmails: project.collaboratorEmails,
            googleTech: project.googleTech,
          }}
        />
      </section>
    </>
  );
}
