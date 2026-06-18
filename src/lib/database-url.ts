/**
 * Vercel Prisma Postgres may expose prefixed vars (e.g. DB_DATABASE_URL).
 * Runtime queries should use the pooled connection string.
 */
export function resolvePooledDatabaseUrl() {
  return (
    process.env.DATABASE_URL ??
    process.env.DB_DATABASE_URL ??
    process.env.DB_PRISMA_DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL
  );
}

/**
 * Prisma CLI (migrate, db push, studio) needs a direct connection.
 */
export function resolveDirectDatabaseUrl() {
  return (
    process.env.DIRECT_URL ??
    process.env.DB_POSTGRES_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    resolvePooledDatabaseUrl()
  );
}
