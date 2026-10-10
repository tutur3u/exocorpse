"use client";

import type { ExocorpseCmsStudio } from "@/types/exocorpse-cms";
import { collectionItemLabel } from "./collection-copy";
import Image from "next/image";

export default function CmsRelatedEntriesPanel({
  studio,
  parentId,
  collectionSlug,
  relationKey,
  onCreate,
  onEdit,
  onDelete,
  pending,
}: {
  studio: ExocorpseCmsStudio;
  parentId: string;
  collectionSlug: string;
  relationKey: string;
  onCreate: (
    collectionSlug: string,
    parentId: string,
    relationKey: string,
  ) => void;
  onEdit: (collectionSlug: string, entryId: string) => void;
  onDelete: (entryId: string) => void;
  pending: boolean;
}) {
  const collection = studio.collections.find(
    (item) => item.slug === collectionSlug,
  );
  if (!collection) return null;
  const definition = studio.relationDefinitions?.find(
    (item) =>
      item.source_collection_id === collection.id && item.key === relationKey,
  );
  const entryIds = new Set(
    studio.relations
      ?.filter(
        (item) =>
          item.relation_definition_id === definition?.id &&
          item.to_entry_id === parentId,
      )
      .map((item) => item.from_entry_id),
  );
  const entries = studio.entries
    .filter((item) => entryIds.has(item.id))
    .sort((a, b) => a.sort_order - b.sort_order);
  const itemLabel = collectionItemLabel(collection);
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{collection.title}</h3>
        <button
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={!parentId || pending}
          onClick={() => onCreate(collectionSlug, parentId, relationKey)}
          type="button"
        >
          + Add {itemLabel}
        </button>
      </div>
      {!parentId ? (
        <p className="text-sm text-gray-500">
          Save this item first before adding {collection.title.toLowerCase()}.
        </p>
      ) : entries.length ? (
        <div className="grid gap-4 @xl:grid-cols-2">
          {entries.map((entry) => {
            const asset = studio.assets.find(
              (item) =>
                item.entry_id === entry.id && item.asset_type === "image",
            );
            const url = asset?.preview_url ?? asset?.asset_url;
            return (
              <div
                className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                key={entry.id}
              >
                {url ? (
                  <div className="relative h-40">
                    <Image
                      alt={asset?.alt_text ?? entry.title}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      src={url}
                      unoptimized
                    />
                  </div>
                ) : null}
                <div className="space-y-2 p-4">
                  <h4 className="font-medium">{entry.title}</h4>
                  {entry.summary ? (
                    <p className="text-sm text-gray-500">{entry.summary}</p>
                  ) : null}
                  <button
                    className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                    disabled={pending}
                    onClick={() => onEdit(collectionSlug, entry.id)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="ml-2 rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
                    disabled={pending}
                    onClick={() => onDelete(entry.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500 dark:bg-gray-900/50">
          No {collection.title.toLowerCase()} yet.
        </p>
      )}
    </section>
  );
}
