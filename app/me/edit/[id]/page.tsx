import Link from "next/link";
import { notFound } from "next/navigation";
import SubmitForm from "@/app/submit/SubmitForm";
import SignInGate from "@/app/submit/SignInGate";
import { TRACKS } from "@/lib/tracks";
import { getProjectById } from "@/lib/projects";
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
          tracks={TRACKS.map((t) => ({ number: t.number, project: t.project }))}
          builder={{
            name: user!.name!,
            email: user!.email!,
            image: user!.image ?? null,
          }}
          initial={{
            trackNumber: project.trackNumber,
            projectName: project.projectName,
            chapter: project.chapter,
            country: project.country,
            repoUrl: project.repoUrl,
            demoUrl: project.demoUrl,
            videoUrl: project.videoUrl,
            screenshotUrl: project.screenshotUrl,
            description: project.description,
            surprise: project.surprise,
            collaboratorEmails: project.collaboratorEmails,
          }}
        />
      </section>
    </>
  );
}
