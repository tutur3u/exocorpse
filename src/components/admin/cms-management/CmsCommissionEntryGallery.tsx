"use client";

import { isJsonRecord } from "@/components/admin/cms-management/editor-utils";
import type {
  ExocorpseCmsEntry,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";
import { useMemo, useState } from "react";
import { Input } from "@tuturuuu/ui/input";
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
  onDelete,
  onReorder,
  onSelect,
  studio,
}: {
  entries: ExocorpseCmsEntry[];
  kind: "addons" | "services";
  onCreate: () => void;
  onDelete: (entry: ExocorpseCmsEntry) => void;
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
            return (
              <article
                className={
                  kind === "addons"
                    ? "rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800"
                    : "group rounded-lg border border-gray-300 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-gray-600 dark:bg-gray-800"
                }
                key={entry.id}
              >
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
                <div
                  className={`flex gap-2 ${
                    kind === "services"
                      ? "border-t border-gray-200 p-4 dark:border-gray-700"
                      : "mt-4"
                  }`}
                >
                  <button
                    className="flex-1 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                    onClick={() => onSelect(entry.id)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="flex-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    onClick={() => onDelete(entry)}
                    type="button"
                  >
                    Delete
                  </button>
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
