"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { upload } from "@vercel/blob/client";
import { MotionButton } from "@/components/motion/FadeIn";
import {
  getBlobPhotoPathname,
  getPhotoExtension,
  isAllowedPhotoFile,
} from "@/lib/photos/upload";

type UploadedPhoto = {
  id: string;
  originalName: string;
  url: string;
};

async function readImageDimensions(file: File) {
  if (!file.type.startsWith("image/")) {
    return { width: undefined, height: undefined };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  } catch {
    return { width: undefined, height: undefined };
  }
}

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
  const [directUpload, setDirectUpload] = useState<boolean | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/admin/storage", {
          credentials: "include",
        });
        if (!response.ok) {
          setDirectUpload(false);
          return;
        }

        const data = (await response.json()) as { directUpload?: boolean };
        setDirectUpload(Boolean(data.directUpload));
      } catch {
        setDirectUpload(false);
      }
    })();
  }, []);

  const uploadViaServer = useCallback(
    async (files: File[]) => {
      const formData = new FormData();
      formData.append("catalogId", catalogId);
      for (const file of files) {
        formData.append("files", file);
      }

      const response = await fetch("/api/photos", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = (await response.json()) as {
        count: number;
        uploaded: UploadedPhoto[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Upload failed.");
      }

      return data.count;
    },
    [catalogId],
  );

  const uploadViaBlob = useCallback(
    async (files: File[]) => {
      let uploadedCount = 0;

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        setProgress(
          `Uploading ${index + 1} of ${files.length}: ${file.name}`,
        );

        const filename = `${crypto.randomUUID()}.${getPhotoExtension(file.name)}`;
        const pathname = getBlobPhotoPathname(catalogId, filename);

        const blob = await upload(pathname, file, {
          access: "private",
          handleUploadUrl: "/api/photos/upload",
          clientPayload: JSON.stringify({
            catalogId,
            originalName: file.name,
            filename,
          }),
        });

        const dimensions = await readImageDimensions(file);

        const response = await fetch("/api/photos/register", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            catalogId,
            storageUrl: blob.url,
            pathname: blob.pathname,
            originalName: file.name,
            sizeBytes: file.size,
            width: dimensions.width,
            height: dimensions.height,
          }),
        });

        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(data.error ?? `Failed to register ${file.name}.`);
        }

        uploadedCount += 1;
      }

      return uploadedCount;
    },
    [catalogId],
  );

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((file) =>
        isAllowedPhotoFile(file.name, file.type),
      );
      if (fileArray.length === 0) return;

      if (directUpload === null) {
        setProgress("Preparing upload…");
        return;
      }

      setUploading(true);
      setProgress(`Uploading ${fileArray.length} photo${fileArray.length > 1 ? "s" : ""}…`);

      try {
        const count = directUpload
          ? await uploadViaBlob(fileArray)
          : await uploadViaServer(fileArray);

        setProgress(`Uploaded ${count} photo${count === 1 ? "" : "s"}.`);
        onUploaded();
      } catch (error) {
        setProgress(
          error instanceof Error ? error.message : "Upload failed.",
        );
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(null), 4000);
      }
    },
    [directUpload, onUploaded, uploadViaBlob, uploadViaServer],
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
          disabled={uploading || directUpload === null}
          onChange={(e) => {
            if (e.target.files) void uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="font-display text-2xl font-light">Drop photos here</p>
        <p className="mt-2 text-sm text-muted">
          or click to browse · JPEG, PNG, WebP
          {directUpload ? " · large files supported" : null}
        </p>
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
        disabled={uploading || directUpload === null}
      >
        Select Files
      </MotionButton>
    </div>
  );
}
