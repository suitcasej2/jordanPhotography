import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import {
  ADMIN_AUTH_COOKIE,
  CATALOG_AUTH_COOKIE_PREFIX,
} from "@/lib/constants";

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

export async function setCatalogSession(slug: string, catalogExpiresAt: Date) {
  const cookieStore = await cookies();
  const token = createToken(slug, catalogExpiresAt.getTime());

  cookieStore.set(catalogAuthCookieName(slug), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: catalogExpiresAt,
  });
}

export async function hasCatalogSession(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(catalogAuthCookieName(slug))?.value;
  if (!token) return false;
  return verifyToken(token, slug);
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const token = createToken("admin", expiresAt);

  cookieStore.set(ADMIN_AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  if (!token) return false;
  return verifyToken(token, "admin");
}
