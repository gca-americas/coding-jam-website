import type { Metadata } from "next";
import { getCopy, getLocale, getT } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/client";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

/**
 * Titles and descriptions come from the catalogue, so a page shared from a
 * translated session previews in that language. That rules out a static
 * `metadata` export — reading the locale cookie needs a request.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const title = t("meta.site.title");
  const description = t("meta.site.desc");
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "GDG Coding Jams",
      // TODO: drop a 1200x630 PNG at public/og-default.png. Until then, falls back to no image.
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "GDG Coding Jams" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-default.png"],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  // Every key, once, for the client tree. See lib/i18n/client.tsx.
  const messages = await getCopy([""]);
  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Display:wght@400;500;700&family=Google+Sans+Text:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <I18nProvider messages={messages}>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
