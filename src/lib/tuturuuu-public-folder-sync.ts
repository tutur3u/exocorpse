import { readFile } from "node:fs/promises";
import { basename, extname, resolve, sep } from "node:path";
import { posix } from "node:path";

type PublicAssetMetadata = Record<string, unknown> & {
  localAssetPath?: unknown;
  publicPath?: unknown;
  sourcePublicPath?: unknown;
};

type PublicAsset = {
  assetType: string;
  metadata?: Record<string, unknown>;
  publicPath?: string | null;
  sourceUrl?: string | null;
  stableSourceId?: string | null;
  storagePath?: string | null;
};

type PublicEntry = {
  assets?: PublicAsset[];
  collectionSlug: string;
  slug: string;
};

type PublicManifest = {
  adapter: string;
  content: {
    entries: PublicEntry[];
  };
};

type UploadUrlResponse = {
  path?: unknown;
  signedUrl?: unknown;
  token?: unknown;
};

export type PublicFolderAssetUpload = {
  collectionSlug: string;
  entrySlug: string;
  filename: string;
  publicPath: string;
  stableSourceId: string | null;
  storagePath: string;
};

export type PublicFolderSyncResult<Manifest extends PublicManifest> = {
  manifest: Manifest;
  skipped: PublicFolderAssetUpload[];
  uploaded: PublicFolderAssetUpload[];
};

type SyncPublicFolderAssetsInput<Manifest extends PublicManifest> = {
  accessToken: string;
  apiBaseUrl: string;
  fetch?: typeof fetch;
  manifest: Manifest;
  publicDir?: string;
  tokenType?: string;
  upsert?: boolean;
  workspaceId: string;
};

const CONTENT_TYPES: Record<string, string> = {
  ".ani": "application/x-navi-animation",
  ".cur": "image/x-win-bitmap",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function cloneManifest<Manifest extends PublicManifest>(manifest: Manifest) {
  return structuredClone(manifest) as Manifest;
}

function normalizePublicPath(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed) || !trimmed.startsWith("/")) {
    return null;
  }

  const normalized = posix.normalize(trimmed);
  if (normalized === "/" || normalized.startsWith("/../")) {
    return null;
  }

  return normalized;
}

function getAssetPublicPath(asset: PublicAsset) {
  const metadata = (asset.metadata ?? {}) as PublicAssetMetadata;

  return (
    normalizePublicPath(asset.publicPath) ??
    normalizePublicPath(metadata.publicPath) ??
    normalizePublicPath(metadata.localAssetPath) ??
    normalizePublicPath(metadata.sourcePublicPath) ??
    normalizePublicPath(asset.sourceUrl)
  );
}

function contentTypeForPath(publicPath: string) {
  return (
    CONTENT_TYPES[extname(publicPath).toLowerCase()] ??
    "application/octet-stream"
  );
}

function resolvePublicFilePath(publicDir: string, publicPath: string) {
  const publicRoot = resolve(/* turbopackIgnore: true */ publicDir);
  const filePath = resolve(
    /* turbopackIgnore: true */ publicRoot,
    publicPath.slice(1),
  );
  if (filePath !== publicRoot && !filePath.startsWith(`${publicRoot}${sep}`)) {
    throw new Error(
      `Refusing to read public asset outside publicDir: ${publicPath}`,
    );
  }

  return filePath;
}

function getPublicAssetUploads(manifest: PublicManifest) {
  const uploads: Array<{
    asset: PublicAsset;
    entry: PublicEntry;
    publicPath: string;
  }> = [];

  for (const entry of manifest.content.entries) {
    for (const asset of entry.assets ?? []) {
      const publicPath = getAssetPublicPath(asset);
      if (publicPath) {
        uploads.push({ asset, entry, publicPath });
      }
    }
  }

  return uploads;
}

function getPublicAssetStoragePath({
  adapter,
  collectionSlug,
  entrySlug,
  publicPath,
}: {
  adapter: string;
  collectionSlug: string;
  entrySlug: string;
  publicPath: string;
}) {
  return posix.join(
    "external-projects",
    adapter,
    collectionSlug,
    entrySlug,
    basename(publicPath),
  );
}

