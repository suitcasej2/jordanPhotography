import { NextResponse } from "next/server";
import { getCatalogBySlug, isCatalogExpired } from "@/lib/catalog";
import { getContentType } from "@/lib/photos";
import { readPhotoFile } from "@/lib/storage";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const catalog = await getCatalogBySlug(slug);

  if (!catalog || isCatalogExpired(catalog.expiresAt)) {
    return new NextResponse(null, { status: 404 });
  }

  const firstPhoto = catalog.photos[0];
  if (!firstPhoto) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const buffer = await readPhotoFile(firstPhoto);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": getContentType(firstPhoto.filename),
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
