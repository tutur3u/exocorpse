type CmsUploadPayload = {
  contentType?: string;
  headers?: Record<string, string>;
  path?: string;
  signedUrl?: string;
  token?: string;
};

async function readUploadError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    error?: unknown;
  } | null;
  return typeof payload?.error === "string" ? payload.error : fallback;
}

export async function uploadCmsAssetDirect({
  collectionType,
  entrySlug,
  file,
}: {
  collectionType: string;
  entrySlug: string;
  file: File;
}) {
  const path = `${collectionType}/${entrySlug}/${file.name}`;
  const metadataResponse = await fetch("/api/storage/signed-upload-url", {
    body: JSON.stringify({
      contentType: file.type || "application/octet-stream",
      path,
      size: file.size,
      upsert: false,
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (!metadataResponse.ok) {
    throw new Error(
      await readUploadError(metadataResponse, "Could not prepare this upload."),
    );
  }

  const upload = (await metadataResponse.json()) as CmsUploadPayload;
  if (!upload.signedUrl || !upload.path) {
    throw new Error("The media service did not return a usable upload URL.");
  }

  const headers: Record<string, string> = { ...(upload.headers ?? {}) };
  if (!headers["Content-Type"]) {
    headers["Content-Type"] =
      upload.contentType || file.type || "application/octet-stream";
  }
  if (upload.token) headers.Authorization = `Bearer ${upload.token}`;

  let response = await fetch(upload.signedUrl, {
    body: file,
    cache: "no-store",
    headers,
    method: "PUT",
  });
  if (!response.ok && headers["Content-Type"]) {
    const fallbackHeaders = { ...headers };
    delete fallbackHeaders["Content-Type"];
    response = await fetch(upload.signedUrl, {
      body: file,
      cache: "no-store",
      headers: fallbackHeaders,
      method: "PUT",
    });
  }
  if (!response.ok) {
    throw new Error(`Upload failed (${response.status}). Please try again.`);
  }

  return upload.path;
}
