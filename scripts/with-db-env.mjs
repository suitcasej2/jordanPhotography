import { spawnSync } from "node:child_process";

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
