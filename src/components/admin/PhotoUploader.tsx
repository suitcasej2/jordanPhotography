"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { MotionButton } from "@/components/motion/FadeIn";

type UploadedPhoto = {
  id: string;
  originalName: string;
  url: string;
};

export function PhotoUploader({
  catalogId,
  onUploaded,
}: {
  catalogId: string;
  onUploaded: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      setUploading(true);
      setProgress(`Uploading ${fileArray.length} photo${fileArray.length > 1 ? "s" : ""}…`);

      const formData = new FormData();
      formData.append("catalogId", catalogId);
      for (const file of fileArray) {
        formData.append("files", file);
      }

      try {
        const response = await fetch("/api/photos", {
          method: "POST",
          body: formData,
        });
        const data = (await response.json()) as {
          count: number;
          uploaded: UploadedPhoto[];
          error?: string;
        };

        if (!response.ok) {
          setProgress(data.error ?? "Upload failed.");
          return;
        }

        setProgress(`Uploaded ${data.count} photo${data.count === 1 ? "" : "s"}.`);
        onUploaded();
      } catch {
        setProgress("Upload failed.");
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(null), 3000);
      }
    },
    [catalogId, onUploaded],
  );

  return (
    <div className="space-y-4">
      <motion.label
        className={`flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed px-6 py-10 text-center transition ${
          dragging
            ? "border-accent bg-accent/5"
            : "border-border/80 hover:border-accent/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void uploadFiles(e.dataTransfer.files);
        }}
        whileHover={{ scale: 1.005 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            if (e.target.files) void uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="font-display text-2xl font-light">Drop photos here</p>
        <p className="mt-2 text-sm text-muted">or click to browse · JPEG, PNG, WebP</p>
      </motion.label>

      {progress ? <p className="text-sm text-muted">{progress}</p> : null}

      <MotionButton
        type="button"
        className="text-xs tracking-[0.15em] uppercase text-muted"
        onClick={() => {
          const input = document.querySelector<HTMLInputElement>(
            'input[type="file"][accept="image/*"]',
          );
          input?.click();
        }}
        disabled={uploading}
      >
        Select Files
      </MotionButton>
    </div>
  );
}
