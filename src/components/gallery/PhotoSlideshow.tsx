"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProtectedImage } from "@/components/ui/ProtectedImage";
import type { GalleryPhoto } from "@/components/gallery/PhotoGrid";

export function PhotoSlideshow({ photos }: { photos: GalleryPhoto[] }) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const photo = photos[index];

  const goTo = useCallback(
    (next: number) => {
      setLoaded(false);
      setIndex(Math.max(0, Math.min(next, photos.length - 1)));
    },
    [photos.length],
  );

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goTo(index + 1);
      if (event.key === "ArrowLeft") goTo(index - 1);
    },
    [goTo, index],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!photo) return null;

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-sm bg-surface">
        {!loaded ? <div className="skeleton-shimmer absolute inset-0" /> : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={photo.id}
            className="relative h-[min(72vh,900px)] w-full max-w-6xl px-4 sm:px-8"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProtectedImage
              src={photo.url}
              alt={photo.originalName}
              fill
              className={`object-contain transition-opacity duration-300 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
              sizes="100vw"
              priority
              onLoad={() => setLoaded(true)}
            />
          </motion.div>
        </AnimatePresence>

        {index > 0 ? (
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => goTo(index - 1)}
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition hover:border-accent hover:text-accent sm:left-6"
          >
            <span className="font-arrows text-[1.75rem] leading-none">arrow_back</span>
          </button>
        ) : null}

        {index < photos.length - 1 ? (
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => goTo(index + 1)}
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition hover:border-accent hover:text-accent sm:right-6"
          >
            <span className="font-arrows text-[1.75rem] leading-none">arrow_forward</span>
          </button>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted">
          {index + 1} of {photos.length}
          <span className="mx-2 text-border">·</span>
          {photo.originalName}
        </p>
        <a
          href={photo.downloadUrl}
          className="border border-foreground/20 px-5 py-2.5 text-xs tracking-[0.2em] uppercase transition hover:border-accent hover:text-accent"
        >
          Download
        </a>
      </div>

      {photos.length > 1 ? (
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {photos.map((thumb, thumbIndex) => (
            <button
              key={thumb.id}
              type="button"
              onClick={() => goTo(thumbIndex)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border transition ${
                thumbIndex === index
                  ? "border-accent ring-1 ring-accent/40"
                  : "border-border opacity-60 hover:opacity-100"
              }`}
            >
              <ProtectedImage
                src={thumb.url}
                alt={thumb.originalName}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