function parseUploadUrlResponse(payload: UploadUrlResponse) {
  if (
    typeof payload.signedUrl !== "string" ||
    typeof payload.token !== "string" ||
    typeof payload.path !== "string"
  ) {
    throw new Error("Missing Tuturuuu asset upload URL payload");
  }

  return {
    path: payload.path,
    signedUrl: payload.signedUrl,
    token: payload.token,
  };
}

async function readUploadUrlError(response: Response) {
  const data = (await response.json().catch(() => null)) as {
    error?: unknown;
  } | null;
  return typeof data?.error === "string" && data.error.trim()
    ? data.error
    : `Tuturuuu asset upload URL failed with status ${response.status}`;
}

export function linkPublicFolderAssets<Manifest extends PublicManifest>(
  manifestInput: Manifest,
) {
  const manifest = cloneManifest(manifestInput);

  for (const { asset, entry, publicPath } of getPublicAssetUploads(manifest)) {
    asset.metadata = {
      ...(asset.metadata ?? {}),
      publicPath,
    };
    asset.sourceUrl = null;
    asset.storagePath = getPublicAssetStoragePath({
      adapter: manifest.adapter,
      collectionSlug: entry.collectionSlug,
      entrySlug: entry.slug,
      publicPath,
    });
  }

  return manifest;
}

export async function syncPublicFolderAssets<Manifest extends PublicManifest>({
  accessToken,
  apiBaseUrl,
  fetch: fetchImpl = fetch,
  manifest: manifestInput,
  publicDir = resolve(/* turbopackIgnore: true */ process.cwd(), "public"),
  tokenType = "Bearer",
  upsert = true,
  workspaceId,
}: SyncPublicFolderAssetsInput<Manifest>): Promise<
  PublicFolderSyncResult<Manifest>
> {
  const manifest = linkPublicFolderAssets(manifestInput);
  const uploaded: PublicFolderAssetUpload[] = [];
  const skipped: PublicFolderAssetUpload[] = [];

  for (const { asset, entry, publicPath } of getPublicAssetUploads(manifest)) {
    const upload = {
      collectionSlug: entry.collectionSlug,
      entrySlug: entry.slug,
      filename: basename(publicPath),
      publicPath,
      stableSourceId: asset.stableSourceId ?? null,
      storagePath:
        asset.storagePath ??
        getPublicAssetStoragePath({
          adapter: manifest.adapter,
          collectionSlug: entry.collectionSlug,
          entrySlug: entry.slug,
          publicPath,
        }),
    } satisfies PublicFolderAssetUpload;

    let file: Buffer;
    try {
      file = await readFile(
        /* turbopackIgnore: true */ resolvePublicFilePath(
          publicDir,
          publicPath,
        ),
      );
    } catch {
      skipped.push(upload);
      continue;
    }

    const uploadUrlResponse = await fetchImpl(
      `${apiBaseUrl.replace(/\/+$/, "")}/workspaces/${encodeURIComponent(
        workspaceId,
      )}/external-projects/assets/upload-url`,
      {
        body: JSON.stringify({
          collectionType: entry.collectionSlug,
          entrySlug: entry.slug,
          filename: upload.filename,
          upsert,
        }),
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `${tokenType} ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );

    if (!uploadUrlResponse.ok) {
      throw new Error(await readUploadUrlError(uploadUrlResponse));
    }

    const uploadUrl = parseUploadUrlResponse(await uploadUrlResponse.json());
    const contentType = contentTypeForPath(publicPath);
    let response = await fetchImpl(uploadUrl.signedUrl, {
      body: new Blob([new Uint8Array(file)], { type: contentType }),
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${uploadUrl.token}`,
        "Content-Type": contentType,
      },
      method: "PUT",
    });

    if (!response.ok) {
      response = await fetchImpl(uploadUrl.signedUrl, {
        body: new Blob([new Uint8Array(file)], { type: contentType }),
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${uploadUrl.token}`,
        },
        method: "PUT",
      });
    }

    if (!response.ok) {
      const message = await response.text().catch(() => "");
      throw new Error(
        `Failed to upload public asset ${publicPath} (${response.status})${
          message ? `: ${message}` : ""
        }`,
      );
    }

    uploaded.push(upload);
  }

  return { manifest, skipped, uploaded };
}
