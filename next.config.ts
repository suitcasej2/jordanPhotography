import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.private.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384, 512],
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
