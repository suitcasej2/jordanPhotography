import { NextResponse } from "next/server";
import { attachAdminSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  const password = body.password?.trim();
  const adminPassword = (
    process.env.ADMIN_PASSWORD ?? "change-me-in-production"
  ).trim();

  if (!password || password !== adminPassword) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  attachAdminSessionCookie(response);
  return response;
}
