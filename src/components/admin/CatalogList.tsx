"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export type AdminCatalog = {
  id: string;
  slug: string;
  title: string;
  clientName?: string | null;
  expiresAt: string;
  photoCount: number;
  isExpired: boolean;
};

export function CatalogList({ catalogs }: { catalogs: AdminCatalog[] }) {
  if (catalogs.length === 0) {
    return (
      <p className="py-12 text-center text-muted">
        No galleries yet. Create your first one above.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border/60 rounded-sm border border-border/60">
      {catalogs.map((catalog, index) => {
        const daysLeft = Math.max(
          0,
          Math.ceil(
            (new Date(catalog.expiresAt).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          ),
        );

        return (
          <motion.div
            key={catalog.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 className="font-display text-xl font-light">{catalog.title}</h3>
              {catalog.clientName ? (
                <p className="text-sm text-muted">{catalog.clientName}</p>
              ) : null}
              <p className="mt-1 text-xs text-muted">
                {catalog.photoCount} photos ·{" "}
                {catalog.isExpired ? "Expired" : `${daysLeft} days left`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="text-xs tracking-[0.15em] uppercase text-muted transition hover:text-accent"
                onClick={() => {
                  const url = `${window.location.origin}/gallery/${catalog.slug}`;
                  void navigator.clipboard.writeText(url);
                }}
              >
                Copy Link
              </button>
              <Link
                href={`/gallery/${catalog.slug}`}
                className="text-xs tracking-[0.15em] uppercase text-muted transition hover:text-foreground"
                target="_blank"
              >
                Preview
              </Link>
              <Link
                href={`/admin/catalog/${catalog.id}`}
                className="border border-foreground/20 px-4 py-2 text-xs tracking-[0.15em] uppercase transition hover:border-accent hover:text-accent"
              >
                Manage
              </Link>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
