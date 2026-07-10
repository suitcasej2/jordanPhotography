import { getAuthorizedPhoto, serveAuthorizedPhoto } from "@/lib/photos/access";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await getAuthorizedPhoto(id);
  if ("error" in result) return result.error;

  return serveAuthorizedPhoto(result.photo, { download: true });
}
