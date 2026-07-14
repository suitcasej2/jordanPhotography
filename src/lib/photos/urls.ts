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
      downloadUrl: `/api/photos/${photo.id}/download`,
    }));
  }

  const viewUrls = await createPresignedPhotoReadUrls(blobPhotos);

  const viewById = new Map(
    blobPhotos.map((photo, index) => [photo.id, viewUrls[index]] as const),
  );

  return photos.map((photo) => {
    const viewUrl = viewById.get(photo.id);
    return {
      ...photo,
      url: viewUrl ?? `/api/photos/${photo.id}`,
      downloadUrl: viewUrl ? getDownloadUrl(viewUrl) : `/api/photos/${photo.id}/download`,
    };
  });
}
