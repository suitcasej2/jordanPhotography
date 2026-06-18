export async function readJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    throw new Error(
      response.ok
        ? "Empty response from server."
        : `Request failed (${response.status}).`,
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    if (/request entity too large|function_payload_too_large|payload too large/i.test(text)) {
      throw new Error(
        "Photo is too large for server upload. Connect Vercel Blob storage so uploads go directly from your browser.",
      );
    }

    throw new Error(
      response.ok
        ? "Unexpected response from server."
        : text.slice(0, 120) || `Request failed (${response.status}).`,
    );
  }
}
