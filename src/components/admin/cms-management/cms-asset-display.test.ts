import { describe, expect, test } from "bun:test";
import type { ExocorpseCmsAsset } from "@/types/exocorpse-cms";
import {
  cmsAssetTypeLabel,
  isVisualCmsAsset,
  partitionCmsAssets,
} from "./cms-asset-display";

function asset(
  id: string,
  assetType: string,
  sortOrder: number,
): ExocorpseCmsAsset {
  return {
    alt_text: null,
    asset_type: assetType,
    asset_url: `/asset/${id}`,
    entry_id: "entry-id",
    id,
    metadata: {},
    preview_url: null,
    sort_order: sortOrder,
    source_url: null,
    storage_path: `external-projects/exocorpse/${id}`,
    updated_at: "2026-08-15T00:00:00.000Z",
  };
}

describe("CMS asset display", () => {
  test("keeps inline images separate from linked gallery media", () => {
    const linked = asset("linked", "image", 0);
    const inline = asset("inline", "inline-image", 1);
    const document = asset("document", "document", 2);

    expect(partitionCmsAssets([linked, inline, document])).toEqual({
      inline: [inline],
      linked: [linked, document],
    });
  });

  test("renders inline images visually and gives assets friendly badges", () => {
    const inline = asset("inline", "inline-image", 0);
    expect(isVisualCmsAsset(inline)).toBe(true);
    expect(cmsAssetTypeLabel(inline)).toBe("Inline image");
    expect(cmsAssetTypeLabel(asset("linked", "image", 1))).toBe("Linked image");
  });
});
