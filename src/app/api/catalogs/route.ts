import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getCatalogExpiryDate, slugify } from "@/lib/catalog";
import { hasAdminSession } from "@/lib/session";

export async function GET() {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const catalogs = await prisma.catalog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { photos: true } },
      },
    });

    return NextResponse.json(
      catalogs.map((catalog) => ({
        id: catalog.id,
        slug: catalog.slug,
        title: catalog.title,
        clientName: catalog.clientName,
        expiresAt: catalog.expiresAt.toISOString(),
        createdAt: catalog.createdAt.toISOString(),
        photoCount: catalog._count.photos,
        isExpired: catalog.expiresAt.getTime() <= Date.now(),
      })),
    );
  } catch (error) {
    console.error("Failed to load catalogs:", error);
    return NextResponse.json(
      { error: "Database unavailable. Check DATABASE_URL or DB_DATABASE_URL." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    title?: string;
    clientName?: string;
    password?: string;
    slug?: string;
  };

  const title = body.title?.trim();
  const password = body.password?.trim();
  const clientName = body.clientName?.trim() || null;

  if (!title || !password) {
    return NextResponse.json(
      { error: "Title and password are required." },
      { status: 400 },
    );
  }

  const baseSlug = slugify(body.slug?.trim() || title);
  let slug = baseSlug;
  let suffix = 1;

  while (await prisma.catalog.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const expiresAt = getCatalogExpiryDate();

  const catalog = await prisma.catalog.create({
    data: {
      title,
      slug,
      clientName,
      passwordHash,
      expiresAt,
    },
  });

  return NextResponse.json({
    id: catalog.id,
    slug: catalog.slug,
    title: catalog.title,
    clientName: catalog.clientName,
    expiresAt: catalog.expiresAt.toISOString(),
  });
}
