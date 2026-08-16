"use client";

import { isJsonRecord } from "@/components/admin/cms-management/editor-utils";
import CmsCardQuickActions from "@/components/admin/cms-management/CmsCardQuickActions";
import { cmsEntryPublicPath } from "@/components/admin/cms-management/cms-entry-public-url";
import type {
  ExocorpseCmsEntry,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";
import { useMemo, useState } from "react";
import { Input } from "@tuturuuu/ui/input";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import SortableList, {
  mergeVisibleOrder,
} from "@/components/admin/SortableList";

function profileValue(entry: ExocorpseCmsEntry, key: string) {
  return isJsonRecord(entry.profile_data) ? entry.profile_data[key] : undefined;
}

export default function CmsCommissionEntryGallery({
  entries,
  kind,
  onCreate,
  onReorder,
  onSelect,
  studio,
}: {
  entries: ExocorpseCmsEntry[];
  kind: "addons" | "services";
  onCreate: () => void;
  onReorder: (entries: ExocorpseCmsEntry[]) => void;
  onSelect: (entryId: string) => void;
  studio: ExocorpseCmsStudio;
}) {
  const [query, setQuery] = useState("");
  const [addonFilter, setAddonFilter] = useState<
    "all" | "exclusive" | "shared"
  >("all");
  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const exclusive = profileValue(entry, "isExclusive") === true;
      const matchesKind =
        addonFilter === "all" ||
        (addonFilter === "exclusive" && exclusive) ||
        (addonFilter === "shared" && !exclusive);
      const matchesSearch =
        !normalized ||
        [entry.title, entry.subtitle, entry.summary]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return matchesKind && matchesSearch;
    });
  }, [addonFilter, entries, query]);

  const linkedServiceCount = (entryId: string) =>
    (studio.relations ?? []).filter(
      (relation) => relation.to_entry_id === entryId,
    ).length;
  const pictureCollection = studio.collections.find(
    (collection) => collection.slug === "commission-pictures",
  );
  const pictureServiceDefinition = (studio.relationDefinitions ?? []).find(
    (definition) =>
      definition.source_collection_id === pictureCollection?.id &&
      definition.key === "service",
  );
  const servicePictureAsset = (serviceId: string) => {
    const pictureIds = new Set(
      (studio.relations ?? [])
        .filter(
          (relation) =>
            relation.relation_definition_id === pictureServiceDefinition?.id &&
            relation.to_entry_id === serviceId,
        )
        .map((relation) => relation.from_entry_id),
    );
    return studio.assets
      .filter(
        (asset) =>
          asset.asset_type === "image" &&
          Boolean(asset.entry_id && pictureIds.has(asset.entry_id)),
      )
      .sort((left, right) => left.sort_order - right.sort_order)[0];
  };

  return (
    <div className="space-y-6">
      {kind === "addons" ? (
        <>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Input
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search add-ons..."
              type="search"
              value={query}
            />
            <select
              className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              onChange={(event) =>
                setAddonFilter(
                  event.target.value as "all" | "exclusive" | "shared",
                )
              }
              value={addonFilter}
            >
              <option value="all">All Add-ons</option>
              <option value="exclusive">Exclusive Only</option>
              <option value="shared">Shared Only</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Total Add-ons", entries.length],
              [
                "Exclusive Add-ons",
                entries.filter(
                  (entry) => profileValue(entry, "isExclusive") === true,
                ).length,
              ],
              [
                "Shared Add-ons",
                entries.filter(
                  (entry) => profileValue(entry, "isExclusive") !== true,
                ).length,
              ],
            ].map(([label, value]) => (
              <div
                className="rounded-lg border border-gray-300 p-4 dark:border-gray-600 dark:bg-gray-800"
                key={String(label)}
              >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {filteredEntries.length ? (
        <SortableList
          className={`grid sm:grid-cols-2 lg:grid-cols-3 ${kind === "addons" ? "gap-4" : "gap-6"}`}
          getId={(entry) => entry.id}
          items={filteredEntries}
          layout="grid"
          onReorder={(next) =>
            onReorder(mergeVisibleOrder(entries, next, (entry) => entry.id))
          }
        >
          {(entry) => {
            const exclusive = profileValue(entry, "isExclusive") === true;
            const percentage = profileValue(entry, "percentage") === true;
            const rawPrice = profileValue(
              entry,
              kind === "addons" ? "priceImpact" : "basePrice",
            );
            const price = typeof rawPrice === "number" ? rawPrice : 0;
            const active = profileValue(entry, "isActive") !== false;
            const picture =
              kind === "services" ? servicePictureAsset(entry.id) : undefined;
            const pictureUrl = picture?.preview_url ?? picture?.asset_url;
            return (
              <article
                aria-label={`Edit ${entry.title}`}
                className={
                  kind === "addons"
                    ? "group relative cursor-pointer rounded-lg border border-gray-300 bg-white p-4 transition hover:border-cyan-300/60 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none dark:border-gray-600 dark:bg-gray-800"
                    : "group relative cursor-pointer rounded-lg border border-gray-300 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-cyan-300/60 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none dark:border-gray-600 dark:bg-gray-800"
                }
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
                  path={
                    kind === "services"
                      ? cmsEntryPublicPath("commission-services", entry)
                      : undefined
                  }
                />
                {kind === "services" ? (
                  <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-slate-100 dark:bg-slate-950">
                    {pictureUrl ? (
                      <Image
                        alt={picture?.alt_text ?? `${entry.title} example`}
                        className="object-cover transition duration-200 group-hover:scale-[1.02]"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        src={pictureUrl}
                        unoptimized
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-slate-400">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                ) : null}
                <div className={kind === "services" ? "p-4" : ""}>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {entry.title}
                    </h3>
                    {kind === "addons" && exclusive ? (
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Exclusive
                      </span>
                    ) : kind === "services" ? (
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          active
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {active ? "Active" : "Inactive"}
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={
                      kind === "addons"
                        ? "text-lg font-bold text-blue-600 dark:text-blue-400"
                        : "mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    }
                  >
                    {kind === "addons" ? "+" : "$"}
                    {price.toFixed(2)}
                    {kind === "addons" ? (percentage ? "%" : "€") : ""}
                  </p>
                  {(entry.summary ?? entry.subtitle) ? (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {entry.summary ?? entry.subtitle}
                    </p>
                  ) : null}
                  {kind === "addons" && linkedServiceCount(entry.id) ? (
                    <p className="mt-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Linked to {linkedServiceCount(entry.id)} service
                      {linkedServiceCount(entry.id) === 1 ? "" : "s"}
                    </p>
                  ) : null}
                </div>
              </article>
            );
          }}
        </SortableList>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
          <p className="text-gray-500 dark:text-gray-400">
            {kind === "addons"
              ? "No add-ons match your filters"
              : "No services yet. Create your first commission service!"}
          </p>
          {!entries.length ? (
            <button
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              onClick={onCreate}
              type="button"
            >
              Create {kind === "addons" ? "Add-on" : "Service"}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
