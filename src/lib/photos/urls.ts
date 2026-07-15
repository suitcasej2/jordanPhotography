import { getDownloadUrl } from "@vercel/blob";
import {
  canServePhotoFromBlob,
  createPresignedPhotoReadUrls,
} from "@/lib/photo-access";
import type { PhotoStorageRecord } from "@/lib/photos";

type PhotoWithUrls = PhotoStorageRecord & {
  id: string;
  originalName: string;
  width?: number | null;
  height?: number | null;
  sizeBytes?: number | null;
};

type PresignOptions = {
  /** Only sign grid preview URLs — full URLs load on demand via /api/photos/[id]. */
  previewsOnly?: boolean;
};

export async function withPresignedPhotoUrls<T extends PhotoWithUrls>(
  photos: T[],
  options?: PresignOptions,
) {
  const blobPhotos = photos.filter(canServePhotoFromBlob);

  if (blobPhotos.length === 0) {
    return photos.map((photo) => ({
      ...photo,
      url: `/api/photos/${photo.id}`,
      fullUrl: `/api/photos/${photo.id}`,
      downloadUrl: `/api/photos/${photo.id}/download`,
      hasPreview: false,
    }));
  }

  const previewUrls = await createPresignedPhotoReadUrls(blobPhotos, {
    variant: "preview",
  });

  const previewById = new Map(
    blobPhotos.map((photo, index) => [photo.id, previewUrls[index]] as const),
  );

  let fullById: Map<string, string> | null = null;
  if (!options?.previewsOnly) {
    const fullUrls = await createPresignedPhotoReadUrls(blobPhotos, {
      variant: "full",
    });
    fullById = new Map(
      blobPhotos.map((photo, index) => [photo.id, fullUrls[index]] as const),
    );
  }

  return photos.map((photo) => {
    const previewUrl = previewById.get(photo.id);
    const fullUrl = fullById?.get(photo.id) ?? `/api/photos/${photo.id}`;
    const hasPreview = Boolean(photo.previewFilename);

    return {
      ...photo,
      url: previewUrl ?? `/api/photos/${photo.id}`,
      fullUrl,
      downloadUrl: fullById?.get(photo.id)
        ? getDownloadUrl(fullById.get(photo.id)!)
        : `/api/photos/${photo.id}/download`,
      hasPreview,
    };
  });
}
