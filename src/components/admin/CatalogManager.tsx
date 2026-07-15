"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditCatalogForm } from "@/components/admin/EditCatalogForm";
import { GalleryPasswordSettings } from "@/components/admin/GalleryPasswordSettings";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { SortablePhotoGrid } from "@/components/admin/SortablePhotoGrid";
import { FadeIn, MotionButton } from "@/components/motion/FadeIn";
import { PageLoader } from "@/components/ui/Loader";

type CatalogDetail = {
  id: string;
  slug: string;
  title: string;
  clientName?: string | null;
  expiresAt: string;
  coverPhotoId: string | null;
  missingPreviewCount?: number;
  photos: Array<{
    id: string;
    originalName: string;
    url: string;
  }>;
};

export function CatalogManager({ catalogId }: { catalogId: string }) {
  const router = useRouter();
  const [catalog, setCatalog] = useState<CatalogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [previewsRemaining, setPreviewsRemaining] = useState(0);

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
      setPreviewsRemaining(data.missingPreviewCount ?? 0);
    } catch {
      setCatalog(null);
    } finally {
      setLoading(false);
    }
  }, [catalogId]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  async function handlePrepareGallery() {
    setOptimizing(true);
    try {
      let remaining = previewsRemaining;

      while (remaining > 0) {
        const response = await fetch(`/api/admin/catalogs/${catalogId}/previews`, {
          method: "POST",
          credentials: "include",
        });
        const data = (await response.json()) as {
          done?: boolean;
          processed?: number;
          remaining?: number;
        };

        if (!response.ok) break;

        remaining = data.remaining ?? 0;
        setPreviewsRemaining(remaining);

        if (data.done || !data.processed) break;
      }

      await loadCatalog();
    } finally {
      setOptimizing(false);
    }
  }

  async function handleFinish() {
    setFinishing(true);
    router.push("/admin");
    setFinishing(false);
  }

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
              coverPhotoId:
                current.coverPhotoId === photoId ? null : current.coverPhotoId,
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
        <div className="flex items-start justify-between gap-6">
          <div>
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
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <MotionButton
              type="button"
              onClick={() => void handleFinish()}
              disabled={finishing || uploading}
              className="bg-foreground px-5 py-2.5 text-xs tracking-[0.15em] uppercase text-background disabled:opacity-40"
            >
              {finishing ? "Finishing…" : "Finish"}
            </MotionButton>
          </div>
        </div>
      </FadeIn>

      {previewsRemaining > 0 ? (
        <div className="mt-8 flex flex-col gap-4 rounded-sm border border-border/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-foreground">
              {previewsRemaining} photos need web-sized copies for fast client viewing.
            </p>
            <p className="mt-1 text-xs text-muted">
              Run this once before sharing the gallery link.
            </p>
          </div>
          <MotionButton
            type="button"
            onClick={() => void handlePrepareGallery()}
            disabled={optimizing || uploading}
            className="border border-foreground/20 px-5 py-2.5 text-xs tracking-[0.15em] uppercase transition hover:border-accent hover:text-accent disabled:opacity-40"
          >
            {optimizing ? "Preparing…" : "Prepare gallery"}
          </MotionButton>
        </div>
      ) : null}

      <div className="mt-10">
        <EditCatalogForm
          catalogId={catalogId}
          initialTitle={catalog.title}
          initialClientName={catalog.clientName}
          initialSlug={catalog.slug}
          onUpdated={(updates) =>
            setCatalog((current) => (current ? { ...current, ...updates } : current))
          }
        />
      </div>

      <div className="mt-10">
        <GalleryPasswordSettings catalogId={catalogId} />
      </div>

      <div className="mt-10">
        <PhotoUploader
          catalogId={catalogId}
          onUploaded={loadCatalog}
          onUploadingChange={setUploading}
        />
      </div>

      {catalog.photos.length > 0 ? (
        <div className="mt-12">
          <SortablePhotoGrid
            catalogId={catalogId}
            photos={catalog.photos}
            coverPhotoId={catalog.coverPhotoId}
            onCoverPhotoChange={(coverPhotoId) =>
              setCatalog((current) => (current ? { ...current, coverPhotoId } : current))
            }
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
