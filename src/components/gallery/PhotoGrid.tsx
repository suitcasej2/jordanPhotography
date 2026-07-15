"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LazyGalleryImage, useBlobPreconnect } from "@/components/gallery/LazyGalleryImage";
import { prefetchImage } from "@/lib/download-gallery-zip";

export type GalleryPhoto = {
  id: string;
  originalName: string;
  width?: number | null;
  height?: number | null;
  sizeBytes?: number | null;
  url: string;
  fullUrl: string;
  downloadUrl: string;
  hasPreview?: boolean;
};

function PhotoTile({
  photo,
  index,
  onOpen,
}: {
  photo: GalleryPhoto;
  index: number;
  onOpen: (index: number) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const aspect =
    photo.width && photo.height ? photo.width / photo.height : 3 / 4;

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className="group relative mb-4 w-full break-inside-avoid overflow-hidden rounded-sm bg-surface text-left"
      style={{ aspectRatio: aspect }}
    >
      {!loaded && !failed ? (
        <div className="skeleton-shimmer absolute inset-0" />
      ) : null}
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted">
          Unable to load
        </div>
      ) : (
        <LazyGalleryImage
          src={photo.url}
          alt={photo.originalName}
          priority={index < 4}
          className={`h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.02] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
    </button>
  );
}

function Lightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: GalleryPhoto[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const photo = photos[index];
  const [loaded, setLoaded] = useState(false);

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onNavigate(Math.min(index + 1, photos.length - 1));
      if (event.key === "ArrowLeft") onNavigate(Math.max(index - 1, 0));
    },
    [index, onClose, onNavigate, photos.length],
  );

  useEffect(() => {
    setLoaded(false);
  }, [photo.id]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    if (index > 0) prefetchImage(photos[index - 1].fullUrl);
    if (index < photos.length - 1) prefetchImage(photos[index + 1].fullUrl);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [handleKey, index, photos]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute top-6 right-6 z-10 text-sm tracking-[0.2em] uppercase text-white/70 transition hover:text-white"
        onClick={onClose}
      >
        Close
      </button>

      {index > 0 ? (
        <button
          type="button"
          className="absolute left-4 z-10 hidden h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-white/50 hover:text-white sm:flex"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index - 1);
          }}
        >
          ←
        </button>
      ) : null}

      <motion.div
        key={photo.id}
        className="relative h-full max-h-[85vh] w-full max-w-6xl"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {!loaded ? <div className="skeleton-shimmer absolute inset-0" /> : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.fullUrl}
          alt={photo.originalName}
          className={`h-full w-full object-contain ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
        />
      </motion.div>

      {index < photos.length - 1 ? (
        <button
          type="button"
          className="absolute right-4 z-10 hidden h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-white/50 hover:text-white sm:flex"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index + 1);
          }}
        >
          →
        </button>
      ) : null}

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-4 text-sm text-white/70">
        <span>
          {index + 1} / {photos.length}
        </span>
        <a
          href={photo.downloadUrl}
          className="tracking-[0.15em] uppercase transition hover:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          Download
        </a>
      </div>
    </motion.div>
  );
}

export function PhotoGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  useBlobPreconnect(photos.map((photo) => photo.url));

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((photo, index) => (
          <PhotoTile
            key={photo.id}
            photo={photo}
            index={index}
            onOpen={setLightboxIndex}
          />
        ))}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null ? (
          <Lightbox
            photos={photos}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
