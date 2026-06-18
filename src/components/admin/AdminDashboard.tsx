"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { CatalogList, type AdminCatalog } from "@/components/admin/CatalogList";
import { CreateCatalogForm } from "@/components/admin/CreateCatalogForm";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageLoader } from "@/components/ui/Loader";

export type AdminLoadResult =
  | { ok: true }
  | { ok: false; error: string };

export function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [catalogs, setCatalogs] = useState<AdminCatalog[]>([]);
  const [sessionChecked, setSessionChecked] = useState(false);

  const loadCatalogs = useCallback(async (): Promise<AdminLoadResult> => {
    try {
      const response = await fetch("/api/catalogs", { credentials: "include" });

      if (response.status === 401) {
        setAuthenticated(false);
        return {
          ok: false,
          error:
            "Signed in, but the session cookie was not saved. Try again or check browser cookie settings.",
        };
      }

      if (!response.ok) {
        setAuthenticated(false);
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        return {
          ok: false,
          error:
            body?.error ??
            "Could not load galleries. Check the database connection.",
        };
      }

      const data = (await response.json()) as AdminCatalog[];
      setCatalogs(data);
      setAuthenticated(true);
      return { ok: true };
    } catch {
      setAuthenticated(false);
      return {
        ok: false,
        error: "Network error while loading galleries. Try again.",
      };
    }
  }, []);

  useEffect(() => {
    void loadCatalogs().finally(() => setSessionChecked(true));
  }, [loadCatalogs]);

  if (!sessionChecked) {
    return <PageLoader />;
  }

  if (!authenticated) {
    return <AdminLogin onSuccess={loadCatalogs} />;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <FadeIn>
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-muted">Studio</p>
            <h1 className="mt-2 font-display text-4xl font-light">Galleries</h1>
          </div>
          <Link
            href="/"
            className="text-xs tracking-[0.15em] uppercase text-muted transition hover:text-foreground"
          >
            View Site
          </Link>
        </div>
      </FadeIn>

      <CreateCatalogForm onCreated={loadCatalogs} />

      <div className="mt-12">
        <h2 className="mb-4 font-display text-2xl font-light">Your Catalogs</h2>
        <CatalogList catalogs={catalogs} />
      </div>
    </div>
  );
}
