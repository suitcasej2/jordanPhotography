import sharp from "sharp";

export const PREVIEW_MAX_EDGE = 640;
export const PREVIEW_WEBP_QUALITY = 72;

export async function generatePreviewBuffer(buffer: Buffer) {
  return sharp(buffer)
    .rotate()
    .resize(PREVIEW_MAX_EDGE, PREVIEW_MAX_EDGE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: PREVIEW_WEBP_QUALITY })
    .toBuffer();
}

export function getPreviewFilenameForPhoto(filename: string) {
  const base = filename.replace(/\.[^.]+$/, "");
  return `${base}.webp`;
}
