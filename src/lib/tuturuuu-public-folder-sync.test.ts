import { describe, expect, mock, test } from "bun:test";
import {
  linkPublicFolderAssetsToRemoteSource,
  syncPublicFolderAssets,
} from "./tuturuuu-public-folder-sync";

function createManifest() {
  return {
    adapter: "exocorpse",
    content: {
      entries: [
        {
          assets: [
            {
              assetType: "image",
              metadata: {
                publicPath: "/media/legacy image.webp",
              },
              sourceUrl: "/media/legacy image.webp",
              stableSourceId: "exocorpse:asset:one",
            },
          ],
          collectionSlug: "characters",
          slug: "character-one",
        },
      ],
    },
  };
}

describe("Exocorpse public asset synchronization", () => {
  test("links production public assets to canonical Exocorpse URLs", () => {
    const manifest = linkPublicFolderAssetsToRemoteSource(
      createManifest(),
      "https://exocorpse.net/",
    );
    const asset = manifest.content.entries[0]?.assets?.[0];

    expect(asset).toMatchObject({
      metadata: {
        legacyPublicPath: "/media/legacy image.webp",
      },
      publicPath: null,
      sourceUrl: "https://exocorpse.net/media/legacy%20image.webp",
      storagePath: null,
    });
    expect(asset?.metadata).not.toHaveProperty("publicPath");
  });

  test("does not re-upload assets that already use remote source URLs", async () => {
    const manifest = linkPublicFolderAssetsToRemoteSource(
      createManifest(),
      "https://exocorpse.net",
    );
    const fetchMock = mock(async () => new Response(null, { status: 500 }));

    const result = await syncPublicFolderAssets({
      accessToken: "token",
      apiBaseUrl: "https://tuturuuu.com/api/v1",
      fetch: fetchMock,
      manifest,
      workspaceId: "workspace-id",
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.uploaded).toEqual([]);
    expect(result.skipped).toEqual([]);
    expect(result.manifest).toEqual(manifest);
  });
});
