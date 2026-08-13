"use client";

import CmsEntryCard from "@/components/admin/cms-management/CmsEntryCard";
import type { AdminCmsTheme } from "@/components/admin/cms-management/admin-theme";
import { collectionItemLabel } from "@/components/admin/cms-management/collection-copy";
import {
  type CmsEntryGalleryFilter,
  selectCmsEntryCardMedia,
} from "@/components/admin/cms-management/gallery-utils";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsCollection,
  ExocorpseCmsEntry,
} from "@/types/exocorpse-cms";
import { FilePlus2 } from "lucide-react";
import { useMemo, useState } from "react";

export default function CmsEntryGallery({
  assets,
  collection,
  entries,
  relationFilter,
  onCreate,
  onDelete,
  onSelect,
  supportsImages,
  theme,
}: {
  assets: ExocorpseCmsAsset[];
  collection: ExocorpseCmsCollection;
  entries: ExocorpseCmsEntry[];
  relationFilter?: CmsEntryGalleryFilter;
  onCreate: () => void;
  onDelete: (entry: ExocorpseCmsEntry) => void;
  onSelect: (entryId: string) => void;
  supportsImages: boolean;
  theme: AdminCmsTheme;
}) {
  const [relationTargetId, setRelationTargetId] = useState("all");
  const itemLabel = collectionItemLabel(collection);
  const filteredEntries = useMemo(() => {
    return entries
      .filter(
        (entry) =>
          relationTargetId === "all" ||
          relationFilter?.entryTargetIds[entry.id]?.includes(relationTargetId),
      )
      .sort((left, right) => {
        if (left.sort_order !== right.sort_order) {
          return left.sort_order - right.sort_order;
        }
        return left.title.localeCompare(right.title);
      });
  }, [entries, relationFilter, relationTargetId]);

  const mediaByEntry = useMemo(() => {
    const assetsByEntry = new Map<string, ExocorpseCmsAsset[]>();
    for (const asset of assets) {
      if (!asset.entry_id) continue;
      const entryAssets = assetsByEntry.get(asset.entry_id) ?? [];
      entryAssets.push(asset);
      assetsByEntry.set(asset.entry_id, entryAssets);
    }

    return new Map(
      entries.map((entry) => [
        entry.id,
        selectCmsEntryCardMedia(collection, assetsByEntry.get(entry.id) ?? []),
      ]),
    );
  }, [assets, collection, entries]);

  return (
    <section className="space-y-5">
      {relationFilter ? (
        <label className="block rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
          <span className="mb-2 block">Filter by {relationFilter.label}</span>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            onChange={(event) => setRelationTargetId(event.target.value)}
            value={relationTargetId}
          >
            <option value="all">All {collection.title.toLowerCase()}</option>
            {relationFilter.options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {filteredEntries.length ? (
        <div className="grid items-start gap-6 @2xl:grid-cols-2 @5xl:grid-cols-3">
          {filteredEntries.map((entry, index) => {
            const media = mediaByEntry.get(entry.id);
            return (
              <CmsEntryCard
                avatarAsset={media?.avatar}
                collection={collection}
                eager={index < 3}
                entry={entry}
                key={entry.id}
                onDelete={() => onDelete(entry)}
                onEdit={() => onSelect(entry.id)}
                previewAsset={media?.preview}
                supportsImages={supportsImages}
                theme={theme}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center dark:border-gray-800 dark:bg-gray-950">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${theme.emptyIcon}`}
          >
            <FilePlus2 className="h-8 w-8" />
          </div>
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            {entries.length ? "No matching items" : `No ${itemLabel} yet`}
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {entries.length
              ? `No ${collection.title.toLowerCase()} match this filter.`
              : `Add your first ${itemLabel} when you are ready.`}
          </p>
          {!entries.length ? (
            <button
              className={`mt-5 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 ${theme.button}`}
              onClick={onCreate}
              type="button"
            >
              <FilePlus2 className="h-4 w-4" />
              Add {itemLabel}
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
