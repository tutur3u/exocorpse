"use client";

import CmsEntryCard from "@/components/admin/cms-management/CmsEntryCard";
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
  onCreate: (profileData?: Record<string, ExocorpseJson>) => void;
  onDelete: (entry: ExocorpseCmsEntry) => void;
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

  if (CONNECTION_COLLECTION_SLUGS.has(collection.slug)) {
    return (
      <CmsConnectionEntryGallery
        assets={assets}
        collection={collection}
        entries={entries}
        initialCharacterId={initialRelationTargetId}
        onCreate={() => onCreate()}
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
        <div className="relative overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-5 shadow-sm dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.09),transparent_32%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.07),transparent_26%),linear-gradient(180deg,rgba(8,12,22,0.98),rgba(5,8,15,0.98))]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-cyan-300/15 via-cyan-300/70 to-fuchsia-300/45" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-slate-950 dark:text-[#fff6e8]">
                <SlidersHorizontal className="h-4 w-4 text-cyan-500" />
                Find characters
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Narrow the list by story and world.
              </p>
            </div>
            <span className="rounded-full border border-slate-200/80 bg-white/60 px-3 py-1.5 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-400">
              {filteredEntries.length} shown
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="mb-2 block">Story</span>
              <select
                className="h-11 w-full rounded-md border border-slate-300 bg-white/80 px-3 text-sm text-slate-900 shadow-inner outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
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
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="mb-2 block">World</span>
              <select
                className="h-11 w-full rounded-md border border-slate-300 bg-white/80 px-3 text-sm text-slate-900 shadow-inner outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
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
        </div>
      ) : relationFilter ? (
        <div className="relative overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-5 shadow-sm dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.09),transparent_32%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.07),transparent_26%),linear-gradient(180deg,rgba(8,12,22,0.98),rgba(5,8,15,0.98))]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-cyan-300/15 via-cyan-300/70 to-fuchsia-300/45" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-slate-950 dark:text-[#fff6e8]">
                <SlidersHorizontal className="h-4 w-4 text-cyan-500" />
                Find {collection.title.toLowerCase()}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Choose a {relationFilter.label.toLowerCase()} to narrow the
                list.
              </p>
            </div>
            <span className="rounded-full border border-slate-200/80 bg-white/60 px-3 py-1.5 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-400">
              {filteredEntries.length} shown
            </span>
          </div>
          <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">
            <span className="sr-only">Filter by {relationFilter.label}</span>
            <select
              className="h-11 w-full rounded-md border border-slate-300 bg-white/80 px-3 text-sm text-slate-900 shadow-inner outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
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
        </div>
      ) : null}

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
              collection.slug === "factions"
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
