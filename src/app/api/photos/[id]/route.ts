import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isCatalogExpired } from "@/lib/catalog";
import { getContentType } from "@/lib/photos";
import { hasAdminSession, hasCatalogSession } from "@/lib/session";
import { deletePhotoFile, readPhotoFile } from "@/lib/storage";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
    const buffer = await readPhotoFile(photo);

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

  await deletePhotoFile(photo);
  await prisma.photo.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
