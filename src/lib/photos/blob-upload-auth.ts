import { prisma } from "@/lib/db";
import {
  ALLOWED_PHOTO_TYPES,
  getBlobPhotoPathname,
  getBlobPreviewPathname,
  getPhotoExtension,
} from "@/lib/photos/upload";

export type OriginalUploadClientPayload = {
  kind?: "original";
  catalogId: string;
  originalName: string;
  filename: string;
};

export type PreviewUploadClientPayload = {
  kind: "preview";
  catalogId: string;
  previewFilename: string;
};

export type UploadClientPayload = OriginalUploadClientPayload | PreviewUploadClientPayload;

export function parseUploadClientPayload(
  clientPayload: string | null,
): UploadClientPayload {
  if (!clientPayload) {
    throw new Error("Missing upload metadata.");
  }

  const payload = JSON.parse(clientPayload) as Record<string, unknown>;

  if (payload.kind === "preview") {
    if (typeof payload.catalogId !== "string" || typeof payload.previewFilename !== "string") {
      throw new Error("Invalid preview upload metadata.");
    }
    return {
      kind: "preview",
      catalogId: payload.catalogId,
      previewFilename: payload.previewFilename,
    };
  }

  if (
    typeof payload.catalogId !== "string" ||
    typeof payload.originalName !== "string" ||
    typeof payload.filename !== "string"
  ) {
    throw new Error("Invalid upload metadata.");
  }

  return {
    kind: "original",
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

  const catalog = await prisma.catalog.findUnique({
    where: { id: payload.catalogId },
    select: { id: true },
  });
  if (!catalog) {
    throw new Error("Catalog not found.");
  }

  if (payload.kind === "preview") {
    const expectedPathname = getBlobPreviewPathname(
      payload.catalogId,
      payload.previewFilename,
    );

    if (pathname !== expectedPathname) {
      throw new Error("Invalid preview upload path.");
    }

    return {
      payload,
      allowedContentTypes: ["image/webp"],
      maximumSizeInBytes: 3 * 1024 * 1024,
      validUntil: Date.now() + 60 * 60 * 1000,
    };
  }

  const expectedPathname = getBlobPhotoPathname(
    payload.catalogId,
    payload.filename,
  );

  if (pathname !== expectedPathname) {
    throw new Error("Invalid upload path.");
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
