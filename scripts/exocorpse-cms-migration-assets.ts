export const MANAGED_ASSET_IMPORT_JOB_LIMIT = 75;

export function chunkManagedAssetIds(assetIds: string[]): string[][] {
  return Array.from(
    {
      length: Math.ceil(assetIds.length / MANAGED_ASSET_IMPORT_JOB_LIMIT),
    },
    (_, index) =>
      assetIds.slice(
        index * MANAGED_ASSET_IMPORT_JOB_LIMIT,
        (index + 1) * MANAGED_ASSET_IMPORT_JOB_LIMIT,
      ),
  );
}
