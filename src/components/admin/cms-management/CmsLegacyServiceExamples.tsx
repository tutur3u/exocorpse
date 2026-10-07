"use client";

import Image from "next/image";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import { isJsonRecord } from "./editor-utils";
import type {
  ExocorpseCmsEntry,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";

export default function CmsLegacyServiceExamples({
  studio,
  serviceId,
  onCreate,
  onEdit,
  onDelete,
}: {
  studio: ExocorpseCmsStudio;
  serviceId: string;
  onCreate: (slug: string, parentId: string, relationKey: string) => void;
  onEdit: (slug: string, id: string) => void;
  onDelete: (id: string) => void;
}) {
  const collection = (slug: string) =>
    studio.collections.find((item) => item.slug === slug);
  const children = (slug: string, key: string, parent: string) => {
    const definition = studio.relationDefinitions?.find(
      (item) =>
        item.source_collection_id === collection(slug)?.id && item.key === key,
    );
    if (!definition) return [];
    const ids = new Set(
      studio.relations
        ?.filter(
          (item) =>
            item.relation_definition_id === definition.id &&
            item.to_entry_id === parent,
        )
        .map((item) => item.from_entry_id),
    );
    return studio.entries
      .filter((item) => ids.has(item.id))
      .sort((a, b) => a.sort_order - b.sort_order);
  };
  const pictureStyle = studio.relationDefinitions?.find(
    (item) =>
      item.source_collection_id === collection("commission-pictures")?.id &&
      item.key === "style",
  );
  const styles = children("commission-styles", "service", serviceId);
  const pictures = children("commission-pictures", "service", serviceId).filter(
    (item) =>
      !studio.relations?.some(
        (relation) =>
          relation.from_entry_id === item.id &&
          relation.relation_definition_id === pictureStyle?.id,
      ),
  );
  const pictureGrid = (items: ExocorpseCmsEntry[]) => (
    <div className="grid grid-cols-3 gap-3">
      {items.map((entry) => {
        const asset = studio.assets.find(
          (item) => item.entry_id === entry.id && item.asset_type === "image",
        );
        const url = asset?.preview_url ?? asset?.asset_url;
        const profile = isJsonRecord(entry.profile_data)
          ? entry.profile_data
          : {};
        return (
          <div
            className="group relative aspect-square overflow-hidden rounded-md border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-700"
            key={entry.id}
          >
            {url ? (
              <Image
                alt={
                  typeof profile.caption === "string"
                    ? profile.caption
                    : entry.title
                }
                className="object-cover"
                fill
                sizes="(max-width: 768px) 33vw, 20vw"
                src={url}
                unoptimized
              />
            ) : null}
            {profile.isPrimaryExample === true ? (
              <span className="absolute top-1 left-1 rounded bg-yellow-400 px-1 py-0.5 text-xs font-medium text-yellow-900">
                Primary
              </span>
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center gap-2 transition-all hover:bg-black/60">
              <button
                className="rounded bg-white px-2 py-1 text-xs text-gray-900 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
                onClick={() => onEdit("commission-pictures", entry.id)}
                type="button"
              >
                Edit
              </button>
              <button
                className="rounded bg-red-600 px-2 py-1 text-xs text-white opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
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
  );
  return (
    <div className="space-y-6">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Service Examples</h3>
          <button
            className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            onClick={() =>
              onCreate("commission-pictures", serviceId, "service")
            }
            type="button"
          >
            + Upload Picture
          </button>
        </div>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          General examples for this service (not tied to a specific style)
        </p>
        {pictures.length ? (
          pictureGrid(pictures)
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No service-level pictures yet
          </p>
        )}
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Styles</h3>
          <button
            className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            onClick={() => onCreate("commission-styles", serviceId, "service")}
            type="button"
          >
            + Add Style
          </button>
        </div>
        {!styles.length ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No styles added yet
          </p>
        ) : (
          <div className="space-y-4">
            {styles.map((style) => {
              const description =
                studio.blocks
                  .filter(
                    (item) =>
                      item.entry_id === style.id &&
                      isJsonRecord(item.content) &&
                      typeof item.content.markdown === "string",
                  )
                  .map((item) =>
                    isJsonRecord(item.content) ? item.content.markdown : "",
                  )
                  .join("\n\n") || style.summary;
              const examples = children(
                "commission-pictures",
                "style",
                style.id,
              );
              return (
                <div
                  className="rounded-md border border-gray-200 p-4 dark:border-gray-700"
                  key={style.id}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">{style.title}</h4>
                      {description ? (
                        <MarkdownRenderer
                          className="mt-1 text-sm text-gray-600 dark:text-gray-400"
                          content={description}
                        />
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => onEdit("commission-styles", style.id)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                        onClick={() => onDelete(style.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Example Pictures
                      </p>
                      <button
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        onClick={() =>
                          onCreate("commission-pictures", style.id, "style")
                        }
                        type="button"
                      >
                        + Upload
                      </button>
                    </div>
                    {examples.length ? (
                      pictureGrid(examples)
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        No pictures yet
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
