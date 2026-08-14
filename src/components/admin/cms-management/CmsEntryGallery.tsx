"use client";

import CmsEntryCard from "@/components/admin/cms-management/CmsEntryCard";
import SortableList, {
  mergeVisibleOrder,
} from "@/components/admin/SortableList";
import CmsBlogEntryGallery from "@/components/admin/cms-management/CmsBlogEntryGallery";
import CmsAboutEntryGallery from "@/components/admin/cms-management/CmsAboutEntryGallery";
import CmsCommissionEntryGallery from "@/components/admin/cms-management/CmsCommissionEntryGallery";
import CmsPortfolioEntryGallery from "@/components/admin/cms-management/CmsPortfolioEntryGallery";
import type { AdminCmsTheme } from "@/components/admin/cms-management/admin-theme";
import { collectionItemLabel } from "@/components/admin/cms-management/collection-copy";
import {
  type CmsEntryGalleryFilter,
  selectCmsEntryCardMedia,
  usesStoryAndWorldFilters,
} from "@/components/admin/cms-management/gallery-utils";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsCollection,
  ExocorpseCmsEntry,
  ExocorpseCmsStudio,
  ExocorpseJson,
} from "@/types/exocorpse-cms";
import type { AdminCmsSectionKey } from "@/lib/admin-cms-sections";
import { FilePlus2 } from "lucide-react";
import { useMemo, useState } from "react";

