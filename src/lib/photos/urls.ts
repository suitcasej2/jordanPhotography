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

export async function withPresignedPhotoUrls<T extends PhotoWithUrls>(photos: T[]) {
  const blobPhotos = photos.filter(canServePhotoFromBlob);

  if (blobPhotos.length === 0) {
    return photos.map((photo) => ({
      ...photo,
      url: `/api/photos/${photo.id}`,
      fullUrl: `/api/photos/${photo.id}`,
      downloadUrl: `/api/photos/${photo.id}/download`,
    }));
  }

  const [previewUrls, fullUrls] = await Promise.all([
    createPresignedPhotoReadUrls(blobPhotos, { variant: "preview" }),
    createPresignedPhotoReadUrls(blobPhotos, { variant: "full" }),
  ]);

  const previewById = new Map(
    blobPhotos.map((photo, index) => [photo.id, previewUrls[index]] as const),
  );
  const fullById = new Map(
    blobPhotos.map((photo, index) => [photo.id, fullUrls[index]] as const),
  );

  return photos.map((photo) => {
    const fullUrl = fullById.get(photo.id);
    return {
      ...photo,
      url: previewById.get(photo.id) ?? `/api/photos/${photo.id}`,
      fullUrl: fullUrl ?? `/api/photos/${photo.id}`,
      downloadUrl: fullUrl
        ? getDownloadUrl(fullUrl)
        : `/api/photos/${photo.id}/download`,
    };
  });
}
