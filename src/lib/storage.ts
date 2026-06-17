import { del, get, put } from "@vercel/blob";
import { mkdir, unlink, writeFile, readFile } from "fs/promises";
import path from "path";
import type { PhotoStorageRecord } from "@/lib/photos";
import { UPLOAD_DIR } from "@/lib/constants";

function useBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function getUploadRoot() {
  return path.join(/* turbopackIgnore: true */ process.cwd(), UPLOAD_DIR);
}

function getLocalPhotoPath(catalogId: string, filename: string) {
  return path.join(getUploadRoot(), catalogId, filename);
}

function getBlobPathname(catalogId: string, filename: string) {
  return `catalogs/${catalogId}/${filename}`;
}

async function ensureLocalCatalogDir(catalogId: string) {
  await mkdir(path.join(getUploadRoot(), catalogId), { recursive: true });
}

export async function savePhotoFile(
  catalogId: string,
  filename: string,
  buffer: Buffer,
): Promise<{ storageUrl: string | null }> {
  if (useBlobStorage()) {
    const blob = await put(getBlobPathname(catalogId, filename), buffer, {
      access: "private",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return { storageUrl: blob.url };
  }

  await ensureLocalCatalogDir(catalogId);
  await writeFile(getLocalPhotoPath(catalogId, filename), buffer);
  return { storageUrl: null };
}

export async function readPhotoFile(photo: PhotoStorageRecord): Promise<Buffer> {
  if (photo.storageUrl) {
    const result = await get(photo.storageUrl, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!result?.stream) {
      throw new Error("Photo not found in blob storage.");
    }

    return Buffer.from(await new Response(result.stream).arrayBuffer());
  }

  return readFile(getLocalPhotoPath(photo.catalogId, photo.filename));
}

export async function deletePhotoFile(photo: PhotoStorageRecord) {
  if (photo.storageUrl) {
    await del(photo.storageUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return;
  }

  try {
    await unlink(getLocalPhotoPath(photo.catalogId, photo.filename));
  } catch {
    // File may already be missing
  }
}

export function isBlobStorageEnabled() {
  return useBlobStorage();
}
