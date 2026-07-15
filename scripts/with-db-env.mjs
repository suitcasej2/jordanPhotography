import { spawnSync } from "node:child_process";
import { config as loadEnv } from "dotenv";

// Node does not load .env automatically — Prisma does in its child process,
// but this wrapper runs first and must read DB_* vars from the file.
loadEnv();

function readEnv(...names) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

function normalizePgConnectionUrl(connectionString) {
  if (!connectionString) return connectionString;

  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode");

    if (sslmode === "prefer" || sslmode === "require" || sslmode === "verify-ca") {
      url.searchParams.set("sslmode", "verify-full");
    }

    return url.toString();
  } catch {
    return connectionString;
  }
}

function getUrlScheme(connectionString) {
  if (!connectionString) return null;
  const match = connectionString.trim().match(/^([a-z][a-z0-9+.-]*):/i);
  return match?.[1]?.toLowerCase() ?? null;
}

function isPostgresScheme(scheme) {
  return scheme === "postgresql" || scheme === "postgres";
}

const databaseUrl = readEnv(
  "DATABASE_URL",
  "DB_DATABASE_URL",
  "DB_PRISMA_DATABASE_URL",
  "POSTGRES_PRISMA_URL",
);

const directUrl = readEnv(
  "DIRECT_URL",
  "DB_POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
) ?? databaseUrl;

if (databaseUrl) {
  process.env.DATABASE_URL = normalizePgConnectionUrl(databaseUrl);
} else {
  delete process.env.DATABASE_URL;
}

if (directUrl) {
  process.env.DIRECT_URL = normalizePgConnectionUrl(directUrl);
} else {
  delete process.env.DIRECT_URL;
}

const isMigrateCommand = process.argv.slice(2).join(" ").includes("prisma migrate");

if (!process.env.DATABASE_URL) {
  console.error(
    "Database URL is not set. Add DATABASE_URL (or DB_DATABASE_URL) to .env.\n" +
      "If you use Vercel Prisma Postgres:\n" +
      "  vercel link\n" +
      "  vercel env pull .env --environment=production\n" +
      "Copy DATABASE_URL and DIRECT_URL from the Vercel dashboard if pull omits them.",
  );
  process.exit(1);
}

const databaseScheme = getUrlScheme(process.env.DATABASE_URL);
if (databaseScheme && !isPostgresScheme(databaseScheme)) {
  console.error(
    `DATABASE_URL uses unsupported scheme "${databaseScheme}". This project expects PostgreSQL (postgresql://...).\n` +
      "Pull values from Vercel with:\n" +
      "  vercel env pull .env --environment=production",
  );
  process.exit(1);
}

if (isMigrateCommand) {
  const directScheme = getUrlScheme(process.env.DIRECT_URL);
  if (directScheme && !isPostgresScheme(directScheme)) {
    console.error(
      `DIRECT_URL uses unsupported scheme "${directScheme}". Prisma migrations need postgres:// or postgresql://.\n` +
        "Set DIRECT_URL or DB_POSTGRES_URL from Vercel Prisma Postgres (not the prisma+postgres pooled URL).",
    );
    process.exit(1);
  }
}

const command = process.argv.slice(2).join(" ");
if (!command) {
  process.exit(0);
}

const result = spawnSync(command, {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
