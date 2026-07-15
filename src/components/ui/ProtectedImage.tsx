"use client";

import Image, { type ImageProps } from "next/image";

type ProtectedImageProps = ImageProps & {
  /** Load the original file without resizing (lightbox / full view). */
  fullResolution?: boolean;
};

/**
 * Grid tiles use pre-generated WebP previews (~1400px). Lightbox uses full-res
 * originals. Both load directly from Blob — no server proxy or optimizer hop.
 */
export function ProtectedImage({ fullResolution = false, ...props }: ProtectedImageProps) {
  return <Image {...props} unoptimized />;
}
