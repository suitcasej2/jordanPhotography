const PREVIEW_MAX_EDGE = 1400;
const PREVIEW_WEBP_QUALITY = 0.8;

export async function generatePreviewBlob(file: File): Promise<Blob | null> {
  if (!/\.(jpe?g|png|webp)$/i.test(file.name) && !/^image\/(jpeg|png|webp)$/i.test(file.type)) {
    return null;
  }

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    if (width > PREVIEW_MAX_EDGE || height > PREVIEW_MAX_EDGE) {
      if (width >= height) {
        height = Math.round((height * PREVIEW_MAX_EDGE) / width);
        width = PREVIEW_MAX_EDGE;
      } else {
        width = Math.round((width * PREVIEW_MAX_EDGE) / height);
        height = PREVIEW_MAX_EDGE;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return null;
    }

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        "image/webp",
        PREVIEW_WEBP_QUALITY,
      );
    });
  } catch {
    return null;
  }
}
