type LoadingEntry = {
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
