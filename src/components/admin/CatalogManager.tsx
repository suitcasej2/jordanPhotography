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

function preloadImage(url: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Failed to load ${url}`));
    image.src = url;
  });
}

async function preloadPhotos(photos: Array<{ url: string }>) {
  await Promise.all(photos.map((photo) => preloadImage(photo.url)));
}

type CatalogDetail = {
  id: string;
  slug: string;
  title: string;
  clientName?: string | null;
  expiresAt: string;
  coverPhotoId: string | null;
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
  const [finishError, setFinishError] = useState("");

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

  async function handleFinish() {
    setFinishError("");
    setFinishing(true);

    try {
      const response = await fetch(`/api/admin/catalogs/${catalogId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Could not refresh gallery.");
      }

      const data = (await response.json()) as CatalogDetail;
      setCatalog(data);

      if (data.photos.length > 0) {
        await preloadPhotos(data.photos);
      }

      router.push("/admin");
    } catch {
      setFinishError("Some photos are still loading. Try again in a moment.");
    } finally {
      setFinishing(false);
    }
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
            {finishError ? (
              <p className="max-w-48 text-right text-xs text-red-500">{finishError}</p>
            ) : null}
          </div>
        </div>
      </FadeIn>

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
