import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hasAdminSession } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const catalog = await prisma.catalog.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!catalog) {
    return NextResponse.json({ error: "Catalog not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: catalog.id,
    slug: catalog.slug,
    title: catalog.title,
    clientName: catalog.clientName,
    expiresAt: catalog.expiresAt.toISOString(),
    coverPhotoId: catalog.coverPhotoId,
    photos: catalog.photos.map((photo) => ({
      id: photo.id,
      originalName: photo.originalName,
      url: `/api/photos/${photo.id}`,
    })),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    password?: string;
    coverPhotoId?: string | null;
  };

  const hasPasswordUpdate = body.password !== undefined;
  const hasCoverPhotoUpdate = body.coverPhotoId !== undefined;

  if (!hasPasswordUpdate && !hasCoverPhotoUpdate) {
    return NextResponse.json({ error: "No updates provided." }, { status: 400 });
  }

  const existing = await prisma.catalog.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Catalog not found." }, { status: 404 });
  }

  const data: { passwordHash?: string; coverPhotoId?: string | null } = {};

  if (hasPasswordUpdate) {
    const password = body.password?.trim();
    if (!password) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  if (hasCoverPhotoUpdate) {
    if (body.coverPhotoId === null) {
      data.coverPhotoId = null;
    } else if (body.coverPhotoId) {
      const photo = await prisma.photo.findFirst({
        where: { id: body.coverPhotoId, catalogId: id },
      });
      if (!photo) {
        return NextResponse.json({ error: "Photo not found in this gallery." }, { status: 400 });
      }
      data.coverPhotoId = photo.id;
    } else {
      return NextResponse.json({ error: "Invalid cover photo." }, { status: 400 });
    }
  }

  const updated = await prisma.catalog.update({
    where: { id },
    data,
    select: { coverPhotoId: true },
  });

  return NextResponse.json({ success: true, coverPhotoId: updated.coverPhotoId });
}
