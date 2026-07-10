import { NextResponse } from "next/server";
import { getCatalogBySlug, getPreviewPhoto, isCatalogExpired } from "@/lib/catalog";
import { serveAuthorizedPhoto } from "@/lib/photos/access";

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

  const response = await serveAuthorizedPhoto(previewPhoto);
  if (response.status === 307) {
    return response;
  }

  response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  return response;
}
