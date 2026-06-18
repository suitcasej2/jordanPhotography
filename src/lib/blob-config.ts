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

export function hasBlobOidcAuth() {
  return Boolean(readEnv("VERCEL_OIDC_TOKEN") && getBlobStoreId());
}

/** OIDC stores use presigned browser uploads (no long-lived token required). */
export function usesPresignedClientUpload() {
  return Boolean(hasBlobOidcAuth() && getBlobWebhookPublicKey());
}

/** Browser uploads work with OIDC presigned URLs or a read-write token. */
export function isDirectBlobUploadEnabled() {
  return usesPresignedClientUpload() || Boolean(getBlobReadWriteToken());
}

/** Server-side Blob reads/writes work with OIDC or a read-write token. */
export function isBlobStorageEnabled() {
  return isDirectBlobUploadEnabled();
}

export function getBlobStorageStatus() {
  const readWriteToken = getBlobReadWriteToken();
  const storeConnected = Boolean(getBlobStoreId() || readWriteToken);
  const presignedUpload = usesPresignedClientUpload();

  return {
    blobConfigured: isBlobStorageEnabled(),
    directUpload: isDirectBlobUploadEnabled(),
    storeConnected,
    hasReadWriteToken: Boolean(readWriteToken),
    hasOidcAuth: hasBlobOidcAuth(),
    hasWebhookPublicKey: Boolean(getBlobWebhookPublicKey()),
    uploadMode: presignedUpload
      ? ("presigned" as const)
      : readWriteToken
        ? ("legacy" as const)
        : null,
  };
}
