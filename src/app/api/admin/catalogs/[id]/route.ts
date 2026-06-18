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
  const body = (await request.json()) as { password?: string };
  const password = body.password?.trim();

  if (!password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  const existing = await prisma.catalog.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Catalog not found." }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.catalog.update({
    where: { id },
    data: { passwordHash },
  });

  return NextResponse.json({ success: true });
}
