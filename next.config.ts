import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Bundle the seeded SQLite database into serverless functions so the
  // cold-start copy to /tmp in src/lib/db.ts can find it on Vercel.
  outputFileTracingIncludes: {
    "/api/**/*": ["./db/**"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
