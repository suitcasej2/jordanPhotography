import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  filenameFromBlobPathname,
  getBlobPhotoPathname,
  isAllowedPhotoFile,
} from "@/lib/photos/upload";
import { hasAdminSession } from "@/lib/session";
import { isBlobStorageEnabled } from "@/lib/storage";

export async function POST(request: Request) {
  if (!isBlobStorageEnabled()) {
    return NextResponse.json(
      { error: "Direct uploads are not enabled." },
      { status: 404 },
    );
  }

  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    catalogId?: string;
    storageUrl?: string;
    pathname?: string;
    originalName?: string;
    sizeBytes?: number;
    width?: number;
    height?: number;
  };

  const catalogId = body.catalogId?.trim();
  const storageUrl = body.storageUrl?.trim();
  const pathname = body.pathname?.trim();
  const originalName = body.originalName?.trim();

  if (!catalogId || !storageUrl || !pathname || !originalName) {
    return NextResponse.json(
      { error: "Catalog, storage URL, pathname, and filename are required." },
      { status: 400 },
    );
  }

  if (!isAllowedPhotoFile(originalName, "")) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  const filename = filenameFromBlobPathname(pathname);
  const expectedPathname = getBlobPhotoPathname(catalogId, filename);
  if (pathname !== expectedPathname) {
    return NextResponse.json({ error: "Invalid storage path." }, { status: 400 });
  }

  const catalog = await prisma.catalog.findUnique({ where: { id: catalogId } });
  if (!catalog) {
    return NextResponse.json({ error: "Catalog not found." }, { status: 404 });
  }

  const maxSort = await prisma.photo.aggregate({
    where: { catalogId },
    _max: { sortOrder: true },
  });
  const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

  const photo = await prisma.photo.create({
    data: {
      catalogId,
      filename,
      originalName,
      width: body.width,
      height: body.height,
      sizeBytes: body.sizeBytes ?? 0,
      sortOrder,
      storageUrl,
    },
  });

  return NextResponse.json({
    id: photo.id,
    originalName: photo.originalName,
    url: `/api/photos/${photo.id}`,
  });
}
