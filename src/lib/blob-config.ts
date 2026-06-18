function readEnv(name: string) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function findEnvEndingWith(suffix: string) {
  for (const [key, value] of Object.entries(process.env)) {
    if (key.endsWith(suffix) && value?.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function hasRequestOidcToken(request?: Request) {
  const headerToken = request?.headers.get("x-vercel-oidc-token")?.trim();
  return Boolean(headerToken);
}

export function getBlobReadWriteToken() {
  return (
    readEnv("BLOB_READ_WRITE_TOKEN") ??
    findEnvEndingWith("BLOB_READ_WRITE_TOKEN")
  );
}

export function getBlobStoreId() {
  return readEnv("BLOB_STORE_ID") ?? findEnvEndingWith("BLOB_STORE_ID");
}

export function getBlobWebhookPublicKey() {
  return (
    readEnv("BLOB_WEBHOOK_PUBLIC_KEY") ??
    findEnvEndingWith("BLOB_WEBHOOK_PUBLIC_KEY")
  );
}

/**
 * OIDC is available when the store is linked and either the env var,
 * request header, or Vercel runtime is present (token is injected per request).
 */
export function hasBlobOidcAuth(request?: Request) {
  if (!getBlobStoreId()) return false;
  if (readEnv("VERCEL_OIDC_TOKEN")) return true;
  if (hasRequestOidcToken(request)) return true;
  return readEnv("VERCEL") === "1";
}

export function usesPresignedClientUpload(request?: Request) {
  return Boolean(hasBlobOidcAuth(request) && getBlobWebhookPublicKey());
}

export function isDirectBlobUploadEnabled(request?: Request) {
  return usesPresignedClientUpload(request) || Boolean(getBlobReadWriteToken());
}

export function isBlobStorageEnabled(request?: Request) {
  return isDirectBlobUploadEnabled(request);
}

export function getBlobStorageStatus(request?: Request) {
  const readWriteToken = getBlobReadWriteToken();
  const storeId = getBlobStoreId();
  const storeConnected = Boolean(storeId || readWriteToken);
  const hasOidcToken =
    Boolean(readEnv("VERCEL_OIDC_TOKEN")) || hasRequestOidcToken(request);
  const hasWebhookPublicKey = Boolean(getBlobWebhookPublicKey());
  const presignedUpload = usesPresignedClientUpload(request);
  const directUpload = isDirectBlobUploadEnabled(request);

  const missing: string[] = [];
  if (!readWriteToken) missing.push("BLOB_READ_WRITE_TOKEN");
  if (!storeId) missing.push("BLOB_STORE_ID");
  if (!hasWebhookPublicKey) missing.push("BLOB_WEBHOOK_PUBLIC_KEY");

  let setupHint: string | null = null;
  if (!directUpload) {
    if (!storeConnected) {
      setupHint =
        "Connect jordan-photography-blob to your Vercel project (Settings → Storage → Connect Store), then redeploy.";
    } else if (storeId && !hasWebhookPublicKey && !readWriteToken) {
      setupHint =
        "Store is connected but presigned uploads are not enabled. In Vercel Storage → jordan-photography-blob → Projects → your project → enable presigned uploads (adds BLOB_WEBHOOK_PUBLIC_KEY), or click Restore Read-Write Token, then redeploy.";
    } else if (storeId && hasWebhookPublicKey && hasBlobOidcAuth(request) && !readWriteToken) {
      setupHint =
        "Blob env vars look correct. Redeploy production so this deployment picks them up.";
    } else if (storeId && !readWriteToken && readEnv("VERCEL") !== "1") {
      setupHint =
        "For local dev, run vercel env pull. On Vercel, redeploy after connecting the store.";
    } else if (storeId && !readWriteToken) {
      setupHint =
        "In Vercel Storage → jordan-photography-blob → Restore Read-Write Token → redeploy.";
    } else {
      setupHint = "Redeploy after connecting the Blob store.";
    }
  }

  return {
    blobConfigured: directUpload,
    directUpload,
    storeConnected,
    hasStoreId: Boolean(storeId),
    hasReadWriteToken: Boolean(readWriteToken),
    hasOidcAuth: hasBlobOidcAuth(request),
    hasOidcToken,
    hasWebhookPublicKey,
    onVercel: readEnv("VERCEL") === "1",
    missingEnv: directUpload ? [] : missing.filter((name) => {
      if (name === "BLOB_READ_WRITE_TOKEN" && presignedUpload) return false;
      if (name === "BLOB_WEBHOOK_PUBLIC_KEY" && readWriteToken) return false;
      if (name === "BLOB_STORE_ID" && readWriteToken) return false;
      return true;
    }),
    uploadMode: presignedUpload
      ? ("presigned" as const)
      : readWriteToken
        ? ("legacy" as const)
        : null,
    setupHint,
  };
}
