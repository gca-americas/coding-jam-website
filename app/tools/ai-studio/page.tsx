import type { Metadata } from "next";
import ToolGuideShell from "../ToolGuideShell";

export const metadata: Metadata = {
  title: "Set up Google AI Studio for your jam — GDG Coding Jams",
  description:
    "Everything in the browser. No install, no terminal — the setup guide for builders bringing AI Studio to a Coding Jam.",
};

export default function AiStudioGuidePage() {
  return (
    <ToolGuideShell
      eyebrow="Tool guide"
      emoji="🎨"
      title="AI Studio"
      tagline="Open a tab, describe what you want, watch it appear. Nothing to install before the doors open."
      forWhom="For builders who don't write code day to day — designers, PMs, students, anyone with an idea and a browser."
      accent="bg-gblue"
      notice={{
        heading: "The Google Cloud credits aren't for this path — and you don't need them.",
        body: (
          <>
            <p>
              The credits your organizer hands out attach to a Google Cloud billing account, which
              is the Antigravity path. AI Studio doesn&rsquo;t touch any of that: sign in with your
              Google account and start building. Nothing to claim, nothing to bill, nothing to
              configure.
            </p>
            <p>
              It&rsquo;s free but not unlimited — if you push it hard you may be asked to slow down
              for a moment. Wait it out rather than starting over; you won&rsquo;t lose anything.
            </p>
            <p className="text-ash">
              Need heavier or longer-running usage than that? Switch to the Antigravity path, where
              the credits do apply.
            </p>
          </>
        ),
      }}
      checklist={[
        {
          heading: "Install these",
          note: "Nothing. That's the point.",
          items: [
            {
              title: "A browser",
              color: "bg-gblue",
              body: "Anything modern. AI Studio runs entirely in the tab — there's no IDE to download, no package manager, no terminal.",
            },
            {
              title: "A Google account",
              color: "bg-gred",
              body: "Sign in at aistudio.google.com and you're in — no key, no project, no setup. Use the same account you'll share your build with afterwards.",
              link: { href: "https://aistudio.google.com", label: "Open AI Studio" },
            },
          ],
        },
        {
          heading: "Worth having",
          note: "Optional, but it makes the session smoother.",
          items: [
            {
              title: "Your inputs, ready to go",
              color: "bg-gyellow",
              body: "If your track needs a photo, a dataset or a block of text, have it on the machine before you sit down rather than hunting for it mid-build.",
            },
          ],
        },
      ]}
      steps={[
        {
          title: "Sign in",
          body:
            "Open AI Studio with your Google account. That's the whole setup — no workspace to create, no key to generate, nothing to claim.",
          href: "https://aistudio.google.com",
        },
        {
          title: "Hit + App in the sidebar",
          body:
            "That's it, that's the step. Everything you build lives in there — no project scaffolding, no install, no terminal. Describe what you want and start.",
          media: {
            src: "/guides/ai-studio/01-new-app.png",
            alt: "The + App button in the AI Studio sidebar",
            kind: "PNG",
          },
        },
        {
          title: "Shape the result",
          body:
            "The first version is never the one you keep — that's the point of working this way. Narrow it down: change the tone, fix the layout, drop the feature that isn't earning its place. Small, specific asks beat one long one.",
        },
        {
          title: "Get a link you can share",
          body:
            "How to get from a working prototype to something you can send people — and onto the showcase.",
        },
      ]}
      otherHref="/tools/antigravity"
      otherLabel="🚀 I'd rather use Antigravity"
    />
  );
}
