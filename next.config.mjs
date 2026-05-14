/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a slim `.next/standalone/` server bundle for Docker / Cloud Run.
  output: "standalone",
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
