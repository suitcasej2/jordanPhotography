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

export type GalleryPhotoUrls = {
  url: string;
  fullUrl: string;
  downloadUrl: string;
};

function apiPhotoUrls(photoId: string): GalleryPhotoUrls {
  return {
    url: `/api/photos/${photoId}`,
    fullUrl: `/api/photos/${photoId}`,
    downloadUrl: `/api/photos/${photoId}/download`,
  };
}

/**
 * Sign grid thumbnail URLs in one pass. Full-size and download URLs are served
 * on demand through the photo API when a client opens or downloads an image.
 */
export async function withGalleryPhotoUrls<T extends PhotoWithUrls>(
  photos: T[],
): Promise<Array<T & GalleryPhotoUrls>> {
  const blobPhotos = photos.filter(canServePhotoFromBlob);

  if (blobPhotos.length === 0) {
    return photos.map((photo) => ({ ...photo, ...apiPhotoUrls(photo.id) }));
  }

  const thumbUrls = await createPresignedPhotoReadUrls(blobPhotos, {
    variant: "preview",
  });

  const thumbById = new Map(
    blobPhotos.map((photo, index) => [photo.id, thumbUrls[index]] as const),
  );

  return photos.map((photo) => {
    const thumbUrl = thumbById.get(photo.id);
    const apiUrls = apiPhotoUrls(photo.id);

    return {
      ...photo,
      url: thumbUrl ?? apiUrls.url,
      fullUrl: apiUrls.fullUrl,
      downloadUrl: apiUrls.downloadUrl,
    };
  });
}
