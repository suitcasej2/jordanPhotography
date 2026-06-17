import { NextResponse } from "next/server";
import JSZip from "jszip";
import { getCatalogBySlug, isCatalogExpired } from "@/lib/catalog";
import { hasCatalogSession } from "@/lib/session";
import { readPhotoFile } from "@/lib/storage";

export const maxDuration = 60;

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
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

  const zip = new JSZip();
  const folder = zip.folder(catalog.title.replace(/[^\w\s-]/g, "").trim() || "photos");

  for (const photo of catalog.photos) {
    try {
      const buffer = await readPhotoFile(photo);
      folder?.file(photo.originalName, buffer);
    } catch {
      // Skip missing files
    }
  }

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "STORE",
  });

  const filename = `${catalog.slug}-photos.zip`;

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(zipBuffer.length),
    },
  });
}
