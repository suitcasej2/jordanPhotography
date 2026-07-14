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

const DOWNLOAD_CONCURRENCY = 6;

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

type PhotoDownloadState = {
  loaded: number;
  total: number | null;
  done: boolean;
};

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await fn(items[index], index);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

export async function downloadGalleryZip(options: {
  photos: GalleryDownloadPhoto[];
  signal?: AbortSignal;
  onProgress: (progress: DownloadProgress) => void;
}) {
  const { photos, signal, onProgress } = options;
  const zip = new JSZip();
  const downloadWeight = 0.85;
  const states: PhotoDownloadState[] = photos.map((photo) => ({
    loaded: 0,
    total: photo.sizeBytes ?? null,
    done: false,
  }));

  function reportProgress() {
    const totalBytes = states.reduce((sum, state) => sum + (state.total ?? 0), 0);
    const loadedBytes = states.reduce((sum, state) => sum + state.loaded, 0);
    const completed = states.filter((state) => state.done).length;

    let percent: number;
    if (totalBytes > 0) {
      percent = Math.round((loadedBytes / totalBytes) * downloadWeight * 100);
    } else {
      percent = Math.round((completed / photos.length) * downloadWeight * 100);
    }

    const active = states.findIndex((state) => !state.done);
    const activePhoto = active >= 0 ? photos[active] : photos[photos.length - 1];
    const activeState = active >= 0 ? states[active] : states[states.length - 1];
    const sizeHint =
      activeState.total && activeState.loaded > 0
        ? ` · ${formatBytes(activeState.loaded)} / ${formatBytes(activeState.total)}`
        : "";

    onProgress({
      phase: "downloading",
      percent,
      message:
        completed === photos.length
          ? `Downloaded ${photos.length} photos`
          : `Downloading ${completed + 1} of ${photos.length}: ${activePhoto.originalName}${sizeHint}`,
    });
  }

  const buffers = await mapWithConcurrency(
    photos,
    DOWNLOAD_CONCURRENCY,
    async (photo, index) => {
      const response = await fetch(photo.downloadUrl, { signal });

      if (!response.ok) {
        throw new Error(`Could not download ${photo.originalName}.`);
      }

      const buffer = await readResponseWithProgress(
        response,
        (loaded, total) => {
          states[index].loaded = loaded;
          if (total) states[index].total = total;
          reportProgress();
        },
        signal,
      );

      states[index].done = true;
      states[index].loaded = buffer.byteLength;
      reportProgress();

      return { originalName: photo.originalName, buffer };
    },
  );

  for (const { originalName, buffer } of buffers) {
    zip.file(originalName, buffer);
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

export function prefetchImage(url: string) {
  if (!url || url.startsWith("/api/")) return;
  const image = new Image();
  image.src = url;
}
