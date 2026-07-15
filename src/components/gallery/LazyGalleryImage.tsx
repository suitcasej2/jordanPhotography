"use client";

import { useEffect, useRef, useState } from "react";
import {
  acquireImageLoadSlot,
  releaseImageLoadSlot,
} from "@/lib/image-load-queue";

type LazyGalleryImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
};

function isReadyImageUrl(url: string) {
  return url.startsWith("http");
}

export function LazyGalleryImage({
  src,
  alt,
  className,
  priority = false,
  onLoad,
  onError,
}: LazyGalleryImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [canRequest, setCanRequest] = useState(false);
  const readySrc = isReadyImageUrl(src);

  useEffect(() => {
    if (priority) {
      setShouldLoad(true);
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "280px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    if (!shouldLoad || !readySrc) {
      setCanRequest(false);
      return;
    }

    let cancelled = false;

    void acquireImageLoadSlot().then(() => {
      if (cancelled) {
        releaseImageLoadSlot();
        return;
      }
      setCanRequest(true);
    });

    return () => {
      cancelled = true;
    };
  }, [shouldLoad, readySrc, src]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {canRequest ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className={className}
          onLoad={() => {
            releaseImageLoadSlot();
            onLoad?.();
          }}
          onError={() => {
            releaseImageLoadSlot();
            onError?.();
          }}
        />
      ) : null}
    </div>
  );
}

export function useBlobPreconnect(urls: string[]) {
  useEffect(() => {
    const remoteUrl = urls.find((url) => url.startsWith("http"));
    if (!remoteUrl) return;

    let origin: string;
    try {
      origin = new URL(remoteUrl).origin;
    } catch {
      return;
    }

    const existing = document.querySelector(`link[data-blob-preconnect="${origin}"]`);
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;
    link.setAttribute("data-blob-preconnect", origin);
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, [urls]);
}
