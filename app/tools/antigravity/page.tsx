import type { Metadata } from "next";
import ToolGuideShell from "../ToolGuideShell";

export const metadata: Metadata = {
  title: "Install Antigravity and set it up for your jam — GDG Coding Jams",
  description:
    "An AI-driven IDE on your own machine. The pre-flight checklist and setup guide for builders bringing Antigravity to a Coding Jam.",
};

export default function AntigravityGuidePage() {
  return (
    <ToolGuideShell
      eyebrow="Tool guide"
      emoji="🚀"
      title="Antigravity"
      tagline="Your editor, your terminal, your repo — with the agent doing the typing."
      forWhom="For people who already write code and have a working dev setup on the laptop they're bringing."
      accent="bg-gred"
      codelab={{
        href: "https://codelabs.developers.google.com/codelabs/coding-jam/instructions#0",
        heading: "Follow the codelab.",
        blurb:
          "Zero to a working app in about an hour, one step at a time. It walks you through Setup, Plan, Review, Build, API and Verify — you direct the agent, it does the typing.",
      }}
      checklist={[
        {
          heading: "Install these",
          note: "Required — the session assumes all three are working.",
          items: [
            {
              title: "Antigravity",
              color: "bg-gblue",
              body: "The Jam runs on Antigravity — without it you can't follow the codelab. It's a sizeable download, so do it before the day rather than on venue wifi.",
              link: { href: "https://antigravity.google/download", label: "Download Antigravity" },
            },
            {
              title: "Git, and a GitHub account",
              color: "bg-gred",
              body: "Every starter is a GitHub repo you clone during setup. Check you can actually clone something — an unconfigured SSH key is the classic five-minutes-lost moment.",
            },
            {
              title: "A Google account, for the Gemini API",
              color: "bg-gyellow",
              body: "You'll create an API key at ai.google.dev. The free tier covers a two-hour session comfortably. Use the same account you'll share your build with afterwards.",
            },
          ],
        },
        {
          heading: "Worth having",
          note: "Not required on the day — the codelab covers uv, and the rest just smooth things out.",
          items: [
            {
              title: "uv",
              color: "bg-gblue",
              body: "The Python package manager the starters use — it replaces pip and venv, and installs the right Python for you if you haven't got one. The codelab walks you through it, so you can also leave this until the day.",
              link: { href: "https://astral.sh/uv", label: "Install uv" },
            },
            {
              title: "Node.js 20+ and npm",
              color: "bg-gred",
              body: "Not needed for the Python backend, but the frontend-heavy tracks are easier with it, and most JS tooling assumes it. Check with node -v — if that prints a version you're already set.",
            },
            {
              title: "A terminal you're comfortable in",
              color: "bg-gyellow",
              body: "You'll run a handful of commands. Whatever you already use is the right one — the jam doesn't care which shell.",
            },
            {
              title: "Room on disk",
              color: "bg-ggreen",
              body: "A couple of GB free for the IDE and its dependencies. Worth checking before the day rather than discovering it mid-install.",
            },
          ],
        },
      ]}
      steps={[
        {
          title: "Claim your credits",
          body:
            "Your instructor shares the claim link on the day — it isn't public. Open it with your Gmail account, not a work or school one: the credits attach to whichever Google identity you claim with, and a managed account often can't accept them. If you haven't joined the Google Developer Program before, it'll ask you to join first. That's free and takes a minute.",
          media: {
            src: "/guides/antigravity/01-claim-credits.gif",
            alt: "Claiming the credits, including the Join the Google Developer Program prompt",
            kind: "GIF",
          },
        },
        {
          title: "Create a Google Cloud project and attach billing",
          body:
            "Make a fresh project for the jam rather than reusing one — it keeps the credits, quotas and any mess separate from whatever else you run. Then attach the billing account your credits landed in, or nothing you do next will bill against them.",
          href: "https://console.cloud.google.com/projectcreate",
          media: {
            src: "/guides/antigravity/02-create-project-billing.gif",
            alt: "Creating the project, then attaching the billing account",
            kind: "GIF",
          },
        },
        {
          title: "Enable Agent Platform",
          body:
            "Open Agent Platform on your new project and hit Enable at the top of the page. Nothing downstream works until this is on, and it's the step that most often gets skipped.",
          href: "https://console.cloud.google.com/agent-platform/overview",
          media: {
            src: "/guides/antigravity/03-enable-agent-platform.gif",
            alt: "Hitting Enable at the top of the Agent Platform overview",
            kind: "GIF",
          },
        },
        {
          title: "Copy your project ID",
          body:
            "The project ID, not the display name — they're usually different, and only the ID works. You'll paste it into Antigravity in a moment.",
          media: {
            src: "/guides/antigravity/04-copy-project-id.gif",
            alt: "Copying the project ID from the Cloud Console",
            kind: "GIF",
          },
        },
        {
          title: "Open Antigravity — sign in with Google Cloud",
          body:
            "This is the step people miss. On the welcome screen, choose the Google Cloud project option rather than your personal Google account, so the session runs against the project your credits are in.",
          media: {
            src: "/guides/antigravity/05-antigravity-use-gcp.gif",
            alt: "Choosing Google Cloud project on the Antigravity welcome screen",
            kind: "GIF",
          },
        },
        {
          title: "Paste your project ID",
          body:
            "Paste the ID you copied in step 4. Antigravity connects to that project, and you're ready to build.",
          media: {
            src: "/guides/antigravity/06-paste-project-id.gif",
            alt: "Pasting the project ID into Antigravity",
            kind: "GIF",
          },
        },
      ]}
      otherHref="/tools/ai-studio"
      otherLabel="🎨 I'd rather use AI Studio"
    />
  );
}
