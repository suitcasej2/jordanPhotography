import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/session";
import { isBlobStorageEnabled } from "@/lib/storage";

export async function GET() {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const blobConfigured = isBlobStorageEnabled();

  return NextResponse.json({
    directUpload: blobConfigured,
    blobConfigured,
  });
}
