import { NextResponse } from "next/server";
import { getCatalogBySlug, isCatalogExpired, toPublicCatalog } from "@/lib/catalog";
import { withPresignedPhotoUrls } from "@/lib/photos/urls";
import { hasCatalogSession } from "@/lib/session";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const catalog = await getCatalogBySlug(slug);

  if (!catalog) {
    return NextResponse.json({ error: "Catalog not found." }, { status: 404 });
  }

  if (isCatalogExpired(catalog.expiresAt)) {
    return NextResponse.json(
      { error: "This gallery has expired.", expired: true },
      { status: 410 },
    );
  }

  const authenticated = await hasCatalogSession(slug);

  if (!authenticated) {
    return NextResponse.json({
      slug: catalog.slug,
      title: catalog.title,
      clientName: catalog.clientName,
      expiresAt: catalog.expiresAt.toISOString(),
      daysRemaining: Math.max(
        0,
        Math.ceil(
          (catalog.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
      ),
      photoCount: catalog.photos.length,
      authenticated: false,
    });
  }

  const publicCatalog = toPublicCatalog(catalog);
  const photos = await withPresignedPhotoUrls(catalog.photos, { previewsOnly: true });

  return NextResponse.json({
    ...publicCatalog,
    photos,
    authenticated: true,
  });
}
