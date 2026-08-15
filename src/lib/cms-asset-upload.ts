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
  onProgress,
}: {
  collectionType: string;
  entrySlug: string;
  file: File;
  onProgress?: (percentage: number) => void;
}) {
  onProgress?.(2);
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

  const uploadFile = async (requestHeaders: Record<string, string>) => {
    if (onProgress && typeof XMLHttpRequest !== "undefined") {
      await new Promise<void>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("PUT", upload.signedUrl!);
        Object.entries(requestHeaders).forEach(([key, value]) =>
          request.setRequestHeader(key, value),
        );
        request.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          onProgress(
            Math.max(
              5,
              Math.min(95, Math.round((event.loaded / event.total) * 90) + 5),
            ),
          );
        };
        request.onerror = () =>
          reject(new Error("The upload was interrupted. Please try again."));
        request.onload = () => {
          if (request.status >= 200 && request.status < 300) resolve();
          else
            reject(
              Object.assign(
                new Error(
                  `Upload failed (${request.status}). Please try again.`,
                ),
                { status: request.status },
              ),
            );
        };
        request.send(file);
      });
      return;
    }

    const response = await fetch(upload.signedUrl!, {
      body: file,
      cache: "no-store",
      headers: requestHeaders,
      method: "PUT",
    });
    if (!response.ok) {
      throw Object.assign(
        new Error(`Upload failed (${response.status}). Please try again.`),
        { status: response.status },
      );
    }
  };

  try {
    await uploadFile(headers);
  } catch (error) {
    const status =
      typeof error === "object" && error && "status" in error
        ? Number(error.status)
        : 0;
    if (!headers["Content-Type"] || (status !== 400 && status !== 403)) {
      throw error;
    }
    const fallbackHeaders = { ...headers };
    delete fallbackHeaders["Content-Type"];
    await uploadFile(fallbackHeaders);
  }

  onProgress?.(96);
  return upload.path;
}
