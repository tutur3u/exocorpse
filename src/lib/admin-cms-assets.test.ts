import { describe, expect, test } from "bun:test";
import { withAdminCmsAssetPreview } from "./admin-cms-assets";

describe("authenticated CMS asset previews", () => {
  test("uses a private local proxy with a revisioned image transform", () => {
    const asset = withAdminCmsAssetPreview({
      alt_text: "cms-preview.svg",
      asset_type: "image",
      asset_url:
        "/api/v1/workspaces/ws/external-projects/assets/asset-id?v=old",
      entry_id: "entry-id",
      id: "asset-id",
      metadata: {},
      sort_order: 0,
      source_url: null,
      storage_path: "external-projects/exocorpse/about/cms-preview.svg",
      updated_at: "2026-07-18T04:41:23.609784Z",
    });

    expect(asset.preview_url).toBe(
      "/api/admin/cms/assets/asset-id?v=20260718044123609784&width=1600&height=1600&resize=cover&quality=82",
    );
  });
});
