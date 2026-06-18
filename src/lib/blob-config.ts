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

export function hasBlobOidcAuth() {
  return Boolean(readEnv("VERCEL_OIDC_TOKEN") && getBlobStoreId());
}

/** Browser uploads require a read-write token for handleUpload. */
export function isDirectBlobUploadEnabled() {
  return Boolean(getBlobReadWriteToken());
}

/** Server-side Blob reads/writes work with OIDC or a read-write token. */
export function isBlobStorageEnabled() {
  return isDirectBlobUploadEnabled() || hasBlobOidcAuth();
}

export function getBlobStorageStatus() {
  const readWriteToken = getBlobReadWriteToken();
  const storeConnected = Boolean(getBlobStoreId() || readWriteToken);

  return {
    blobConfigured: isBlobStorageEnabled(),
    directUpload: isDirectBlobUploadEnabled(),
    storeConnected,
    hasReadWriteToken: Boolean(readWriteToken),
    hasOidcAuth: hasBlobOidcAuth(),
  };
}
