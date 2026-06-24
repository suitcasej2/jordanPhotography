import { spawnSync } from "node:child_process";

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

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.DB_DATABASE_URL ??
    process.env.DB_PRISMA_DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL;
}

if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL =
    process.env.DB_POSTGRES_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.DATABASE_URL;
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = normalizePgConnectionUrl(process.env.DATABASE_URL);
}

if (process.env.DIRECT_URL) {
  process.env.DIRECT_URL = normalizePgConnectionUrl(process.env.DIRECT_URL);
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
