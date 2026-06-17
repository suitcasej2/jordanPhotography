import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hasAdminSession } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as { order?: string[] };
  const order = body.order;

  if (!order?.length) {
    return NextResponse.json({ error: "Photo order is required." }, { status: 400 });
  }

  const catalog = await prisma.catalog.findUnique({
    where: { id },
    include: { photos: { select: { id: true } } },
  });

  if (!catalog) {
    return NextResponse.json({ error: "Catalog not found." }, { status: 404 });
  }

  const catalogPhotoIds = new Set(catalog.photos.map((photo) => photo.id));
  if (
    order.length !== catalog.photos.length ||
    order.some((photoId) => !catalogPhotoIds.has(photoId))
  ) {
    return NextResponse.json({ error: "Invalid photo order." }, { status: 400 });
  }

  await prisma.$transaction(
    order.map((photoId, index) =>
      prisma.photo.update({
        where: { id: photoId },
        data: { sortOrder: index },
      }),
    ),
  );

  return NextResponse.json({ success: true });
}
