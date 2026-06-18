import JSZip from "jszip";

export type GalleryDownloadPhoto = {
  downloadUrl: string;
  originalName: string;
  sizeBytes?: number | null;
};

export type DownloadProgress = {
  phase: "downloading" | "zipping" | "done";
  percent: number;
  message: string;
};

async function readResponseWithProgress(
  response: Response,
  onBytes: (loaded: number, total: number | null) => void,
  signal?: AbortSignal,
) {
  const total = Number(response.headers.get("Content-Length")) || null;
  const reader = response.body?.getReader();

  if (!reader) {
    const buffer = await response.arrayBuffer();
    onBytes(buffer.byteLength, buffer.byteLength);
    return buffer;
  }

  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    if (signal?.aborted) {
      await reader.cancel();
      throw new DOMException("Download cancelled.", "AbortError");
    }

    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    loaded += value.length;
    onBytes(loaded, total);
  }

  const combined = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return combined.buffer;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function downloadGalleryZip(options: {
  photos: GalleryDownloadPhoto[];
  signal?: AbortSignal;
  onProgress: (progress: DownloadProgress) => void;
}) {
  const { photos, signal, onProgress } = options;
  const zip = new JSZip();
  const downloadWeight = 0.85;

  for (let index = 0; index < photos.length; index += 1) {
    const photo = photos[index];
    const label = photo.originalName;

    onProgress({
      phase: "downloading",
      percent: Math.round((index / photos.length) * downloadWeight * 100),
      message: `Downloading ${index + 1} of ${photos.length}: ${label}`,
    });

    const response = await fetch(photo.downloadUrl, {
      credentials: "include",
      signal,
    });

    if (!response.ok) {
      throw new Error(`Could not download ${label}.`);
    }

    const buffer = await readResponseWithProgress(
      response,
      (loaded, total) => {
        const fileProgress =
          total && total > 0 ? loaded / total : photo.sizeBytes ? loaded / photo.sizeBytes : 0;
        const overall =
          ((index + Math.min(fileProgress, 1)) / photos.length) * downloadWeight * 100;
        const totalBytes = total ?? photo.sizeBytes ?? null;
        const sizeHint = totalBytes
          ? ` · ${formatBytes(loaded)} / ${formatBytes(totalBytes)}`
          : loaded > 0
            ? ` · ${formatBytes(loaded)}`
            : "";

        onProgress({
          phase: "downloading",
          percent: Math.round(overall),
          message: `Downloading ${index + 1} of ${photos.length}: ${label}${sizeHint}`,
        });
      },
      signal,
    );

    zip.file(photo.originalName, buffer);
  }

  onProgress({
    phase: "zipping",
    percent: Math.round(downloadWeight * 100),
    message: "Creating zip archive…",
  });

  const zipBlob = await zip.generateAsync(
    { type: "blob", compression: "STORE" },
    (metadata) => {
      onProgress({
        phase: "zipping",
        percent: Math.round(downloadWeight * 100 + metadata.percent * (1 - downloadWeight)),
        message: "Creating zip archive…",
      });
    },
  );

  onProgress({
    phase: "done",
    percent: 100,
    message: "Download ready",
  });

  return zipBlob;
}

export function saveBlobAsFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
