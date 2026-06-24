/**
 * Vercel Prisma Postgres may expose prefixed vars (e.g. DB_DATABASE_URL).
 * Runtime queries should use the pooled connection string.
 */
function normalizePgConnectionUrl(connectionString: string) {
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

export function resolvePooledDatabaseUrl() {
  const connectionString =
    process.env.DATABASE_URL ??
    process.env.DB_DATABASE_URL ??
    process.env.DB_PRISMA_DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL;

  return connectionString
    ? normalizePgConnectionUrl(connectionString)
    : undefined;
}

/**
 * Prisma CLI (migrate, db push, studio) needs a direct connection.
 */
export function resolveDirectDatabaseUrl() {
  const connectionString =
    process.env.DIRECT_URL ??
    process.env.DB_POSTGRES_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    resolvePooledDatabaseUrl();

  return connectionString
    ? normalizePgConnectionUrl(connectionString)
    : undefined;
}
