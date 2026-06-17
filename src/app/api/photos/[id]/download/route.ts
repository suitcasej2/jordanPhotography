import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { prisma } from "@/lib/db";
import { isCatalogExpired } from "@/lib/catalog";
import { hasCatalogSession } from "@/lib/session";
import { getPhotoPath } from "@/lib/uploads";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

  if (!(await hasCatalogSession(photo.catalog.slug))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const filePath = getPhotoPath(photo.catalogId, photo.filename);
    const buffer = await readFile(filePath);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${photo.originalName}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch {
    return NextResponse.json({ error: "Photo unavailable." }, { status: 404 });
  }
}
