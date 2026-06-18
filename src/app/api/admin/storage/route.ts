import { NextResponse } from "next/server";
import imageSize from "image-size";
import { prisma } from "@/lib/db";
import { hasAdminSession } from "@/lib/session";
import { isBlobStorageEnabled } from "@/lib/storage";

export async function GET() {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({ directUpload: isBlobStorageEnabled() });
}
