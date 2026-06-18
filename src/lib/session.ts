import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  ADMIN_AUTH_COOKIE,
  CATALOG_AUTH_COOKIE_PREFIX,
} from "@/lib/constants";

type SessionCookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge?: number;
  expires?: Date;
};

function sessionCookieOptions(expires?: Date): SessionCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(expires ? { expires } : { maxAge: 7 * 24 * 60 * 60 }),
  };
}

function getSecret() {
  return process.env.SESSION_SECRET ?? "dev-secret-change-me";
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function createToken(slug: string, expiresAt: number) {
  const payload = Buffer.from(JSON.stringify({ slug, expiresAt })).toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string, expectedSlug: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const sigBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (
    sigBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { slug: string; expiresAt: number };

    if (data.slug !== expectedSlug) return false;
    if (Date.now() > data.expiresAt) return false;
    return true;
  } catch {
    return false;
  }
}

export function catalogAuthCookieName(slug: string) {
  return `${CATALOG_AUTH_COOKIE_PREFIX}${slug}`;
}

function buildCatalogSessionCookie(slug: string, catalogExpiresAt: Date) {
  const token = createToken(slug, catalogExpiresAt.getTime());
  return {
    name: catalogAuthCookieName(slug),
    value: token,
    options: sessionCookieOptions(catalogExpiresAt),
  };
}

export function attachCatalogSessionCookie(
  response: NextResponse,
  slug: string,
  catalogExpiresAt: Date,
) {
  const { name, value, options } = buildCatalogSessionCookie(slug, catalogExpiresAt);
  response.cookies.set(name, value, options);
}

export async function setCatalogSession(slug: string, catalogExpiresAt: Date) {
  const cookieStore = await cookies();
  const { name, value, options } = buildCatalogSessionCookie(slug, catalogExpiresAt);
  cookieStore.set(name, value, options);
}

export async function hasCatalogSession(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(catalogAuthCookieName(slug))?.value;
  if (!token) return false;
  return verifyToken(token, slug);
}

function buildAdminSessionCookie() {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const token = createToken("admin", expiresAt);
  return {
    name: ADMIN_AUTH_COOKIE,
    value: token,
    options: sessionCookieOptions(),
  };
}

export function attachAdminSessionCookie(response: NextResponse) {
  const { name, value, options } = buildAdminSessionCookie();
  response.cookies.set(name, value, options);
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  const { name, value, options } = buildAdminSessionCookie();
  cookieStore.set(name, value, options);
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  if (!token) return false;
  return verifyToken(token, "admin");
}
