import type { Metadata } from "next";
import { GalleryExperience } from "@/components/gallery/GalleryExperience";
import {
  getCatalogBySlug,
  getGalleryShareDescription,
  getPreviewPhoto,
  isCatalogExpired,
} from "@/lib/catalog";
import { getSiteUrl } from "@/lib/site-url";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalogBySlug(slug);
  const siteUrl = getSiteUrl();
  const galleryUrl = `${siteUrl}/gallery/${slug}`;

  if (!catalog || isCatalogExpired(catalog.expiresAt)) {
    return {
      title: "Gallery unavailable",
      description: "This gallery is no longer available.",
    };
  }

  const description = getGalleryShareDescription(catalog);
  const previewPhoto = getPreviewPhoto(catalog);
  const previewUrl = previewPhoto
    ? `${siteUrl}/api/catalogs/${slug}/preview`
    : undefined;

  return {
    title: catalog.title,
    description,
    openGraph: {
      title: catalog.title,
      description,
      url: galleryUrl,
      siteName: "Jordan Photo Share",
      type: "website",
      images: previewUrl
        ? [
            {
              url: previewUrl,
              width: previewPhoto.width ?? undefined,
              height: previewPhoto.height ?? undefined,
              alt: catalog.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: catalog.title,
      description,
      images: previewUrl ? [previewUrl] : [],
    },
  };
}

export default async function GalleryPage({ params }: PageProps) {
  const { slug } = await params;
  return <GalleryExperience slug={slug} />;
}
