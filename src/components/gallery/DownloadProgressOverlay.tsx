"use client";

import { motion } from "framer-motion";
import type { DownloadProgress } from "@/lib/download-gallery-zip";

export function DownloadProgressOverlay({
  progress,
  onCancel,
}: {
  progress: DownloadProgress;
  onCancel: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md rounded-sm border border-border/60 bg-background p-8"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-xs tracking-[0.35em] uppercase text-muted">Download All</p>
        <h2 className="mt-3 font-display text-2xl font-light">
          {progress.phase === "zipping" ? "Almost there" : "Preparing your photos"}
        </h2>
        <p className="mt-3 min-h-10 text-sm text-muted">{progress.message}</p>

        <div className="mt-6">
          <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span>{progress.percent}%</span>
            <span>
              {progress.phase === "downloading"
                ? "Downloading photos"
                : progress.phase === "zipping"
                  ? "Building zip"
                  : "Complete"}
            </span>
          </div>
        </div>

        {progress.phase !== "done" ? (
          <button
            type="button"
            onClick={onCancel}
            className="mt-6 text-xs tracking-[0.15em] uppercase text-muted transition hover:text-foreground"
          >
            Cancel
          </button>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
