import type { Metadata } from "next";
import ToolGuideShell from "../ToolGuideShell";
import { getT } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("meta.antigravity.title"), description: t("meta.antigravity.desc") };
}

export default async function AntigravityGuidePage() {
  const t = await getT();
  return (
    <ToolGuideShell
      eyebrow={t("guide.eyebrow")}
      emoji="🚀"
      title="Antigravity"
      tagline={t("ag.tagline")}
      forWhom={t("ag.forWhom")}
      accent="bg-gred"
      codelab={{
        href: "https://codelabs.developers.google.com/codelabs/coding-jam/instructions#0",
        heading: t("ag.codelab.heading"),
        blurb: t("ag.codelab.blurb"),
      }}
      checklist={[
        {
          heading: t("guide.installThese"),
          note: t("ag.install.note"),
          items: [
            {
              title: "Antigravity",
              color: "bg-gblue",
              body: t("ag.install.1.body"),
              link: { href: "https://antigravity.google/download", label: t("ag.install.1.link") },
            },
            {
              title: t("ag.install.2.title"),
              color: "bg-gred",
              body: t("ag.install.2.body"),
            },
            {
              title: t("ag.install.3.title"),
              color: "bg-gyellow",
              body: t("ag.install.3.body"),
            },
          ],
        },
        {
          heading: t("guide.worthHaving"),
          note: t("ag.worth.note"),
          items: [
            {
              title: "uv",
              color: "bg-gblue",
              body: t("ag.worth.1.body"),
              link: { href: "https://astral.sh/uv", label: t("ag.worth.1.link") },
            },
            {
              title: t("ag.worth.2.title"),
              color: "bg-gred",
              body: t("ag.worth.2.body"),
            },
            {
              title: t("ag.worth.3.title"),
              color: "bg-gyellow",
              body: t("ag.worth.3.body"),
            },
            {
              title: t("ag.worth.4.title"),
              color: "bg-ggreen",
              body: t("ag.worth.4.body"),
            },
          ],
        },
      ]}
      steps={[
        {
          title: t("ag.step1.title"),
          body: t("ag.step1.body"),
          media: {
            src: "/guides/antigravity/01-claim-credits.gif",
            alt: t("ag.step1.alt"),
            kind: "GIF",
          },
        },
        {
          title: t("ag.step2.title"),
          body: t("ag.step2.body"),
          href: "https://console.cloud.google.com/projectcreate",
          media: {
            src: "/guides/antigravity/02-create-project-billing.gif",
            alt: t("ag.step2.alt"),
            kind: "GIF",
          },
        },
        {
          title: t("ag.step3.title"),
          body: t("ag.step3.body"),
          href: "https://console.cloud.google.com/agent-platform/overview",
          media: {
            src: "/guides/antigravity/03-enable-agent-platform.gif",
            alt: t("ag.step3.alt"),
            kind: "GIF",
          },
        },
        {
          title: t("ag.step4.title"),
          body: t("ag.step4.body"),
          media: {
            src: "/guides/antigravity/04-copy-project-id.gif",
            alt: t("ag.step4.alt"),
            kind: "GIF",
          },
        },
        {
          title: t("ag.step5.title"),
          body: t("ag.step5.body"),
          media: {
            src: "/guides/antigravity/05-antigravity-use-gcp.gif",
            alt: t("ag.step5.alt"),
            kind: "GIF",
          },
        },
        {
          title: t("ag.step6.title"),
          body: t("ag.step6.body"),
          media: {
            src: "/guides/antigravity/06-paste-project-id.gif",
            alt: t("ag.step6.alt"),
            kind: "GIF",
          },
        },
      ]}
      otherHref="/tools/ai-studio"
      otherLabel={`🎨 ${t("guide.ratherAiStudio")}`}
    />
  );
}
