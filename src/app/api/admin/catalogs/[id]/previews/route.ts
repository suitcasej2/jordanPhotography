import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatePreviewBuffer, getPreviewFilenameForPhoto } from "@/lib/photos/preview";
import { hasAdminSession } from "@/lib/session";
import { readPhotoFile, savePreviewFile } from "@/lib/storage";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const BATCH_SIZE = 16;
const BACKFILL_CONCURRENCY = 4;

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
) {
  const results: R[] = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await fn(items[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

export async function POST(_request: Request, context: RouteContext) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  const missing = await prisma.photo.findMany({
    where: { catalogId: id, previewFilename: null },
    orderBy: { sortOrder: "asc" },
    take: BATCH_SIZE,
  });

  if (missing.length === 0) {
    const remaining = await prisma.photo.count({
      where: { catalogId: id, previewFilename: null },
    });
    return NextResponse.json({ processed: 0, remaining, done: remaining === 0 });
  }

  let processed = 0;

  await mapWithConcurrency(missing, BACKFILL_CONCURRENCY, async (photo) => {
    try {
      const buffer = await readPhotoFile(photo);
      const previewBuffer = await generatePreviewBuffer(buffer);
      const previewFilename = getPreviewFilenameForPhoto(photo.filename);
      await savePreviewFile(photo.catalogId, previewFilename, previewBuffer);
      await prisma.photo.update({
        where: { id: photo.id },
        data: { previewFilename },
      });
      processed += 1;
    } catch {
      // Skip photos that cannot be converted
    }
  });

  const remaining = await prisma.photo.count({
    where: { catalogId: id, previewFilename: null },
  });

  return NextResponse.json({
    processed,
    remaining,
    done: remaining === 0,
  });
}
