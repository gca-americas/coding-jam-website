import type { Metadata } from "next";
import ToolGuideShell from "../ToolGuideShell";
import { getT } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("meta.aiStudio.title"), description: t("meta.aiStudio.desc") };
}

export default async function AiStudioGuidePage() {
  const t = await getT();
  return (
    <ToolGuideShell
      eyebrow={t("guide.eyebrow")}
      emoji="🎨"
      title="AI Studio"
      tagline={t("ais.tagline")}
      forWhom={t("ais.forWhom")}
      accent="bg-gblue"
      notice={{
        heading: t("ais.notice.heading"),
        body: (
          <>
            <p>{t("ais.notice.p1")}</p>
            <p>{t("ais.notice.p2")}</p>
            <p className="text-ash">{t("ais.notice.p3")}</p>
          </>
        ),
      }}
      checklist={[
        {
          heading: t("guide.installThese"),
          note: t("ais.install.note"),
          items: [
            {
              title: t("ais.install.1.title"),
              color: "bg-gblue",
              body: t("ais.install.1.body"),
            },
            {
              title: t("ais.install.2.title"),
              color: "bg-gred",
              body: t("ais.install.2.body"),
              link: { href: "https://aistudio.google.com", label: t("ais.install.2.link") },
            },
          ],
        },
        {
          heading: t("guide.worthHaving"),
          note: t("ais.worth.note"),
          items: [
            {
              title: t("ais.worth.1.title"),
              color: "bg-gyellow",
              body: t("ais.worth.1.body"),
            },
          ],
        },
      ]}
      steps={[
        {
          title: t("ais.step1.title"),
          body: t("ais.step1.body"),
          href: "https://aistudio.google.com",
        },
        {
          title: t("ais.step2.title"),
          body: t("ais.step2.body"),
          media: {
            src: "/guides/ai-studio/01-new-app.png",
            alt: t("ais.step2.alt"),
            kind: "PNG",
          },
        },
        {
          title: t("ais.step3.title"),
          body: t("ais.step3.body"),
        },
        {
          title: t("ais.step4.title"),
          body: t("ais.step4.body"),
        },
      ]}
      otherHref="/tools/antigravity"
      otherLabel={`🚀 ${t("guide.ratherAntigravity")}`}
    />
  );
}
