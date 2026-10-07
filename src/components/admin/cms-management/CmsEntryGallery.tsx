"use client";

import CmsRelationshipTypesGallery from "./CmsRelationshipTypesGallery";
import CmsEntryCard from "@/components/admin/cms-management/CmsEntryCard";
import { cmsEntryPublicPath } from "@/components/admin/cms-management/cms-entry-public-url";
import SortableList, {
  mergeVisibleOrder,
} from "@/components/admin/SortableList";
import CmsBlogEntryGallery from "@/components/admin/cms-management/CmsBlogEntryGallery";
import CmsAboutEntryGallery from "@/components/admin/cms-management/CmsAboutEntryGallery";
import CmsCommissionEntryGallery from "@/components/admin/cms-management/CmsCommissionEntryGallery";
import CmsConnectionEntryGallery from "@/components/admin/cms-management/CmsConnectionEntryGallery";
import { CONNECTION_COLLECTION_SLUGS } from "@/components/admin/cms-management/connection-entry-utils";
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
import { FilePlus2, SlidersHorizontal } from "lucide-react";
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
  onContextChange,
  onOpenCollection,
  onReorder,
  onSelect,
  onSetVisibility,
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
  onDelete: (entryId: string) => void;
  onContextChange?: (entryId: string | null, relationKey: string) => void;
  onCreate: (profileData?: Record<string, ExocorpseJson>) => void;
  onOpenCollection: (
    slug: string,
    targetId?: string,
    relationKey?: string,
  ) => void;
  onReorder: (entries: ExocorpseCmsEntry[]) => void;
  onSelect: (entryId: string) => void;
  onSetVisibility: (
    entryId: string,
    visibility: "draft" | "published" | "unlisted",
  ) => void;
  sectionKey: AdminCmsSectionKey;
  studio: ExocorpseCmsStudio;
  supportsImages: boolean;
  theme: AdminCmsTheme;
}) {
  const [relationTargetId, setRelationTargetId] = useState(
    initialRelationTargetId ?? "all",
  );
  const [worldFilters, setWorldFilters] = useState<string[]>([]);
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
      .filter(
        (entry) =>
          !worldFilters.length ||
          relationFilter?.entryTargetIds[entry.id]?.some((id) =>
            worldFilters.includes(id),
          ),
      )
      .sort((left, right) => {
        if (left.sort_order !== right.sort_order) {
          return left.sort_order - right.sort_order;
        }
        return left.title.localeCompare(right.title);
      });
  }, [
    entries,
    relationFilter,
    relationTargetId,
    storyTargetId,
    worldStoryIds,
    worldFilters,
  ]);

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

  if (collection.slug === "relationship-types")
    return (
      <CmsRelationshipTypesGallery
        entries={entries}
        onCreate={() => onCreate()}
        onSelect={onSelect}
        onDelete={onDelete}
      />
    );

  if (sectionKey === "blog-posts") {
    return (
      <CmsBlogEntryGallery
        onCreate={() => onCreate()}
        blocks={studio.blocks}
        assets={assets}
        entries={entries}
        onSelect={onSelect}
        onDelete={onDelete}
        onSetVisibility={onSetVisibility}
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
        onSelect={onSelect}
        onDelete={onDelete}
      />
    );
  }

  if (sectionKey === "portfolio") {
    return (
      <CmsPortfolioEntryGallery
        assets={assets}
        collection={collection}
        entries={entries}
        onCreate={() => onCreate()}
        onReorder={onReorder}
        onSelect={onSelect}
        onDelete={onDelete}
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
        onCreate={() => onCreate()}
        onReorder={onReorder}
        onSelect={onSelect}
        onDelete={onDelete}
        studio={studio}
      />
    );
  }

  if (CONNECTION_COLLECTION_SLUGS.has(collection.slug)) {
    return (
      <CmsConnectionEntryGallery
        assets={assets}
        collection={collection}
        entries={entries}
        initialCharacterId={initialRelationTargetId}
        onCreate={() => onCreate()}
        onReorder={onReorder}
        onSelect={onSelect}
        onDelete={onDelete}
        studio={studio}
      />
    );
  }

  return (
    <section className="space-y-5">
      {collection.slug === "characters" || collection.slug === "factions" ? (
        <>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {collection.slug === "factions"
                  ? "Select a Story"
                  : "Filter by Story (optional)"}
              </span>
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                onChange={(event) => {
                  setStoryTargetId(event.target.value);
                  setRelationTargetId("all");
                  setWorldFilters([]);
                  onContextChange?.(null, "world");
                }}
                value={storyTargetId}
              >
                <option value="all">
                  {collection.slug === "factions"
                    ? "-- Choose a story --"
                    : "All Stories"}
                </option>
                {storyOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {collection.slug === "factions" ? (
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Select a World
                </span>
                <select
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
                  disabled={storyTargetId === "all"}
                  onChange={(event) => {
                    setRelationTargetId(event.target.value);
                    onContextChange?.(
                      event.target.value === "all" ? null : event.target.value,
                      "world",
                    );
                  }}
                  value={relationTargetId}
                >
                  <option value="all">-- Choose a world --</option>
                  {availableRelationOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : storyTargetId !== "all" && availableRelationOptions.length ? (
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              <p className="mb-3 text-sm font-medium">
                Filter by Worlds (
                {worldFilters.length
                  ? `${worldFilters.length} selected`
                  : "All worlds"}
                )
              </p>
              <div className="flex flex-wrap gap-2">
                {availableRelationOptions.map((option) => (
                  <button
                    className={`rounded-full px-4 py-2 text-sm font-medium ${worldFilters.includes(option.id) ? "bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-md" : "border border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}
                    key={option.id}
                    onClick={() =>
                      setWorldFilters((ids) =>
                        ids.includes(option.id)
                          ? ids.filter((id) => id !== option.id)
                          : [...ids, option.id],
                      )
                    }
                    type="button"
                  >
                    {option.title}
                  </button>
                ))}
                {worldFilters.length ? (
                  <button
                    className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400"
                    onClick={() => setWorldFilters([])}
                    type="button"
                  >
                    Clear Filters
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      ) : relationFilter && !initialRelationTargetId ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by {relationFilter.label}
              {collection.slug === "worlds" ? " (Optional)" : ""}
            </span>
            <select
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              onChange={(event) => {
                setRelationTargetId(event.target.value);
                onContextChange?.(
                  event.target.value === "all" ? null : event.target.value,
                  collection.slug === "worlds"
                    ? "story"
                    : collection.slug === "locations"
                      ? "world"
                      : relationFilter.label.toLowerCase(),
                );
              }}
              value={relationTargetId}
            >
              <option value="all">All {collection.title}</option>
              {relationFilter.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
      {collection.slug === "factions" && relationTargetId === "all" ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-950">
          <h3 className="mb-2 text-lg font-semibold">
            Select a world to manage factions
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a story and world from the dropdowns above
          </p>
        </div>
      ) : (
        <>
          {filteredEntries.length ? (
            <SortableList
              className="grid items-stretch gap-6 @2xl:grid-cols-2 @5xl:grid-cols-3"
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
                          label: "Gallery",
                          onClick: () =>
                            onOpenCollection(
                              "character-gallery",
                              entry.id,
                              "character",
                            ),
                          tone: "pink" as const,
                        },
                        {
                          label: "Relationships",
                          onClick: () =>
                            onOpenCollection(
                              "character-relationships",
                              entry.id,
                              "character-a",
                            ),
                          tone: "purple" as const,
                        },
                      ]
                    : collection.slug === "factions"
                      ? [
                          {
                            label: "Manage Members",
                            onClick: () =>
                              onOpenCollection(
                                "character-factions",
                                entry.id,
                                "faction",
                              ),
                            tone: "purple" as const,
                          },
                        ]
                      : collection.slug === "locations"
                        ? [
                            {
                              label: "Manage Gallery",
                              onClick: () =>
                                onOpenCollection(
                                  "location-gallery",
                                  entry.id,
                                  "location",
                                ),
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
                    onEdit={() => onSelect(entry.id)}
                    onDelete={() => onDelete(entry.id)}
                    publicPath={cmsEntryPublicPath(
                      collection.slug,
                      entry,
                      studio,
                    )}
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
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {entries.length
                  ? "No matching items"
                  : `No ${collection.title.toLowerCase()} yet`}
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                {entries.length
                  ? `No ${collection.title.toLowerCase()} match this filter.`
                  : `Create your first ${itemLabel} to get started`}
              </p>
              {!entries.length ? (
                <button
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 ${theme.button}`}
                  onClick={() => onCreate()}
                  type="button"
                >
                  Create Your First{" "}
                  {itemLabel.replace(/^./, (letter) => letter.toUpperCase())}
                </button>
              ) : null}
            </div>
          )}
        </>
      )}
    </section>
  );
}
