import { prisma } from "@/lib/db";
import {
  ALLOWED_PHOTO_TYPES,
  getBlobPhotoPathname,
  getPhotoExtension,
} from "@/lib/photos/upload";

export type UploadClientPayload = {
  catalogId: string;
  originalName: string;
  filename: string;
};

export function parseUploadClientPayload(
  clientPayload: string | null,
): UploadClientPayload {
  if (!clientPayload) {
    throw new Error("Missing upload metadata.");
  }

  const payload = JSON.parse(clientPayload) as Partial<UploadClientPayload>;
  if (!payload.catalogId || !payload.originalName || !payload.filename) {
    throw new Error("Invalid upload metadata.");
  }

  return {
    catalogId: payload.catalogId,
    originalName: payload.originalName,
    filename: payload.filename,
  };
}

export async function validateUploadRequest(
  pathname: string,
  clientPayload: string | null,
) {
  const payload = parseUploadClientPayload(clientPayload);
  const expectedPathname = getBlobPhotoPathname(
    payload.catalogId,
    payload.filename,
  );

  if (pathname !== expectedPathname) {
    throw new Error("Invalid upload path.");
  }

  const catalog = await prisma.catalog.findUnique({
    where: { id: payload.catalogId },
    select: { id: true },
  });
  if (!catalog) {
    throw new Error("Catalog not found.");
  }

  const ext = getPhotoExtension(payload.originalName);
  if (!["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(ext)) {
    throw new Error("Unsupported file type.");
  }

  return {
    payload,
    allowedContentTypes: Array.from(ALLOWED_PHOTO_TYPES),
    maximumSizeInBytes: 50 * 1024 * 1024,
    validUntil: Date.now() + 60 * 60 * 1000,
  };
}
