"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { upload, uploadPresigned } from "@vercel/blob/client";
import { MotionButton } from "@/components/motion/FadeIn";
import { readJsonResponse } from "@/lib/fetch-json";
import {
  getBlobPhotoPathname,
  getPhotoExtension,
  isAllowedPhotoFile,
} from "@/lib/photos/upload";

type StorageStatus = {
  directUpload?: boolean;
  blobConfigured?: boolean;
  storeConnected?: boolean;
  hasStoreId?: boolean;
  hasReadWriteToken?: boolean;
  hasOidcAuth?: boolean;
  hasOidcToken?: boolean;
  hasWebhookPublicKey?: boolean;
  onVercel?: boolean;
  missingEnv?: string[];
  uploadMode?: "presigned" | "legacy" | null;
  setupHint?: string | null;
};

function getStorageWarning(status: StorageStatus | null) {
  if (!status || status.directUpload) {
    return null;
  }

  return status.setupHint ?? "Blob storage is not ready for uploads yet.";
}

type UploadedPhoto = {
  id: string;
  originalName: string;
  url: string;
};

const SERVER_UPLOAD_LIMIT_BYTES = 4 * 1024 * 1024;

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

function formatUploadError(error: unknown) {
  if (error instanceof Error) {
    if (/failed to retrieve the client token/i.test(error.message)) {
      return "Upload authorization failed. Sign in again, then retry.";
    }
    return error.message;
  }
  return "Upload failed.";
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
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [uploadMode, setUploadMode] = useState<"presigned" | "legacy" | null>(
    null,
  );

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/admin/storage", {
          credentials: "include",
        });
        if (!response.ok) {
          setDirectUpload(false);
          setStorageStatus(null);
          return;
        }

        const data = await readJsonResponse<StorageStatus>(response);
        setDirectUpload(Boolean(data.directUpload));
        setStorageStatus(data);
        setUploadMode(data.uploadMode ?? null);
      } catch {
        setDirectUpload(false);
        setStorageStatus(null);
      }
    })();
  }, []);

  const storageWarning = getStorageWarning(storageStatus);

  const uploadViaServer = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        if (file.size > SERVER_UPLOAD_LIMIT_BYTES) {
          throw new Error(
            "Photo is too large for local/server upload. Connect Vercel Blob in production for large files.",
          );
        }
      }

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
      const data = await readJsonResponse<{
        count: number;
        uploaded: UploadedPhoto[];
        error?: string;
      }>(response);

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
        const uploadOptions = {
          access: "private" as const,
          handleUploadUrl: "/api/photos/upload",
          multipart: file.size > 8 * 1024 * 1024,
          clientPayload: JSON.stringify({
            catalogId,
            originalName: file.name,
            filename,
          }),
        };

        const blob =
          uploadMode === "presigned"
            ? await uploadPresigned(pathname, file, uploadOptions)
            : await upload(pathname, file, uploadOptions);

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

        const data = await readJsonResponse<{ error?: string }>(response);
        if (!response.ok) {
          throw new Error(data.error ?? `Failed to register ${file.name}.`);
        }

        uploadedCount += 1;
      }

      return uploadedCount;
    },
    [catalogId, uploadMode],
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

      if (!directUpload) {
        const tooLarge = fileArray.some(
          (file) => file.size > SERVER_UPLOAD_LIMIT_BYTES,
        );
        if (tooLarge) {
          setProgress(
            storageWarning ??
              "Blob storage is not connected. Link your Blob store in Vercel, then redeploy.",
          );
          return;
        }
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
        setProgress(formatUploadError(error));
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(null), 6000);
      }
    },
    [directUpload, onUploaded, storageWarning, uploadViaBlob, uploadViaServer],
  );

  return (
    <div className="space-y-4">
      {storageWarning ? (
        <div className="space-y-2 rounded-sm border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-sm text-amber-100/90">
          <p>{storageWarning}</p>
          {storageStatus ? (
            <ul className="space-y-1 text-xs text-amber-200/70">
              <li>Store ID: {storageStatus.hasStoreId ? "detected" : "missing"}</li>
              <li>
                Webhook key (presigned uploads):{" "}
                {storageStatus.hasWebhookPublicKey ? "detected" : "missing"}
              </li>
              <li>
                Read-write token (legacy uploads):{" "}
                {storageStatus.hasReadWriteToken ? "detected" : "missing"}
              </li>
              {storageStatus.missingEnv?.length ? (
                <li>Missing on this deployment: {storageStatus.missingEnv.join(", ")}</li>
              ) : null}
            </ul>
          ) : null}
        </div>
      ) : null}

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
