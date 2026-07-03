import { describe, expect, mock, test } from "bun:test";

const missingAsset = {
  assetType: "image",
  collectionSlug: "portfolio-art",
  entrySlug: "sample-art",
  entryStableSourceId: "exocorpse:art:art-1",
  entryTitle: "Sample Art",
  expectedFilePath: "/app/public/media/missing.png",
  filename: "missing.png",
  publicPath: "/media/missing.png",
  sourceMetadata: {
    asset: { publicPath: "/media/missing.png" },
    entry: { sourceId: "art-1", sourceTable: "art_pieces" },
    sourceId: "art-1",
    sourceTable: "art_pieces",
  },
  stableSourceId: "exocorpse:art:art-1:image",
  storagePath:
    "external-projects/exocorpse/portfolio-art/sample-art/missing.png",
};

mock.module("@/lib/auth/utils", () => ({
  verifyAuth: async () => undefined,
}));

mock.module("@/lib/exocorpse-migration-safety", () => ({
  buildExocorpseMigrationSnapshot: async () => ({
    preflight: {
      manifestDigest:
        "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      publicAssets: {
        missing: [missingAsset],
        present: [],
        totalBytes: 0,
      },
      totals: {
        assets: 1,
        blocks: 0,
        entries: 1,
        publicAssets: 1,
        schemaCollections: 1,
      },
    },
  }),
}));

describe("missing public asset report route", () => {
  test("returns the missing asset report as JSON", async () => {
    const { GET } = await import("./route");
    const response = await GET(
      new Request(
        "http://localhost/api/admin/tuturuuu/migration/missing-assets",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.count).toBe(1);
    expect(body.missingAssets[0]).toMatchObject({
      entryTitle: "Sample Art",
      expectedFilePath: "/app/public/media/missing.png",
      publicPath: "/media/missing.png",
      stableSourceId: "exocorpse:art:art-1:image",
    });
  });

  test("returns the missing asset report as CSV", async () => {
    const { GET } = await import("./route");
    const response = await GET(
      new Request(
        "http://localhost/api/admin/tuturuuu/migration/missing-assets?format=csv",
      ),
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/csv; charset=utf-8",
    );
    expect(response.headers.get("content-disposition")).toContain(
      "exocorpse-missing-public-assets-1234567890ab.csv",
    );
    expect(body).toContain('"/media/missing.png"');
    expect(body).toContain('"/app/public/media/missing.png"');
  });
});
