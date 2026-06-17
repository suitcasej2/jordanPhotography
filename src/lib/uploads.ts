import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "@/lib/constants";

export function getUploadRoot() {
  return path.join(/* turbopackIgnore: true */ process.cwd(), UPLOAD_DIR);
}

export function getCatalogUploadDir(catalogId: string) {
  return path.join(getUploadRoot(), catalogId);
}

export function getPhotoPath(catalogId: string, filename: string) {
  return path.join(getCatalogUploadDir(catalogId), filename);
}

export async function ensureCatalogUploadDir(catalogId: string) {
  await mkdir(getCatalogUploadDir(catalogId), { recursive: true });
}

export async function saveUploadedFile(
  catalogId: string,
  filename: string,
  buffer: Buffer,
) {
  await ensureCatalogUploadDir(catalogId);
  const filePath = getPhotoPath(catalogId, filename);
  await writeFile(filePath, buffer);
  return filePath;
}

export async function deleteUploadedFile(catalogId: string, filename: string) {
  try {
    await unlink(getPhotoPath(catalogId, filename));
  } catch {
    // File may already be missing
  }
}
