"use client";

import Image, { type ImageProps } from "next/image";

/**
 * Photos are served from authenticated API routes. Next.js image
 * optimization fetches without session cookies, so we load directly.
 */
export function ProtectedImage(props: ImageProps) {
  return <Image {...props} unoptimized />;
}
