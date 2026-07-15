import { getDownloadUrl, issueSignedToken, presignUrl, type IssuedSignedToken } from "@vercel/blob";
import { isBlobStorageEnabled } from "@/lib/blob-config";
import type { PhotoStorageRecord } from "@/lib/photos";
import { getBlobPreviewPathname } from "@/lib/photos/upload";

const DELEGATION_TTL_MS = 60 * 60 * 1000;
const READ_URL_TTL_MS = 2 * 60 * 60 * 1000;
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

let cachedReadToken: IssuedSignedToken | null = null;

export function getPhotoBlobPathname(catalogId: string, filename: string) {
  return `catalogs/${catalogId}/${filename}`;
}

export function canServePhotoFromBlob(photo: PhotoStorageRecord) {
  return isBlobStorageEnabled() && Boolean(photo.storageUrl);
}

function getReadPathname(photo: PhotoStorageRecord, variant: "preview" | "full") {
  if (variant === "preview" && photo.previewFilename) {
    return getBlobPreviewPathname(photo.catalogId, photo.previewFilename);
  }

  return getPhotoBlobPathname(photo.catalogId, photo.filename);
}

async function getReadDelegationToken() {
  const now = Date.now();
  if (
    cachedReadToken &&
    cachedReadToken.validUntil - now > TOKEN_REFRESH_BUFFER_MS
  ) {
    return cachedReadToken;
  }

  cachedReadToken = await issueSignedToken({
    pathname: "*",
    operations: ["get"],
    validUntil: now + DELEGATION_TTL_MS,
  });

  return cachedReadToken;
}

export async function createPresignedPhotoReadUrl(
  photo: PhotoStorageRecord,
  options?: { download?: boolean; variant?: "preview" | "full" },
) {
  const pathname = getReadPathname(photo, options?.variant ?? "full");
  const token = await getReadDelegationToken();
  const validUntil = Date.now() + READ_URL_TTL_MS;

  const { presignedUrl } = await presignUrl(token, {
    operation: "get",
    pathname,
    access: "private",
    validUntil,
  });

  return options?.download ? getDownloadUrl(presignedUrl) : presignedUrl;
}

export async function createPresignedPhotoReadUrls(
  photos: PhotoStorageRecord[],
  options?: { download?: boolean; variant?: "preview" | "full" },
) {
  if (photos.length === 0) return [];

  const token = await getReadDelegationToken();
  const validUntil = Date.now() + READ_URL_TTL_MS;
  const variant = options?.variant ?? "full";

  return Promise.all(
    photos.map(async (photo) => {
      const pathname = getReadPathname(photo, variant);
      const { presignedUrl } = await presignUrl(token, {
        operation: "get",
        pathname,
        access: "private",
        validUntil,
      });

      return options?.download ? getDownloadUrl(presignedUrl) : presignedUrl;
    }),
  );
}
