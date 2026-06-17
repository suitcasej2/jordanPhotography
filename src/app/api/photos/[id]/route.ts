import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { isCatalogExpired } from "@/lib/catalog";
import { hasAdminSession, hasCatalogSession } from "@/lib/session";
import { getPhotoPath, deleteUploadedFile } from "@/lib/uploads";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getContentType(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".heic":
    case ".heif":
      return "image/heic";
    default:
      return "image/jpeg";
  }
}

async function canAccessPhoto(slug: string) {
  if (await hasAdminSession()) return true;
  return hasCatalogSession(slug);
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { catalog: true },
  });

  if (!photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  if (isCatalogExpired(photo.catalog.expiresAt)) {
    return NextResponse.json({ error: "Gallery expired." }, { status: 410 });
  }

  if (!(await canAccessPhoto(photo.catalog.slug))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const filePath = getPhotoPath(photo.catalogId, photo.filename);
    const buffer = await readFile(filePath);

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

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const photo = await prisma.photo.findUnique({ where: { id } });

  if (!photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  await deleteUploadedFile(photo.catalogId, photo.filename);
  await prisma.photo.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
