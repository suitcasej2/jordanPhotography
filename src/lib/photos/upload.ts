export const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function isAllowedPhotoFile(name: string, type: string) {
  return (
    ALLOWED_PHOTO_TYPES.has(type) ||
    Boolean(name.match(/\.(jpe?g|png|webp|heic|heif)$/i))
  );
}

export function getPhotoExtension(name: string) {
  return name.split(".").pop()?.toLowerCase() || "jpg";
}

export function getBlobPhotoPathname(catalogId: string, filename: string) {
  return `catalogs/${catalogId}/${filename}`;
}

export function getBlobPreviewPathname(catalogId: string, previewFilename: string) {
  return `catalogs/${catalogId}/previews/${previewFilename}`;
}

export function filenameFromBlobPathname(pathname: string) {
  return pathname.split("/").pop() ?? pathname;
}
