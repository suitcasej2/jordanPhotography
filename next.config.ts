import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: false,
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  serverExternalPackages: ["@prisma/client", "pg"],
  outputFileTracingIncludes: {
    "/api/**/*": ["./src/generated/prisma/**/*"],
    "/*": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
