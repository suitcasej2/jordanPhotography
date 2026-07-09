import { NextResponse } from "next/server";
import { getCatalogBySlug, getPreviewPhoto, isCatalogExpired } from "@/lib/catalog";
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

  const previewPhoto = getPreviewPhoto(catalog);
  if (!previewPhoto) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const buffer = await readPhotoFile(previewPhoto);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": getContentType(previewPhoto.filename),
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
