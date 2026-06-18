import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  ALLOWED_PHOTO_TYPES,
  getBlobPhotoPathname,
  getPhotoExtension,
} from "@/lib/photos/upload";
import { hasAdminSession } from "@/lib/session";
import { isBlobStorageEnabled } from "@/lib/storage";

type UploadClientPayload = {
  catalogId: string;
  originalName: string;
  filename: string;
};

function parseClientPayload(clientPayload: string | null): UploadClientPayload {
  if (!clientPayload) {
    throw new Error("Missing upload metadata.");
  }

  const payload = JSON.parse(clientPayload) as Partial<UploadClientPayload>;
  if (!payload.catalogId || !payload.originalName || !payload.filename) {
    throw new Error("Invalid upload metadata.");
  }

  return {
    catalogId: payload.catalogId,
    originalName: payload.originalName,
    filename: payload.filename,
  };
}

export async function POST(request: Request) {
  if (!isBlobStorageEnabled()) {
    return NextResponse.json(
      { error: "Direct uploads are not enabled." },
      { status: 404 },
    );
  }

  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!(await hasAdminSession())) {
          throw new Error("Unauthorized.");
        }

        const payload = parseClientPayload(clientPayload);
        const expectedPathname = getBlobPhotoPathname(
          payload.catalogId,
          payload.filename,
        );

        if (pathname !== expectedPathname) {
          throw new Error("Invalid upload path.");
        }

        const catalog = await prisma.catalog.findUnique({
          where: { id: payload.catalogId },
          select: { id: true },
        });
        if (!catalog) {
          throw new Error("Catalog not found.");
        }

        const ext = getPhotoExtension(payload.originalName);
        if (!["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(ext)) {
          throw new Error("Unsupported file type.");
        }

        return {
          allowedContentTypes: Array.from(ALLOWED_PHOTO_TYPES),
          maximumSizeInBytes: 50 * 1024 * 1024,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify(payload),
        };
      },
    });

    if (jsonResponse.type === "blob.generate-client-token") {
      return NextResponse.json({ clientToken: jsonResponse.clientToken });
    }

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 },
    );
  }
}
