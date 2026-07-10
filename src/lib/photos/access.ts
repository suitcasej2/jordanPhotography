import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isCatalogExpired } from "@/lib/catalog";
import { getContentType, type PhotoStorageRecord } from "@/lib/photos";
import {
  canServePhotoFromBlob,
  createPresignedPhotoReadUrl,
} from "@/lib/photo-access";
import { readPhotoFile } from "@/lib/storage";
import { hasAdminSession, hasCatalogSession } from "@/lib/session";

type ServedPhoto = PhotoStorageRecord & {
  originalName: string;
};

export async function canAccessPhoto(slug: string) {
  if (await hasAdminSession()) return true;
  return hasCatalogSession(slug);
}

export async function getAuthorizedPhoto(photoId: string) {
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    include: { catalog: true },
  });

  if (!photo) {
    return { error: NextResponse.json({ error: "Photo not found." }, { status: 404 }) };
  }

  if (isCatalogExpired(photo.catalog.expiresAt)) {
    return { error: NextResponse.json({ error: "Gallery expired." }, { status: 410 }) };
  }

  if (!(await canAccessPhoto(photo.catalog.slug))) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }

  return { photo };
}

export async function serveAuthorizedPhoto(
  photo: ServedPhoto,
  options?: { download?: boolean },
) {
  if (canServePhotoFromBlob(photo)) {
    const presignedUrl = await createPresignedPhotoReadUrl(photo, options);
    return NextResponse.redirect(presignedUrl, 307);
  }

  try {
    const buffer = await readPhotoFile(photo);

    if (options?.download) {
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${photo.originalName}"`,
          "Content-Length": String(buffer.length),
        },
      });
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": getContentType(photo.filename),
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Photo unavailable." }, { status: 404 });
  }
}
