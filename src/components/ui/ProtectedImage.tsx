"use client";

import Image, { type ImageProps } from "next/image";

type ProtectedImageProps = ImageProps & {
  /** Load the original file without Next.js resizing (lightbox / full view). */
  fullResolution?: boolean;
};

/**
 * Gallery images use presigned Blob URLs from the catalog API. Grid tiles are
 * resized via Next.js image optimization; lightbox uses full resolution.
 */
export function ProtectedImage({ fullResolution = false, ...props }: ProtectedImageProps) {
  return <Image {...props} unoptimized={fullResolution} />;
}
