import { NextResponse } from "next/server";
import { setAdminSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  const password = body.password?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me-in-production";

  if (!password || password !== adminPassword) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ success: true });
}
