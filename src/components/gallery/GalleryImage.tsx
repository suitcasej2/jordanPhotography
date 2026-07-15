"use client";

type GalleryImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
};

/** Direct blob or API image — browser handles lazy loading. */
export function GalleryImage({
  src,
  alt,
  className,
  priority = false,
  onLoad,
  onError,
}: GalleryImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={className}
      onLoad={onLoad}
      onError={onError}
    />
  );
}
