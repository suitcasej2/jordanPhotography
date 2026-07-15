import type { GalleryPhoto } from "@/components/gallery/PhotoGrid";

export const PHOTO_URL_BATCH_SIZE = 12;

type SignedPhotoUrls = Record<
  string,
  Pick<GalleryPhoto, "url" | "fullUrl" | "downloadUrl" | "hasPreview">
>;

export async function fetchGalleryPhotoUrlBatch(
  slug: string,
  photoIds: string[],
): Promise<SignedPhotoUrls> {
  if (photoIds.length === 0) return {};

  const response = await fetch(`/api/catalogs/${slug}/photo-urls`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ photoIds }),
  });

  if (!response.ok) {
    return {};
  }

  const data = (await response.json()) as { urls?: SignedPhotoUrls };
  return data.urls ?? {};
}

export function mergePhotoUrls(
  photos: GalleryPhoto[],
  urls: SignedPhotoUrls,
): GalleryPhoto[] {
  if (Object.keys(urls).length === 0) return photos;

  return photos.map((photo) => {
    const signed = urls[photo.id];
    return signed ? { ...photo, ...signed } : photo;
  });
}

export async function hydrateGalleryPhotoUrls(
  slug: string,
  photos: GalleryPhoto[],
  onUpdate: (photos: GalleryPhoto[]) => void,
) {
  let current = photos;

  for (let index = 0; index < photos.length; index += PHOTO_URL_BATCH_SIZE) {
    const batch = photos.slice(index, index + PHOTO_URL_BATCH_SIZE);
    const urls = await fetchGalleryPhotoUrlBatch(
      slug,
      batch.map((photo) => photo.id),
    );
    current = mergePhotoUrls(current, urls);
    onUpdate(current);
  }
}
