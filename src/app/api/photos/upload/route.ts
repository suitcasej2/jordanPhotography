import {
  handleUpload,
  handleUploadPresigned,
  type HandleUploadBody,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { issueSignedToken } from "@vercel/blob";
import { NextResponse } from "next/server";
import {
  getBlobReadWriteToken,
  usesPresignedClientUpload,
} from "@/lib/blob-config";
import { validateUploadRequest } from "@/lib/photos/blob-upload-auth";
import { hasAdminSession } from "@/lib/session";
import { isDirectBlobUploadEnabled } from "@/lib/storage";

export async function POST(request: Request) {
  if (!isDirectBlobUploadEnabled()) {
    return NextResponse.json(
      {
        error:
          "Blob storage is not connected. Link jordan-photography-blob to this project in Vercel, then redeploy.",
      },
      { status: 404 },
    );
  }

  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as
    | HandleUploadBody
    | HandleUploadPresignedBody;

  try {
    if (usesPresignedClientUpload()) {
      const jsonResponse = await handleUploadPresigned({
        body: body as HandleUploadPresignedBody,
        request,
        getSignedToken: async (pathname, clientPayload) => {
          if (!(await hasAdminSession())) {
            throw new Error("Unauthorized.");
          }

          const upload = await validateUploadRequest(pathname, clientPayload);
          const token = await issueSignedToken({
            pathname,
            operations: ["put"],
            allowedContentTypes: upload.allowedContentTypes,
            maximumSizeInBytes: upload.maximumSizeInBytes,
            validUntil: upload.validUntil,
          });

          return {
            token,
            urlOptions: {
              allowedContentTypes: upload.allowedContentTypes,
              maximumSizeInBytes: upload.maximumSizeInBytes,
              validUntil: upload.validUntil,
              addRandomSuffix: false,
              tokenPayload: JSON.stringify(upload.payload),
            },
          };
        },
      });

      if (jsonResponse.type === "blob.generate-presigned-url") {
        return NextResponse.json({
          presignedUrlPayload: jsonResponse.presignedUrlPayload,
        });
      }

      return NextResponse.json(jsonResponse);
    }

    const jsonResponse = await handleUpload({
      body: body as HandleUploadBody,
      request,
      token: getBlobReadWriteToken(),
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!(await hasAdminSession())) {
          throw new Error("Unauthorized.");
        }

        const upload = await validateUploadRequest(pathname, clientPayload);

        return {
          allowedContentTypes: upload.allowedContentTypes,
          maximumSizeInBytes: upload.maximumSizeInBytes,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify(upload.payload),
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
