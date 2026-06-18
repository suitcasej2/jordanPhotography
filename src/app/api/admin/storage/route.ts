import { NextResponse } from "next/server";
import { getBlobStorageStatus } from "@/lib/blob-config";
import { hasAdminSession } from "@/lib/session";

export async function GET(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json(getBlobStorageStatus(request));
}
