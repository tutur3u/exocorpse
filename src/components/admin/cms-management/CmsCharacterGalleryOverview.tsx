"use client";

import {
  isJsonRecord,
  shouldBypassImageOptimization,
} from "@/components/admin/cms-management/editor-utils";
import type { ExocorpseCmsStudio } from "@/types/exocorpse-cms";
import { Button } from "@tuturuuu/ui/button";
import { ImageIcon, Plus } from "lucide-react";
import Image from "next/image";

export default function CmsCharacterGalleryOverview({
  characterId,
  onManage,
  studio,
}: {
  characterId: string;
  onManage: () => void;
  studio: ExocorpseCmsStudio;
}) {
  if (!characterId) {
    return (
      <section className="rounded-xl border-2 border-dashed border-zinc-300 px-6 py-14 text-center dark:border-zinc-700">
        <ImageIcon className="mx-auto h-10 w-10 text-zinc-400" />
        <p className="mt-3 font-semibold text-zinc-800 dark:text-zinc-200">
          Save the character first
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          The gallery will be available as soon as this character has been
          created.
        </p>
      </section>
    );
  }
  const galleryCollection = studio.collections.find(
    (collection) => collection.slug === "character-gallery",
  );
  const relationDefinition = (studio.relationDefinitions ?? []).find(
    (definition) =>
      definition.source_collection_id === galleryCollection?.id &&
      definition.key === "character",
  );
  const relatedEntryIds = new Set(
    (studio.relations ?? [])
      .filter(
        (relation) =>
          relation.relation_definition_id === relationDefinition?.id &&
          relation.to_entry_id === characterId,
      )
      .map((relation) => relation.from_entry_id),
  );
  const entries = studio.entries
    .filter(
      (entry) =>
        entry.collection_id === galleryCollection?.id &&
        relatedEntryIds.has(entry.id),
    )
    .sort(
      (left, right) =>
        left.sort_order - right.sort_order ||
        left.title.localeCompare(right.title),
    );
  const assetsByEntry = new Map(
    entries.map((entry) => [
      entry.id,
      studio.assets
        .filter((asset) => asset.entry_id === entry.id)
        .sort((left, right) => left.sort_order - right.sort_order),
    ]),
  );

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-950 dark:text-white">
            <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Character Gallery ({entries.length})
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Artwork connected to this character, in its public display order.
          </p>
        </div>
        <Button onClick={onManage} type="button">
          <Plus className="h-4 w-4" />
          Add or arrange artwork
        </Button>
      </div>

      {entries.length ? (
        <div className="grid gap-4 @xl:grid-cols-2 @3xl:grid-cols-3">
          {entries.map((entry) => {
            const asset = assetsByEntry.get(entry.id)?.[0];
            const imageUrl = asset?.preview_url ?? asset?.asset_url;
            const profile = isJsonRecord(entry.profile_data)
              ? entry.profile_data
              : {};
            return (
              <button
                className="group overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 text-left transition hover:border-blue-400 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                key={entry.id}
                onClick={onManage}
                type="button"
              >
                <div className="relative aspect-square bg-zinc-200 dark:bg-zinc-950">
                  {asset?.asset_type === "image" && imageUrl ? (
                    <Image
                      alt={asset.alt_text ?? entry.title}
                      className="object-cover transition duration-200 group-hover:scale-[1.02]"
                      fill
                      sizes="(max-width: 768px) 100vw, 320px"
                      src={imageUrl}
                      unoptimized={shouldBypassImageOptimization(asset)}
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-zinc-400">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                  {profile.sensitiveContent === true ? (
                    <span className="absolute top-2 left-2 rounded-full bg-zinc-950/85 px-2 py-1 text-[10px] font-semibold text-white">
                      Spoiler
                    </span>
                  ) : null}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                    {entry.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Open gallery manager to edit
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <button
          className="grid w-full place-items-center rounded-xl border-2 border-dashed border-zinc-300 px-6 py-14 text-center transition hover:border-blue-400 hover:bg-blue-50/50 dark:border-zinc-700 dark:hover:bg-blue-950/20"
          onClick={onManage}
          type="button"
        >
          <ImageIcon className="h-10 w-10 text-zinc-400" />
          <span className="mt-3 font-semibold text-zinc-800 dark:text-zinc-200">
            No gallery artwork yet
          </span>
          <span className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Add the first image for this character.
          </span>
        </button>
      )}
    </section>
  );
}
