import { getDownloadUrl, issueSignedToken, presignUrl, type IssuedSignedToken } from "@vercel/blob";
import { isBlobStorageEnabled } from "@/lib/blob-config";
import type { PhotoStorageRecord } from "@/lib/photos";

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
  options?: { download?: boolean },
) {
  const pathname = getPhotoBlobPathname(photo.catalogId, photo.filename);
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
  options?: { download?: boolean },
) {
  if (photos.length === 0) return [];

  const token = await getReadDelegationToken();
  const validUntil = Date.now() + READ_URL_TTL_MS;

  return Promise.all(
    photos.map(async (photo) => {
      const pathname = getPhotoBlobPathname(photo.catalogId, photo.filename);
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

