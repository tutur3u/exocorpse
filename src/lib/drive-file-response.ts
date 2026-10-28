import "server-only";

import { AdminInputError, drivePath } from "./admin-input";
import { getExocorpseDriveReadUrl } from "./tuturuuu-admin-integrations";
import { isInlineMedia } from "./upload-media";
import { MAX_UPLOAD_BYTES } from "./upload-policy";

function storageUrl(value: string) {
  if (!URL.canParse(value))
    throw Object.assign(new Error("Invalid storage URL."), { status: 502 });
  const url = new URL(value);
  // Keep the same exact Supabase origin used by the OG image transformer.
  // R2 deployments must explicitly configure their exact storage origin.
  const extraOrigin = process.env.EXOCORPSE_STORAGE_ORIGIN;
  const approved =
    (url.origin === "https://nzamlzqfdwaaxdefwraj.supabase.co" &&
      url.pathname.startsWith("/storage/v1/object/sign/")) ||
    Boolean(extraOrigin && url.origin === extraOrigin);
  if (
    !approved ||
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port
  ) {
    throw Object.assign(new Error("Unapproved storage URL."), { status: 502 });
  }
  return url;
}

export async function driveFileResponse(
  request: Request,
  filePath: string,
  download: boolean,
) {
  drivePath(filePath);
  const { data } = await getExocorpseDriveReadUrl(filePath);
  const url = storageUrl(data.signedUrl);
  const range = request.headers.get("range");
  if (range && !/^bytes=\d*-\d*$/.test(range))
    throw new AdminInputError("Invalid range.");
  const upstream = await fetch(url, {
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
    headers: range ? { Range: range } : {},
  });
  if (!upstream.ok) {
    await upstream.body?.cancel();
    throw Object.assign(new Error("File unavailable."), { status: 502 });
  }
  const filename = filePath.split("/").at(-1) ?? "download";
  const mime =
    upstream.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ??
    "application/octet-stream";
  const inline = !download && isInlineMedia(mime, filename);
  const headers = new Headers({
    "Cache-Control": "private, no-store, max-age=0",
    "CDN-Cache-Control": "no-store",
    "Vercel-CDN-Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "sandbox; default-src 'none'",
    "Content-Type": inline ? mime : "application/octet-stream",
    "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(filename).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)}`,
  });
  for (const key of ["content-range", "accept-ranges"]) {
    const value = upstream.headers.get(key);
    if (value) headers.set(key, value);
  }
  if (Number(upstream.headers.get("content-length")) > MAX_UPLOAD_BYTES) {
    await upstream.body?.cancel();
    throw Object.assign(new Error("File too large."), { status: 413 });
  }
  let bytes = 0;
  const body = upstream.body?.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        bytes += chunk.byteLength;
        if (bytes > MAX_UPLOAD_BYTES) {
          controller.error(new Error("File exceeds the download byte limit."));
          return;
        }
        controller.enqueue(chunk);
      },
    }),
  );
  return new Response(body, { status: upstream.status, headers });
}
