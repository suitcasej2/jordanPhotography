import { GalleryExperience } from "@/components/gallery/GalleryExperience";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function GalleryPage({ params }: PageProps) {
  const { slug } = await params;
  return <GalleryExperience slug={slug} />;
}
