import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  analyzeExocorpseMigrationManifest,
  formatMissingPublicAssetsCsv,
  inspectPublicAssets,
  resolvePublicFilePath,
  type MigrationManifest,
} from "./exocorpse-migration-report";

let publicDir: string;

function createManifest(
  assets: MigrationManifest["content"]["entries"][number]["assets"],
): MigrationManifest {
  return {
    content: {
      entries: [
        {
          assets,
          blocks: [],
          collectionSlug: "portfolio-art",
          metadata: {
            sourceId: "art-1",
            sourceTable: "art_pieces",
          },
          slug: "sample-art",
          stableSourceId: "exocorpse:art:art-1",
          title: "Sample Art",
        },
      ],
    },
    schema: {
      collections: [{ slug: "portfolio-art" }],
    },
  };
}

describe("exocorpse migration public asset reports", () => {
  beforeEach(async () => {
    publicDir = await mkdtemp(join(tmpdir(), "exocorpse-public-"));
  });

  afterEach(async () => {
    await rm(publicDir, { force: true, recursive: true });
  });

  test("counts existing local public assets as present", async () => {
    await mkdir(join(publicDir, "media"), { recursive: true });
    await writeFile(join(publicDir, "media", "present.png"), "abc");

    const manifest = createManifest([
      {
        assetType: "image",
        metadata: { publicPath: "/media/present.png" },
        sourceUrl: "/media/present.png",
        stableSourceId: "exocorpse:art:art-1:image",
      },
    ]);
    const publicAssets = await inspectPublicAssets(manifest, publicDir);
    const preflight = analyzeExocorpseMigrationManifest({
      manifest,
      manifestDigest: "digest",
      publicAssets,
      sourceCounts: {},
    });

    expect(publicAssets.present).toHaveLength(1);
    expect(publicAssets.missing).toHaveLength(0);
    expect(publicAssets.present[0]).toMatchObject({
      collectionSlug: "portfolio-art",
      entrySlug: "sample-art",
      filename: "present.png",
      publicPath: "/media/present.png",
      size: 3,
      stableSourceId: "exocorpse:art:art-1:image",
    });
    expect(preflight.readyToApply).toBe(true);
  });

  test("reports missing local public assets and blocks apply", async () => {
    const manifest = createManifest([
      {
        assetType: "image",
        metadata: { publicPath: "/media/missing.png" },
        sourceUrl: "/media/missing.png",
        stableSourceId: "exocorpse:art:art-1:image",
        storagePath:
          "external-projects/exocorpse/portfolio-art/sample-art/missing.png",
      },
    ]);
    const publicAssets = await inspectPublicAssets(manifest, publicDir);
    const preflight = analyzeExocorpseMigrationManifest({
      manifest,
      manifestDigest: "digest",
      publicAssets,
      sourceCounts: {},
    });
    const csv = formatMissingPublicAssetsCsv(publicAssets.missing);

    expect(publicAssets.present).toHaveLength(0);
    expect(publicAssets.missing).toHaveLength(1);
    expect(publicAssets.missing[0]).toMatchObject({
      assetType: "image",
      collectionSlug: "portfolio-art",
      entrySlug: "sample-art",
      entryStableSourceId: "exocorpse:art:art-1",
      entryTitle: "Sample Art",
      expectedFilePath: resolvePublicFilePath(publicDir, "/media/missing.png"),
      publicPath: "/media/missing.png",
      sourceMetadata: {
        sourceId: "art-1",
        sourceTable: "art_pieces",
      },
      stableSourceId: "exocorpse:art:art-1:image",
      storagePath:
        "external-projects/exocorpse/portfolio-art/sample-art/missing.png",
    });
    expect(preflight.readyToApply).toBe(false);
    expect(preflight.issues).toContainEqual(
      expect.objectContaining({
        code: "missing_public_assets",
        severity: "error",
      }),
    );
    expect(csv).toContain('"/media/missing.png"');
    expect(csv).toContain('"art_pieces"');
    expect(csv).toContain('"art-1"');
  });

  test("ignores remote URLs and non-public storage paths", async () => {
    const manifest = createManifest([
      {
        assetType: "image",
        sourceUrl: "https://cdn.example.com/remote.png",
        stableSourceId: "exocorpse:art:art-1:remote",
      },
      {
        assetType: "image",
        sourceUrl: null,
        stableSourceId: "exocorpse:art:art-1:storage",
        storagePath: "media/storage-only.png",
      },
      {
        assetType: "image",
        sourceUrl: "media/relative-storage.png",
        stableSourceId: "exocorpse:art:art-1:relative",
      },
    ]);
    const publicAssets = await inspectPublicAssets(manifest, publicDir);

    expect(publicAssets.present).toHaveLength(0);
    expect(publicAssets.missing).toHaveLength(0);
    expect(publicAssets.totalBytes).toBe(0);
  });
});
