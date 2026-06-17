"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/gallery/ThemeToggle";
import { ViewModeToggle } from "@/components/gallery/ViewModeToggle";
import { MotionButton } from "@/components/motion/FadeIn";

export function GalleryControls({
  slug,
  photoCount,
}: {
  slug: string;
  photoCount: number;
}) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadAll() {
    setDownloading(true);
    try {
      const response = await fetch(`/api/catalogs/${slug}/download`, {
        credentials: "include",
      });
      if (!response.ok) return;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${slug}-photos.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <motion.div
      className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative mx-auto max-w-7xl px-6 py-4">
        <ThemeToggle className="absolute top-4 right-6" />

        <div className="flex flex-col gap-4 pr-24 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            {photoCount} {photoCount === 1 ? "photo" : "photos"} ready to download
          </p>

          <ViewModeToggle className="self-center sm:absolute sm:left-1/2 sm:-translate-x-1/2" />

          <MotionButton
            type="button"
            onClick={handleDownloadAll}
            disabled={downloading || photoCount === 0}
            className="border border-foreground/20 px-5 py-2.5 text-xs tracking-[0.2em] uppercase transition hover:border-accent hover:text-accent disabled:opacity-40 sm:mr-24"
          >
            {downloading ? "Preparing…" : "Download All"}
          </MotionButton>
        </div>
      </div>
    </motion.div>
  );
}
