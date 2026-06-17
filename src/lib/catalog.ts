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
