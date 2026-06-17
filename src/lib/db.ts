import path from "path";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveSqliteUrl() {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith("file:")) return url;

  const filePath = url.slice("file:".length);
  if (path.isAbsolute(filePath)) return url;

  // Prisma CLI resolves file:./dev.db relative to prisma/; Next.js runtime uses cwd.
  const absolute = path.join(
    process.cwd(),
    "prisma",
    filePath.replace(/^\.\//, ""),
  );
  return `file:${absolute}`;
}

const databaseUrl = resolveSqliteUrl();
if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
