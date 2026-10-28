import { raster, audio, video } from "./upload-media";
import { EXOCORPSE_CMS_SCHEMA } from "../../scripts/exocorpse-cms-schema";
import {
  AdminInputError,
  adminId,
  storagePath,
  drivePath,
} from "./admin-input";

const documents = new Map([
  ["application/pdf", ["pdf"]],
  ["text/plain", ["txt"]],
]);
const driveDownloads = new Map<string, string[]>([
  ["application/zip", ["zip"]],
  ["application/x-zip-compressed", ["zip"]],
  ["application/x-7z-compressed", ["7z"]],
  ["application/vnd.rar", ["rar"]],
  ["application/x-rar-compressed", ["rar"]],
  ["application/x-tar", ["tar"]],
  ["application/gzip", ["gz", "tgz"]],
  ["application/x-bzip2", ["bz2"]],
  ["application/x-xz", ["xz"]],
  ["application/msword", ["doc"]],
  ["application/vnd.ms-excel", ["xls"]],
  ["application/vnd.ms-powerpoint", ["ppt"]],
  [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ["docx"],
  ],
  [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ["xlsx"],
  ],
  [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ["pptx"],
  ],
  ["text/csv", ["csv"]],
  ["application/json", ["json"]],
  ["image/vnd.adobe.photoshop", ["psd", "psb"]],
  ["application/x-photoshop", ["psd", "psb"]],
  ["application/x-krita", ["kra"]],
  ["image/openraster", ["ora"]],
  [
    "application/octet-stream",
    [
      "zip",
      "7z",
      "rar",
      "tar",
      "gz",
      "tgz",
      "bz2",
      "xz",
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "csv",
      "json",
      "txt",
      "psd",
      "psb",
      "clip",
      "kra",
      "ora",
      "blend",
      "fbx",
      "obj",
      "stl",
      "afdesign",
      "afphoto",
      "ase",
      "aseprite",
      "procreate",
      "bin",
    ],
  ],
]);
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

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
  if (purpose === "drive")
    for (const item of driveDownloads) allowed.set(...item);
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
  const directory = drivePath(input.directory);
  return {
    collectionType: "drive",
    entrySlug: directory.slice("drive/".length),
    ...validateMetadata("drive", input.filename, input.contentType, input.size),
    upsert: false,
  };
}
