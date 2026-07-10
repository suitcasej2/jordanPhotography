import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthorizedPhoto, serveAuthorizedPhoto } from "@/lib/photos/access";
import { deletePhotoFile } from "@/lib/storage";
import { hasAdminSession } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await getAuthorizedPhoto(id);
  if ("error" in result) return result.error;

  return serveAuthorizedPhoto(result.photo);
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const photo = await prisma.photo.findUnique({ where: { id } });

  if (!photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  await deletePhotoFile(photo);
  await prisma.photo.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
