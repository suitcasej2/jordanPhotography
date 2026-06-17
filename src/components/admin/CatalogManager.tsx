"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { SortablePhotoGrid } from "@/components/admin/SortablePhotoGrid";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageLoader } from "@/components/ui/Loader";

type CatalogDetail = {
  id: string;
  slug: string;
  title: string;
  clientName?: string | null;
  expiresAt: string;
  photos: Array<{
    id: string;
    originalName: string;
    url: string;
  }>;
};

export function CatalogManager({ catalogId }: { catalogId: string }) {
  const [catalog, setCatalog] = useState<CatalogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/catalogs/${catalogId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        setCatalog(null);
        return;
      }

      const data = (await response.json()) as CatalogDetail;
      setCatalog(data);
    } catch {
      setCatalog(null);
    } finally {
      setLoading(false);
    }
  }, [catalogId]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  async function handleConfirmRemove(photoId: string) {
    setRemovingId(photoId);
    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) return;

      setCatalog((current) =>
        current
          ? {
              ...current,
              photos: current.photos.filter((photo) => photo.id !== photoId),
            }
          : current,
      );
      setConfirmId(null);
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) return <PageLoader />;
  if (!catalog) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-muted">Gallery not found.</p>
        <Link href="/admin" className="mt-4 inline-block text-accent">
          Back to admin
        </Link>
      </div>
    );
  }

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(catalog.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    ),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <FadeIn>
        <Link
          href="/admin"
          className="text-xs tracking-[0.15em] uppercase text-muted transition hover:text-foreground"
        >
          ← Back
        </Link>
        <h1 className="mt-6 font-display text-4xl font-light">{catalog.title}</h1>
        <p className="mt-2 text-sm text-muted">
          {catalog.photos.length} photos · {daysLeft} days remaining · /gallery/
          {catalog.slug}
        </p>
      </FadeIn>

      <div className="mt-10">
        <PhotoUploader catalogId={catalogId} onUploaded={loadCatalog} />
      </div>

      {catalog.photos.length > 0 ? (
        <div className="mt-12">
          <SortablePhotoGrid
            catalogId={catalogId}
            photos={catalog.photos}
            onPhotosChange={(photos) =>
              setCatalog((current) => (current ? { ...current, photos } : current))
            }
            onRemove={setConfirmId}
            removing={removingId}
            confirmId={confirmId}
            onConfirm={handleConfirmRemove}
            onCancel={() => setConfirmId(null)}
          />
        </div>
      ) : null}
    </div>
  );
}
