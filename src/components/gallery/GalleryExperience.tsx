"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GalleryControls } from "@/components/gallery/GalleryControls";
import {
  GalleryPreferencesProvider,
  useGalleryPreferences,
} from "@/components/gallery/GalleryPreferences";
import { PasswordGate } from "@/components/gallery/PasswordGate";
import { PhotoGrid, type GalleryPhoto } from "@/components/gallery/PhotoGrid";
import { PhotoSlideshow } from "@/components/gallery/PhotoSlideshow";
import { FadeIn } from "@/components/motion/FadeIn";
import { BookingFooter } from "@/components/site/BookingFooter";
import { PageLoader, SkeletonGrid } from "@/components/ui/Loader";

type CatalogResponse = {
  slug: string;
  title: string;
  clientName?: string | null;
  expiresAt: string;
  daysRemaining: number;
  photoCount: number;
  authenticated: boolean;
  photos?: GalleryPhoto[];
  expired?: boolean;
  error?: string;
};

function GalleryContent({ slug }: { slug: string }) {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { viewMode } = useGalleryPreferences();

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/catalogs/${slug}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = (await response.json()) as CatalogResponse;

      if (response.status === 410 || data.expired) {
        setError("This gallery has expired and is no longer available.");
        setCatalog(null);
        return;
      }

      if (!response.ok) {
        setError(data.error ?? "Gallery not found.");
        setCatalog(null);
        return;
      }

      setCatalog(data);
    } catch {
      setError("Unable to load gallery.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  if (loading) {
    return (
      <div className="px-6 py-12">
        <PageLoader />
        <div className="mx-auto mt-12 max-w-7xl">
          <SkeletonGrid />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <FadeIn className="max-w-md text-center">
          <p className="text-xs tracking-[0.35em] uppercase text-muted">Unavailable</p>
          <h1 className="mt-4 font-display text-3xl font-light">{error}</h1>
        </FadeIn>
      </div>
    );
  }

  if (!catalog) return null;

  if (!catalog.authenticated) {
    return (
      <PasswordGate
        slug={slug}
        catalog={catalog}
        onAuthenticated={loadCatalog}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="gallery"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <GalleryControls slug={slug} photoCount={catalog.photoCount} />

        <div className="mx-auto max-w-7xl px-6 py-10">
          <FadeIn>
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs tracking-[0.35em] uppercase text-muted">
                  Your Gallery
                </p>
                <h1 className="mt-2 font-display text-4xl font-light tracking-tight sm:text-5xl">
                  {catalog.title}
                </h1>
                {catalog.clientName ? (
                  <p className="mt-2 text-muted">For {catalog.clientName}</p>
                ) : null}
              </div>
              <p className="text-sm text-muted">
                Available for {catalog.daysRemaining} more{" "}
                {catalog.daysRemaining === 1 ? "day" : "days"}
              </p>
            </div>
          </FadeIn>

          {catalog.photos && catalog.photos.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {viewMode === "grid" ? (
                  <PhotoGrid photos={catalog.photos} />
                ) : (
                  <PhotoSlideshow photos={catalog.photos} />
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <p className="text-center text-muted">No photos have been added yet.</p>
          )}
        </div>

        <BookingFooter />
      </motion.div>
    </AnimatePresence>
  );
}

export function GalleryExperience({ slug }: { slug: string }) {
  return (
    <GalleryPreferencesProvider>
      <GalleryContent slug={slug} />
    </GalleryPreferencesProvider>
  );
}
