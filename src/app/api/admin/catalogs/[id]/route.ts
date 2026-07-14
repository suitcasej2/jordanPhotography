import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/catalog";
import { withPresignedPhotoUrls } from "@/lib/photos/urls";
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

  const photos = await withPresignedPhotoUrls(catalog.photos);

  return NextResponse.json({
    id: catalog.id,
    slug: catalog.slug,
    title: catalog.title,
    clientName: catalog.clientName,
    expiresAt: catalog.expiresAt.toISOString(),
    coverPhotoId: catalog.coverPhotoId,
    photos: photos.map((photo) => ({
      id: photo.id,
      originalName: photo.originalName,
      url: photo.url,
    })),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    title?: string;
    clientName?: string;
    slug?: string;
    password?: string;
    coverPhotoId?: string | null;
  };

  const hasTitleUpdate = body.title !== undefined;
  const hasClientNameUpdate = body.clientName !== undefined;
  const hasSlugUpdate = body.slug !== undefined;
  const hasPasswordUpdate = body.password !== undefined;
  const hasCoverPhotoUpdate = body.coverPhotoId !== undefined;

  if (
    !hasTitleUpdate &&
    !hasClientNameUpdate &&
    !hasSlugUpdate &&
    !hasPasswordUpdate &&
    !hasCoverPhotoUpdate
  ) {
    return NextResponse.json({ error: "No updates provided." }, { status: 400 });
  }

  const existing = await prisma.catalog.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Catalog not found." }, { status: 404 });
  }

  const data: {
    title?: string;
    clientName?: string | null;
    slug?: string;
    passwordHash?: string;
    coverPhotoId?: string | null;
  } = {};

  if (hasTitleUpdate) {
    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    data.title = title;
  }

  if (hasClientNameUpdate) {
    data.clientName = body.clientName?.trim() || null;
  }

  if (hasSlugUpdate) {
    const slug = slugify(body.slug?.trim() || "");
    if (!slug) {
      return NextResponse.json({ error: "URL slug is required." }, { status: 400 });
    }

    const conflict = await prisma.catalog.findUnique({ where: { slug } });
    if (conflict && conflict.id !== id) {
      return NextResponse.json({ error: "That URL slug is already in use." }, { status: 400 });
    }

    data.slug = slug;
  }

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
    select: {
      title: true,
      clientName: true,
      slug: true,
      coverPhotoId: true,
    },
  });

  return NextResponse.json({ success: true, ...updated });
}
