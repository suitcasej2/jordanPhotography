import path from "path";

export function getContentType(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".heic":
    case ".heif":
      return "image/heic";
    default:
      return "image/jpeg";
  }
}

export type PhotoStorageRecord = {
  catalogId: string;
  filename: string;
  previewFilename?: string | null;
  storageUrl: string | null;
};