export default function CmsEntryGallery({
  aboutTab,
  assets,
  collection,
  entries,
  initialRelationTargetId,
  relationFilter,
  onCreate,
  onDelete,
  onOpenCollection,
  onReorder,
  onSelect,
  sectionKey,
  studio,
  supportsImages,
  theme,
}: {
  aboutTab?: "about" | "dni" | "faq" | "profile" | "socials";
  assets: ExocorpseCmsAsset[];
  collection: ExocorpseCmsCollection;
  entries: ExocorpseCmsEntry[];
  initialRelationTargetId?: string;
  relationFilter?: CmsEntryGalleryFilter;
  onCreate: (profileData?: Record<string, ExocorpseJson>) => void;
  onDelete: (entry: ExocorpseCmsEntry) => void;
  onOpenCollection: (slug: string) => void;
  onReorder: (entries: ExocorpseCmsEntry[]) => void;
  onSelect: (entryId: string) => void;
  sectionKey: AdminCmsSectionKey;
  studio: ExocorpseCmsStudio;
  supportsImages: boolean;
  theme: AdminCmsTheme;
}) {
  const [relationTargetId, setRelationTargetId] = useState(
    initialRelationTargetId ?? "all",
  );
  const [storyTargetId, setStoryTargetId] = useState("all");
  const itemLabel = collectionItemLabel(collection);
  const worldsCollection = studio.collections.find(
    (item) => item.slug === "worlds",
  );
  const storiesCollection = studio.collections.find(
    (item) => item.slug === "stories",
  );
  const worldStoryDefinition = (studio.relationDefinitions ?? []).find(
    (definition) =>
      definition.source_collection_id === worldsCollection?.id &&
      definition.key === "story",
  );
  const worldStoryIds = useMemo(
    () =>
      new Map<string, string>(
        (studio.relations ?? [])
          .filter(
            (relation) =>
              relation.relation_definition_id === worldStoryDefinition?.id,
          )
          .map((relation) => [relation.from_entry_id, relation.to_entry_id]),
      ),
    [studio.relations, worldStoryDefinition?.id],
  );
  const storyOptions = studio.entries
    .filter((entry) => entry.collection_id === storiesCollection?.id)
    .sort((left, right) => left.title.localeCompare(right.title));
  const availableRelationOptions =
    storyTargetId === "all"
      ? (relationFilter?.options ?? [])
      : (relationFilter?.options ?? []).filter(
          (option) => worldStoryIds.get(option.id) === storyTargetId,
        );
  const filteredEntries = useMemo(() => {
    return entries
      .filter(
        (entry) =>
          relationTargetId === "all" ||
          relationFilter?.entryTargetIds[entry.id]?.includes(relationTargetId),
      )
      .filter(
        (entry) =>
          storyTargetId === "all" ||
          relationFilter?.entryTargetIds[entry.id]?.some(
            (worldId) => worldStoryIds.get(worldId) === storyTargetId,
          ),
      )
      .sort((left, right) => {
        if (left.sort_order !== right.sort_order) {
          return left.sort_order - right.sort_order;
        }
        return left.title.localeCompare(right.title);
      });
  }, [entries, relationFilter, relationTargetId, storyTargetId, worldStoryIds]);

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

  if (sectionKey === "blog-posts") {
    return (
      <CmsBlogEntryGallery
        assets={assets}
        entries={entries}
        onDelete={onDelete}
        onSelect={onSelect}
      />
    );
  }

  if (sectionKey === "about") {
    return (
      <CmsAboutEntryGallery
        aboutTab={aboutTab}
        collection={collection}
        entries={entries}
        onCreate={onCreate}
        onDelete={onDelete}
        onSelect={onSelect}
      />
    );
  }

  if (sectionKey === "portfolio") {
    return (
      <CmsPortfolioEntryGallery
        assets={assets}
        collection={collection}
        entries={entries}
        onCreate={onCreate}
        onDelete={onDelete}
        onReorder={onReorder}
        onSelect={onSelect}
      />
    );
  }

  if (
    collection.slug === "commission-addons" ||
    collection.slug === "commission-services"
  ) {
    return (
      <CmsCommissionEntryGallery
        entries={entries}
        kind={collection.slug === "commission-addons" ? "addons" : "services"}
        onCreate={onCreate}
        onDelete={onDelete}
        onReorder={onReorder}
        onSelect={onSelect}
        studio={studio}
      />
    );
  }

  return (
    <section className="space-y-5">
      {relationFilter &&
      usesStoryAndWorldFilters(collection.slug, sectionKey) ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
            <span className="mb-2 block">Select a Story</span>
            <select
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              onChange={(event) => {
                setStoryTargetId(event.target.value);
                setRelationTargetId("all");
              }}
              value={storyTargetId}
            >
              <option value="all">All Stories</option>
              {storyOptions.map((story) => (
                <option key={story.id} value={story.id}>
                  {story.title}
                </option>
              ))}
            </select>
          </label>
          <label className="rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
            <span className="mb-2 block">Select a World</span>
            <select
              className="w-full rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              disabled={storyTargetId === "all"}
              onChange={(event) => setRelationTargetId(event.target.value)}
              value={relationTargetId}
            >
              <option value="all">All Worlds</option>
              {availableRelationOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : relationFilter ? (
        <label className="block rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
          <span className="mb-2 block">
            Filter by {relationFilter.label}
            {sectionKey === "worlds" ? " (Optional)" : ""}
          </span>
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
        <SortableList
          className="grid items-start gap-6 @2xl:grid-cols-2 @5xl:grid-cols-3"
          getId={(entry) => entry.id}
          items={filteredEntries}
          layout="grid"
          onReorder={(next) =>
            onReorder(mergeVisibleOrder(entries, next, (entry) => entry.id))
          }
        >
          {(entry) => {
            const index = filteredEntries.findIndex(
              (item) => item.id === entry.id,
            );
            const media = mediaByEntry.get(entry.id);
            const secondaryActions =
              collection.slug === "characters"
                ? [
                    {
                      label: "Manage Gallery",
                      onClick: () => onOpenCollection("character-gallery"),
                      tone: "blue" as const,
                    },
                    {
                      label: "Manage Factions",
                      onClick: () => onOpenCollection("character-factions"),
                      tone: "purple" as const,
                    },
                    {
                      label: "Manage Relationships",
                      onClick: () =>
                        onOpenCollection("character-relationships"),
                      tone: "pink" as const,
                    },
                  ]
                : collection.slug === "factions"
                  ? [
                      {
                        label: "Manage Members",
                        onClick: () => onOpenCollection("character-factions"),
                        tone: "purple" as const,
                      },
                    ]
                  : collection.slug === "locations"
                    ? [
                        {
                          label: "Manage Gallery",
                          onClick: () => onOpenCollection("location-gallery"),
                          tone: "blue" as const,
                        },
                      ]
                    : [];
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
                secondaryActions={secondaryActions}
                supportsImages={supportsImages}
                theme={theme}
              />
            );
          }}
        </SortableList>
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
              onClick={() => onCreate()}
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
