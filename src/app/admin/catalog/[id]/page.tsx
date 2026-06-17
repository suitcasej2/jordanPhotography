import { CatalogManager } from "@/components/admin/CatalogManager";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CatalogAdminPage({ params }: PageProps) {
  const { id } = await params;
  return <CatalogManager catalogId={id} />;
}
