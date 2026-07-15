import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import imageSize from "image-size";
import { prisma } from "@/lib/db";
import { hasAdminSession } from "@/lib/session";
import { generatePreviewBuffer, getPreviewFilenameForPhoto } from "@/lib/photos/preview";
import { getPhotoExtension, isAllowedPhotoFile } from "@/lib/photos/upload";
import { savePhotoFile, savePreviewFile } from "@/lib/storage";

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const catalogId = String(formData.get("catalogId") ?? "");
  const files = formData.getAll("files");

  if (!catalogId || files.length === 0) {
    return NextResponse.json(
      { error: "Catalog and files are required." },
      { status: 400 },
    );
  }

  const catalog = await prisma.catalog.findUnique({ where: { id: catalogId } });
  if (!catalog) {
    return NextResponse.json({ error: "Catalog not found." }, { status: 404 });
  }

  const maxSort = await prisma.photo.aggregate({
    where: { catalogId },
    _max: { sortOrder: true },
  });
  let sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

  const uploaded = [];

  for (const entry of files) {
    if (!(entry instanceof File)) continue;
    if (!isAllowedPhotoFile(entry.name, entry.type)) {
      continue;
    }

    const buffer = Buffer.from(await entry.arrayBuffer());
    const ext = getPhotoExtension(entry.name);
    const filename = `${uuidv4()}.${ext}`;
    let previewFilename: string | null = null;

    const { storageUrl } = await savePhotoFile(catalogId, filename, buffer);

    try {
      const previewBuffer = await generatePreviewBuffer(buffer);
      previewFilename = getPreviewFilenameForPhoto(filename);
      await savePreviewFile(catalogId, previewFilename, previewBuffer);
    } catch {
      previewFilename = null;
    }

    let width: number | undefined;
    let height: number | undefined;
    try {
      const dimensions = imageSize(buffer);
      width = dimensions.width;
      height = dimensions.height;
    } catch {
      // Dimensions optional
    }

    const photo = await prisma.photo.create({
      data: {
        catalogId,
        filename,
        previewFilename,
        originalName: entry.name,
        width,
        height,
        sizeBytes: buffer.length,
        sortOrder,
        storageUrl,
      },
    });

    uploaded.push({
      id: photo.id,
      originalName: photo.originalName,
      url: `/api/photos/${photo.id}`,
    });
    sortOrder += 1;
  }

  return NextResponse.json({ uploaded, count: uploaded.length });
}
