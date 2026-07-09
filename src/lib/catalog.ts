import { prisma } from "@/lib/db";
import { CATALOG_DURATION_DAYS } from "@/lib/constants";

export function isCatalogExpired(expiresAt: Date) {
  return expiresAt.getTime() <= Date.now();
}

export function getCatalogExpiryDate(from = new Date()) {
  const expiresAt = new Date(from);
  expiresAt.setDate(expiresAt.getDate() + CATALOG_DURATION_DAYS);
  return expiresAt;
}

export function getDaysRemaining(expiresAt: Date) {
  const ms = expiresAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export async function getCatalogBySlug(slug: string) {
  return prisma.catalog.findUnique({
    where: { slug },
    include: {
      photos: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export function getPreviewPhoto(
  catalog: NonNullable<Awaited<ReturnType<typeof getCatalogBySlug>>>,
) {
  if (catalog.coverPhotoId) {
    const cover = catalog.photos.find((photo) => photo.id === catalog.coverPhotoId);
    if (cover) return cover;
  }

  return catalog.photos[0] ?? null;
}

export function getGalleryShareDescription(
  catalog: NonNullable<Awaited<ReturnType<typeof getCatalogBySlug>>>,
) {
  const photoLabel =
    catalog.photos.length === 1 ? "1 photo" : `${catalog.photos.length} photos`;
  const clientLabel = catalog.clientName ? `For ${catalog.clientName}` : null;
  const daysRemaining = getDaysRemaining(catalog.expiresAt);
  const expiryLabel =
    daysRemaining === 1 ? "Available for 1 more day" : `Available for ${daysRemaining} days`;

  return [clientLabel, photoLabel, expiryLabel].filter(Boolean).join(" · ");
}

export function toPublicCatalog(
  catalog: NonNullable<Awaited<ReturnType<typeof getCatalogBySlug>>>,
) {
  return {
    id: catalog.id,
    slug: catalog.slug,
    title: catalog.title,
    clientName: catalog.clientName,
    expiresAt: catalog.expiresAt.toISOString(),
    daysRemaining: getDaysRemaining(catalog.expiresAt),
    photoCount: catalog.photos.length,
    photos: catalog.photos.map((photo) => ({
      id: photo.id,
      originalName: photo.originalName,
      width: photo.width,
      height: photo.height,
      sizeBytes: photo.sizeBytes,
      url: `/api/photos/${photo.id}`,
      downloadUrl: `/api/photos/${photo.id}/download`,
    })),
  };
}
