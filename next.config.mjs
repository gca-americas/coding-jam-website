/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a slim `.next/standalone/` server bundle for Docker / Cloud Run.
  output: "standalone",
  // Keep Google Cloud SDKs out of the webpack server bundle. Both use dynamic
  // protobuf code generation at runtime — bundling them produces
  // "toProto3JSON: don't know how to convert value …" errors on every write.
  serverExternalPackages: [
    "@google-cloud/firestore",
    "@google-cloud/storage",
    "google-gax",
    "protobufjs",
  ],

  /**
   * Retired tracks. These eight URLs were public and may be in chapter emails,
   * Discord and social posts, so they redirect rather than 404.
   *
   * Only "build your own idea" has an exact successor. The rest land on the
   * topic index on purpose: sending someone who wanted Mood Jar to a topic that
   * merely sounds adjacent is more confusing than letting them choose.
   *
   * Temporary (307) while the topics proposal is under review — switch to
   * `permanent: true` once it ships, so the 308s get cached.
   */
  async redirects() {
    const retired = [
      "image-makeover-studio",
      "ai-avatar-generator",
      "my-special-year",
      "reflective-journal",
      "one-page-portfolio",
      "ai-character-chat",
    ];
    return [
      ...retired.map((slug) => ({
        source: `/tracks/${slug}`,
        destination: "/#jams",
        permanent: false,
      })),
      {
        source: "/tracks/build-your-own-idea",
        destination: "/tracks/your-own-idea",
        permanent: false,
      },
      // /tracks has never had an index route; point it somewhere useful.
      // The topics experiment briefly lived at its own URLs.
      { source: "/topics", destination: "/#jams", permanent: false },
      { source: "/tracks", destination: "/#jams", permanent: false },
      { source: "/topics/:slug", destination: "/tracks/:slug", permanent: false },
    ];
  },
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
