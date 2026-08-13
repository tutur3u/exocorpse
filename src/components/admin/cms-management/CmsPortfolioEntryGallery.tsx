"use client";

import { shouldBypassImageOptimization } from "@/components/admin/cms-management/editor-utils";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsCollection,
  ExocorpseCmsEntry,
} from "@/types/exocorpse-cms";
import { FilePenLine, Gamepad2, ImageIcon, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

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
  onDelete,
  onSelect,
}: {
  assets: ExocorpseCmsAsset[];
  collection: ExocorpseCmsCollection;
  entries: ExocorpseCmsEntry[];
  onCreate: () => void;
  onDelete: (entry: ExocorpseCmsEntry) => void;
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
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {sectionCopy.title}
        </h2>
        <button
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          onClick={onCreate}
          type="button"
        >
          <Plus className="h-4 w-4" /> {sectionCopy.action}
        </button>
      </div>

      {!entries.length ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 py-12 text-center dark:border-gray-600">
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
        <div className="space-y-4">
          {entries.map((entry) => {
            const asset = assetFor(entry.id);
            const imageUrl = asset?.preview_url ?? asset?.asset_url;
            return (
              <article
                className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
                key={entry.id}
              >
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
                    <div className="mt-4 flex gap-2">
                      <button
                        className="rounded-md bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                        onClick={() => onSelect(entry.id)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                        onClick={() => onDelete(entry)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => {
            const asset = assetFor(entry.id);
            const imageUrl = asset?.preview_url ?? asset?.asset_url;
            const isArt = collection.slug === "portfolio-art";
            return (
              <article
                className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                key={entry.id}
              >
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
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {entry.title}
                  </h3>
                  {(entry.summary ?? entry.subtitle) ? (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {entry.summary ?? entry.subtitle}
                    </p>
                  ) : null}
                  <div className="mt-auto flex gap-2 pt-4">
                    <button
                      className="flex-1 rounded-md bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                      onClick={() => onSelect(entry.id)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                      onClick={() => onDelete(entry)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
