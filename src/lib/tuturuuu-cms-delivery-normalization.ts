type LoadingAsset = {
  altText?: string | null;
  alt_text?: string | null;
  assetId?: string | null;
  assetType?: string | null;
  asset_type?: string | null;
  id?: string | null;
  sortOrder?: number | null;
  sort_order?: number | null;
};

type LoadingEntry = {
  assets?: LoadingAsset[];
  entryId: string;
  stableSourceId?: string | null;
};

type LoadingCollection<TEntry extends LoadingEntry> = {
  entries: TEntry[];
};

export type DeliverySourceCollection = {
  entries: Array<{
    id: string;
    stable_source_id?: string | null;
  }>;
};

function normalizeLoadingAsset<TAsset extends LoadingAsset>(asset: TAsset) {
  return {
    ...asset,
    altText: asset.altText ?? asset.alt_text ?? null,
    assetId: asset.assetId ?? asset.id ?? "",
    assetType: asset.assetType ?? asset.asset_type ?? "",
    sortOrder: asset.sortOrder ?? asset.sort_order ?? 0,
  };
}

export function restoreLoadingEntryStableSourceIds<
  TEntry extends LoadingEntry,
  TCollection extends LoadingCollection<TEntry>,
  TLoadingData extends { collections: Record<string, TCollection> },
>(
  loadingData: TLoadingData,
  sourceCollections: DeliverySourceCollection[],
): TLoadingData {
  const stableSourceIdByEntryId = new Map(
    sourceCollections.flatMap((collection) =>
      collection.entries.map((entry) => [entry.id, entry.stable_source_id]),
    ),
  );

  return {
    ...loadingData,
    collections: Object.fromEntries(
      Object.entries(loadingData.collections).map(([slug, collection]) => [
        slug,
        {
          ...collection,
          entries: collection.entries.map((entry) => ({
            ...entry,
            assets: entry.assets?.map(normalizeLoadingAsset),
            stableSourceId:
              entry.stableSourceId ??
              stableSourceIdByEntryId.get(entry.entryId) ??
              null,
          })),
        },
      ]),
    ),
  } as TLoadingData;
}
