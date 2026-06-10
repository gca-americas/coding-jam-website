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
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
