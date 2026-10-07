"use client";

import Image from "next/image";
import { Pencil, Trash2, UserRound, UsersRound } from "lucide-react";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import { connectionPresentation } from "./connection-entry-utils";
import { isJsonRecord, shouldBypassImageOptimization } from "./editor-utils";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsCollection,
  ExocorpseCmsEntry,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";

export default function CmsConnectionEntryGallery({
  assets,
  collection,
  entries,
  initialCharacterId,
  onCreate,
  onSelect,
  onDelete,
  studio,
}: {
  assets: ExocorpseCmsAsset[];
  collection: ExocorpseCmsCollection;
  entries: ExocorpseCmsEntry[];
  initialCharacterId?: string;
  onCreate: () => void;
  onReorder: (entries: ExocorpseCmsEntry[]) => void;
  onSelect: (entryId: string) => void;
  onDelete: (entryId: string) => void;
  studio: ExocorpseCmsStudio;
}) {
  const relationship = collection.slug === "character-relationships";
  const rows = entries
    .map((entry) => ({
      entry,
      view: connectionPresentation(collection.slug, entry, studio),
    }))
    .filter(
      ({ view }) =>
        !initialCharacterId || view.targetIds.includes(initialCharacterId),
    );
  return (
    <section className="space-y-3">
      <button
        className="mb-4 w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-purple-400 hover:text-purple-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-purple-500 dark:hover:text-purple-400"
        onClick={onCreate}
        type="button"
      >
        + Add {relationship ? "Relationship" : "Member"}
      </button>
      {!rows.length ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 py-12 text-center dark:border-gray-600">
          <UsersRound className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No {relationship ? "relationships" : "memberships"} yet
          </p>
        </div>
      ) : (
        rows.map(({ entry, view }) => {
          const other = relationship
            ? view.characterA?.id === initialCharacterId
              ? view.characterB
              : view.characterA
            : view.characterA;
          const asset = assets
            .filter(
              (item) =>
                item.entry_id === other?.id && item.asset_type === "image",
            )
            .sort((a, b) => a.sort_order - b.sort_order)[0];
          const url = asset?.preview_url ?? asset?.asset_url;
          const profile = isJsonRecord(entry.profile_data)
            ? entry.profile_data
            : {};
          const typeProfile = isJsonRecord(view.type?.profile_data)
            ? view.type.profile_data
            : {};
          const label =
            relationship &&
            view.characterB?.id === initialCharacterId &&
            typeof typeProfile.reverseName === "string"
              ? typeProfile.reverseName
              : view.secondary;
          return (
            <article
              className="group relative rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              key={entry.id}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  {url && asset ? (
                    <Image
                      alt={other?.title ?? "Character"}
                      className="object-cover"
                      fill
                      sizes="48px"
                      src={url}
                      unoptimized={shouldBypassImageOptimization(asset)}
                    />
                  ) : (
                    <UserRound className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-medium text-gray-900 dark:text-gray-100">
                    {other?.title ?? view.primary}
                  </h4>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium">
                      {label}
                    </span>
                    {typeProfile.isMutual === true ? (
                      <span className="text-xs text-gray-500">(mutual)</span>
                    ) : null}
                  </div>
                  {!relationship ? (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {[profile.role, profile.rank]
                        .filter((value) => typeof value === "string" && value)
                        .join(" · ")}
                    </p>
                  ) : null}
                  {entry.summary ? (
                    <MarkdownRenderer
                      className="mt-2 text-sm text-gray-600 dark:text-gray-400"
                      content={entry.summary}
                    />
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                  <button
                    aria-label="Edit relationship"
                    className="rounded p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    onClick={() => onSelect(entry.id)}
                    type="button"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="Delete relationship"
                    className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    onClick={() => onDelete(entry.id)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}
