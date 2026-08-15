"use client";

import { shouldBypassImageOptimization } from "@/components/admin/cms-management/editor-utils";
import CmsCardQuickActions from "@/components/admin/cms-management/CmsCardQuickActions";
import { cmsEntryPublicPath } from "@/components/admin/cms-management/cms-entry-public-url";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsCollection,
  ExocorpseCmsEntry,
} from "@/types/exocorpse-cms";
import { FilePenLine, Gamepad2, ImageIcon, Plus } from "lucide-react";
import Image from "next/image";
import SortableList from "@/components/admin/SortableList";

const copy = {
  "portfolio-art": {
    action: "Add Artwork",
    empty: "No artwork yet",
    title: "Art Portfolio",
  },
  "portfolio-games": {
    action: "Add Game",
    empty: "No games yet",
    title: "Game Portfolio",
  },
  "portfolio-writing": {
    action: "Add Writing",
    empty: "No writing yet",
    title: "Writing Portfolio",
  },
} as const;

export default function CmsPortfolioEntryGallery({
  assets,
  collection,
  entries,
  onCreate,
  onReorder,
  onSelect,
}: {
  assets: ExocorpseCmsAsset[];
  collection: ExocorpseCmsCollection;
  entries: ExocorpseCmsEntry[];
  onCreate: () => void;
  onReorder: (entries: ExocorpseCmsEntry[]) => void;
  onSelect: (entryId: string) => void;
}) {
  const sectionCopy =
    copy[collection.slug as keyof typeof copy] ?? copy["portfolio-art"];
  const assetFor = (entryId: string) =>
    assets
      .filter(
        (asset) => asset.entry_id === entryId && asset.asset_type === "image",
      )
      .sort((left, right) => left.sort_order - right.sort_order)[0];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-[#fff6e8]">
          {sectionCopy.title}
        </h2>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-cyan-500 hover:to-blue-500 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          onClick={onCreate}
          type="button"
        >
          <Plus className="h-4 w-4" /> {sectionCopy.action}
        </button>
      </div>

      {!entries.length ? (
        <div className="rounded-[1.35rem] border-2 border-dashed border-slate-300 bg-white/60 py-12 text-center dark:border-white/10 dark:bg-slate-950/40">
          {collection.slug === "portfolio-games" ? (
            <Gamepad2 className="mx-auto h-12 w-12 text-gray-400" />
          ) : collection.slug === "portfolio-writing" ? (
            <FilePenLine className="mx-auto h-12 w-12 text-gray-400" />
          ) : (
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          )}
          <p className="mt-2 text-sm text-gray-500">{sectionCopy.empty}</p>
          <button
            className="mt-4 text-sm text-blue-600 hover:text-blue-500"
            onClick={onCreate}
            type="button"
          >
            {sectionCopy.action
              .replace("Add ", "Add your first ")
              .toLowerCase()}
          </button>
        </div>
      ) : collection.slug === "portfolio-writing" ? (
        <SortableList
          className="space-y-4"
          getId={(entry) => entry.id}
          items={entries}
          onReorder={onReorder}
        >
          {(entry) => {
            const asset = assetFor(entry.id);
            const imageUrl = asset?.preview_url ?? asset?.asset_url;
            return (
              <article
                aria-label={`Edit ${entry.title}`}
                className="group relative cursor-pointer overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300/60 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none dark:border-white/10 dark:bg-[linear-gradient(145deg,rgba(10,18,32,0.96),rgba(14,8,24,0.96))]"
                key={entry.id}
                onClick={() => onSelect(entry.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(entry.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <CmsCardQuickActions
                  className="absolute top-3 left-3 z-20"
                  path={cmsEntryPublicPath(collection.slug, entry)}
                />
                <div className="flex items-start gap-4 p-4">
                  {asset && imageUrl ? (
                    <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-gray-700">
                      <Image
                        alt={asset.alt_text ?? entry.title}
                        className="object-cover"
                        fill
                        sizes="128px"
                        src={imageUrl}
                        unoptimized={shouldBypassImageOptimization(asset)}
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {entry.title}
                    </h3>
                    {(entry.summary ?? entry.subtitle) ? (
                      <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                        {entry.summary ?? entry.subtitle}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          }}
        </SortableList>
      ) : (
        <SortableList
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          getId={(entry) => entry.id}
          items={entries}
          layout="grid"
          onReorder={onReorder}
        >
          {(entry) => {
            const asset = assetFor(entry.id);
            const imageUrl = asset?.preview_url ?? asset?.asset_url;
            const isArt = collection.slug === "portfolio-art";
            return (
              <article
                aria-label={`Edit ${entry.title}`}
                className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300/60 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none dark:border-white/10 dark:bg-[linear-gradient(145deg,rgba(10,18,32,0.96),rgba(14,8,24,0.96))]"
                key={entry.id}
                onClick={() => onSelect(entry.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(entry.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <CmsCardQuickActions
                  className="absolute top-3 left-3 z-20"
                  path={cmsEntryPublicPath(collection.slug, entry)}
                />
                {isArt || (asset && imageUrl) ? (
                  <div
                    className={`relative overflow-hidden bg-gray-100 dark:bg-gray-700 ${isArt ? "aspect-square" : "aspect-video"}`}
                  >
                    {asset && imageUrl ? (
                      <Image
                        alt={asset.alt_text ?? entry.title}
                        className="object-cover transition-transform group-hover:scale-105"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        src={imageUrl}
                        unoptimized={shouldBypassImageOptimization(asset)}
                      />
                    ) : null}
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 text-sm leading-5 font-medium text-slate-950 dark:text-[#fff6e8]">
                    {entry.title}
                  </h3>
                  {(entry.summary ?? entry.subtitle) ? (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {entry.summary ?? entry.subtitle}
                    </p>
                  ) : null}
                </div>
              </article>
            );
          }}
        </SortableList>
      )}
    </section>
  );
}
