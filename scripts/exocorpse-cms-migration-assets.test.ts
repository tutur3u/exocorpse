import { describe, expect, it } from "bun:test";
import {
  chunkManagedAssetIds,
  MANAGED_ASSET_IMPORT_JOB_LIMIT,
} from "./exocorpse-cms-migration-assets";

describe("Exocorpse managed asset migration batches", () => {
  it("keeps import job reports below the protected JSON field limit", () => {
    const assetIds = Array.from(
      { length: 217 },
      (_, index) => `asset-${index}`,
    );
    const chunks = chunkManagedAssetIds(assetIds);

    expect(MANAGED_ASSET_IMPORT_JOB_LIMIT).toBe(75);
    expect(chunks.map((chunk) => chunk.length)).toEqual([75, 75, 67]);
    expect(chunks.flat()).toEqual(assetIds);
  });

  it("does not create empty jobs", () => {
    expect(chunkManagedAssetIds([])).toEqual([]);
  });
});
