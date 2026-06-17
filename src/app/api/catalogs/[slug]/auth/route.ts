import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCatalogBySlug, isCatalogExpired } from "@/lib/catalog";
import { setCatalogSession } from "@/lib/session";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
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

  const body = (await request.json()) as { password?: string };
  const password = body.password?.trim();

  if (!password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  const valid = await bcrypt.compare(password, catalog.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  await setCatalogSession(slug, catalog.expiresAt);

  return NextResponse.json({ success: true });
}
