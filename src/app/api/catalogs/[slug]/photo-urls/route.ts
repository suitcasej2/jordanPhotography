import { NextResponse } from "next/server";
import { getCatalogBySlug, isCatalogExpired } from "@/lib/catalog";
import { withPresignedPhotoUrls } from "@/lib/photos/urls";
import { hasCatalogSession } from "@/lib/session";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  if (!(await hasCatalogSession(slug))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const catalog = await getCatalogBySlug(slug);
  if (!catalog) {
    return NextResponse.json({ error: "Catalog not found." }, { status: 404 });
  }

  if (isCatalogExpired(catalog.expiresAt)) {
    return NextResponse.json({ error: "Gallery expired." }, { status: 410 });
  }

  const body = (await request.json()) as { photoIds?: string[] };
  const photoIds = body.photoIds?.filter(Boolean) ?? [];

  if (photoIds.length === 0) {
    return NextResponse.json({ urls: {} });
  }

  const idSet = new Set(photoIds);
  const selected = catalog.photos.filter((photo) => idSet.has(photo.id));
  const signed = await withPresignedPhotoUrls(selected, { previewsOnly: true });

  const urls = Object.fromEntries(
    signed.map((photo) => [
      photo.id,
      {
        url: photo.url,
        fullUrl: photo.fullUrl,
        downloadUrl: photo.downloadUrl,
        hasPreview: photo.hasPreview,
      },
    ]),
  );

  return NextResponse.json({ urls });
}
