import { EXOCORPSE_CMS_SCHEMA } from "../../scripts/exocorpse-cms-schema";
import { AdminInputError, adminId, storagePath } from "./admin-input";

const raster = new Map([
  ["image/png", ["png"]],
  ["image/jpeg", ["jpg", "jpeg"]],
  ["image/webp", ["webp"]],
  ["image/avif", ["avif"]],
  ["image/gif", ["gif"]],
]);
const audio = new Map([
  ["audio/mpeg", ["mp3"]],
  ["audio/ogg", ["ogg", "oga"]],
  ["audio/wav", ["wav"]],
  ["audio/x-wav", ["wav"]],
  ["audio/mp4", ["m4a"]],
]);
const video = new Map([
  ["video/mp4", ["mp4"]],
  ["video/webm", ["webm"]],
  ["video/ogg", ["ogv"]],
]);
const documents = new Map([
  ["application/pdf", ["pdf"]],
  ["text/plain", ["txt"]],
]);
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export function isInlineMedia(contentType: string, filename: string) {
  const extension = filename.split(".").at(-1)?.toLowerCase() ?? "";
  return [raster, audio, video].some((types) =>
    types.get(contentType)?.includes(extension),
  );
}

function validateMetadata(
  purpose: string,
  filename: string,
  contentType: unknown,
  size: unknown,
) {
  const collection = EXOCORPSE_CMS_SCHEMA.collections.find(
    (item) => item.collectionType === purpose,
  );
  if (!collection && purpose !== "drive")
    throw new AdminInputError("Invalid upload purpose.");
  storagePath(filename);
  if (
    filename.includes("/") ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/.test(filename)
  ) {
    throw new AdminInputError("Invalid filename.");
  }
  const allowed = new Map<string, string[]>();
  const types = collection?.config.assetTypes ?? [
    "image",
    "audio",
    "video",
    "document",
  ];
  if (
    types.includes("image") ||
    collection?.config.blockTypes.includes("markdown")
  ) {
    for (const item of raster) allowed.set(...item);
  }
  for (const [kind, entries] of [
    ["audio", audio],
    ["video", video],
    ["document", documents],
  ] as const) {
    if (types.includes(kind)) for (const item of entries) allowed.set(...item);
  }
  const extension = filename.split(".").at(-1)?.toLowerCase() ?? "";
  if (
    typeof contentType !== "string" ||
    !allowed.get(contentType)?.includes(extension)
  ) {
    throw new AdminInputError("Unsupported file type or extension.");
  }
  const maxSize = documents.has(contentType)
    ? 10 * 1024 * 1024
    : MAX_UPLOAD_BYTES;
  if (
    typeof size !== "number" ||
    !Number.isSafeInteger(size) ||
    size <= 0 ||
    size > maxSize
  ) {
    throw new AdminInputError("Invalid file size.");
  }
  return { contentType, filename, size };
}

export function parseCmsUpload(body: unknown) {
  if (
    !body ||
    typeof body !== "object" ||
    !("path" in body) ||
    typeof body.path !== "string"
  ) {
    throw new AdminInputError("Invalid upload request.");
  }
  // The create endpoint has no authorized replace workflow.
  if ("upsert" in body && body.upsert !== false)
    throw new AdminInputError("Overwrite is not supported.");
  const segments = storagePath(body.path).split("/");
  if (segments.length !== 3) throw new AdminInputError("Invalid upload path.");
  const [collectionType, entrySlug, filename] = segments;
  adminId(entrySlug);
  if (collectionType === "drive" && entrySlug !== "root")
    throw new AdminInputError("Uploads must use Managed Drive.");
  const metadata = validateMetadata(
    collectionType,
    filename,
    "contentType" in body ? body.contentType : undefined,
    "size" in body ? body.size : undefined,
  );
  return { collectionType, entrySlug, ...metadata, upsert: false };
}

export function driveUpload(input: {
  directory: string;
  filename: string;
  contentType: string;
  size: number;
}) {
  const directory = storagePath(input.directory);
  if (directory !== "drive/root" && !directory.startsWith("drive/root/")) {
    throw new AdminInputError("Uploads must use Managed Drive.");
  }
  return {
    collectionType: "drive",
    entrySlug: directory.slice("drive/".length),
    ...validateMetadata("drive", input.filename, input.contentType, input.size),
    upsert: false,
  };
}

export function uploadFilename(filename: string) {
  return (
    filename
      .normalize("NFKC")
      .replace(/[^A-Za-z0-9._-]/g, "-")
      .replace(/\.{2,}/g, "-")
      .replace(/^[^A-Za-z0-9]+/, "")
      .slice(-160)
      .replace(/^[^A-Za-z0-9]+/, "") || "upload"
  );
}
