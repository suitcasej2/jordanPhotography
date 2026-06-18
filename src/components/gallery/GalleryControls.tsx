"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DownloadProgressOverlay } from "@/components/gallery/DownloadProgressOverlay";
import { ThemeToggle } from "@/components/gallery/ThemeToggle";
import { ViewModeToggle } from "@/components/gallery/ViewModeToggle";
import { MotionButton } from "@/components/motion/FadeIn";
import {
  downloadGalleryZip,
  saveBlobAsFile,
  type DownloadProgress,
  type GalleryDownloadPhoto,
} from "@/lib/download-gallery-zip";

export function GalleryControls({
  title,
  photos,
}: {
  title: string;
  photos: GalleryDownloadPhoto[];
}) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function handleDownloadAll() {
    if (photos.length === 0) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setDownloading(true);
    setProgress({
      phase: "downloading",
      percent: 0,
      message: `Downloading 1 of ${photos.length}…`,
    });

    try {
      const zipBlob = await downloadGalleryZip({
        photos,
        signal: controller.signal,
        onProgress: setProgress,
      });

      const folderName = title.replace(/[^\w\s-]/g, "").trim() || "photos";
      saveBlobAsFile(zipBlob, `${folderName}.zip`);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    } finally {
      abortRef.current = null;
      setDownloading(false);
      setProgress(null);
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
    setDownloading(false);
    setProgress(null);
  }

  return (
    <>
      <AnimatePresence>
        {downloading && progress ? (
          <DownloadProgressOverlay progress={progress} onCancel={handleCancel} />
        ) : null}
      </AnimatePresence>

      <motion.div
        className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <p className="min-w-0 text-sm text-muted">
                {photos.length} {photos.length === 1 ? "photo" : "photos"} ready to download
              </p>
              <ThemeToggle className="shrink-0" />
            </div>

            <div className="flex flex-col items-center gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="hidden md:block" aria-hidden />
              <ViewModeToggle />
              <MotionButton
                type="button"
                onClick={() => void handleDownloadAll()}
                disabled={downloading || photos.length === 0}
                className="w-full border border-foreground/20 px-5 py-2.5 text-xs tracking-[0.2em] uppercase transition hover:border-accent hover:text-accent disabled:opacity-40 md:w-auto md:justify-self-end"
              >
                {downloading ? "Downloading…" : "Download All"}
              </MotionButton>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
