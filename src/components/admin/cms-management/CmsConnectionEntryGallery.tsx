"use client";

import SortableList, {
  mergeVisibleOrder,
} from "@/components/admin/SortableList";
import {
  connectionPresentation,
  type CmsConnectionPresentation,
} from "@/components/admin/cms-management/connection-entry-utils";
import {
  isJsonRecord,
  shouldBypassImageOptimization,
} from "@/components/admin/cms-management/editor-utils";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsCollection,
  ExocorpseCmsEntry,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";
import { Button } from "@tuturuuu/ui/button";
import { Input } from "@tuturuuu/ui/input";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Pencil,
  Search,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

function avatarFor(
  entry: ExocorpseCmsEntry | undefined,
  assets: ExocorpseCmsAsset[],
) {
  if (!entry) return undefined;
  return assets
    .filter(
      (asset) => asset.entry_id === entry.id && asset.asset_type === "image",
    )
    .sort((left, right) => left.sort_order - right.sort_order)[0];
}

function Identity({
  asset,
  entry,
}: {
  asset?: ExocorpseCmsAsset;
  entry?: ExocorpseCmsEntry;
}) {
  const imageUrl = asset?.preview_url ?? asset?.asset_url;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800">
        {imageUrl && asset ? (
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="48px"
            src={imageUrl}
            unoptimized={shouldBypassImageOptimization(asset)}
          />
        ) : (
          <UserRound className="h-5 w-5" />
        )}
      </div>
      <span className="truncate font-semibold text-zinc-950 dark:text-zinc-50">
        {entry?.title ?? "Not selected"}
      </span>
    </div>
  );
}

function ConnectionCard({
  assets,
  collectionSlug,
  entry,
  onDelete,
  onEdit,
  presentation,
}: {
  assets: ExocorpseCmsAsset[];
  collectionSlug: string;
  entry: ExocorpseCmsEntry;
  onDelete: () => void;
  onEdit: () => void;
  presentation: CmsConnectionPresentation;
}) {
  const profile = isJsonRecord(entry.profile_data) ? entry.profile_data : {};
  const role = typeof profile.role === "string" ? profile.role : "";
  const rank = typeof profile.rank === "string" ? profile.rank : "";
  const joinDate = typeof profile.joinDate === "string" ? profile.joinDate : "";
  const description =
    entry.summary ?? (typeof profile.notes === "string" ? profile.notes : null);

  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600">
      <button
        aria-label={`Edit ${presentation.primary}`}
        className="w-full px-5 pt-5 pb-4 text-left"
        onClick={onEdit}
        type="button"
      >
        {collectionSlug === "character-relationships" ? (
          <>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 pt-10 sm:pt-2">
              <Identity
                asset={avatarFor(presentation.characterA, assets)}
                entry={presentation.characterA}
              />
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-300">
                <UsersRound className="h-4 w-4" />
              </div>
              <Identity
                asset={avatarFor(presentation.characterB, assets)}
                entry={presentation.characterB}
              />
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <span className="rounded-full bg-pink-100 px-2.5 py-1 text-xs font-semibold text-pink-800 dark:bg-pink-950 dark:text-pink-200">
                {presentation.secondary}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 pt-10 sm:pt-2">
              <Identity
                asset={avatarFor(presentation.characterA, assets)}
                entry={presentation.characterA}
              />
              <ArrowRight className="h-4 w-4 text-purple-400" />
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="truncate font-semibold text-zinc-950 dark:text-zinc-50">
                  {presentation.faction?.title ?? "Not selected"}
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${presentation.isCurrent ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}
              >
                {presentation.isCurrent ? "Current member" : "Former member"}
              </span>
              {role ? (
                <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800 dark:bg-purple-950 dark:text-purple-200">
                  {role}
                </span>
              ) : null}
              {rank ? (
                <span className="text-xs text-zinc-500">{rank}</span>
              ) : null}
              {joinDate ? (
                <span className="ml-auto inline-flex items-center gap-1 text-xs text-zinc-500">
                  <CalendarDays className="h-3.5 w-3.5" /> {joinDate}
                </span>
              ) : null}
            </div>
          </>
        )}
        {description ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
      </button>
      <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <Button onClick={onEdit} size="sm" type="button" variant="outline">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
        <Button
          aria-label={`Delete ${presentation.primary}`}
          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
          onClick={onDelete}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}

export default function CmsConnectionEntryGallery({
  assets,
  collection,
  entries,
  onCreate,
  onDelete,
  onReorder,
  onSelect,
  studio,
}: {
  assets: ExocorpseCmsAsset[];
  collection: ExocorpseCmsCollection;
  entries: ExocorpseCmsEntry[];
  onCreate: () => void;
  onDelete: (entry: ExocorpseCmsEntry) => void;
  onReorder: (entries: ExocorpseCmsEntry[]) => void;
  onSelect: (entryId: string) => void;
  studio: ExocorpseCmsStudio;
}) {
  const [query, setQuery] = useState("");
  const [characterId, setCharacterId] = useState("all");
  const presentations = useMemo(
    () =>
      new Map(
        entries.map((entry) => [
          entry.id,
          connectionPresentation(collection.slug, entry, studio),
        ]),
      ),
    [collection.slug, entries, studio],
  );
  const characterCollection = studio.collections.find(
    (item) => item.slug === "characters",
  );
  const characters = studio.entries
    .filter((entry) => entry.collection_id === characterCollection?.id)
    .sort((left, right) => left.title.localeCompare(right.title));
  const normalizedQuery = query.trim().toLowerCase();
  const filteredEntries = entries.filter((entry) => {
    const presentation = presentations.get(entry.id);
    return (
      presentation &&
      (characterId === "all" || presentation.targetIds.includes(characterId)) &&
      (!normalizedQuery ||
        presentation.searchText.toLowerCase().includes(normalizedQuery))
    );
  });
  const isRelationship = collection.slug === "character-relationships";

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-zinc-950 dark:text-zinc-50">
              {isRelationship
                ? "Character relationships"
                : "Faction memberships"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {isRelationship
                ? "See who is connected, how they relate, and the story behind it."
                : "See each character’s faction, role, rank, and membership status."}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <UsersRound className="h-4 w-4" />
            {filteredEntries.length} of {entries.length}
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.45fr)]">
          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              aria-label={`Search ${collection.title.toLowerCase()}`}
              className="h-11 bg-white pl-9 dark:bg-zinc-900"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                isRelationship
                  ? "Search characters or relationship type…"
                  : "Search characters, factions, roles, or ranks…"
              }
              value={query}
            />
          </label>
          <select
            aria-label="Filter by character"
            className="h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            onChange={(event) => setCharacterId(event.target.value)}
            value={characterId}
          >
            <option value="all">All characters</option>
            {characters.map((character) => (
              <option key={character.id} value={character.id}>
                {character.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredEntries.length ? (
        <SortableList
          className="grid items-stretch gap-5 @4xl:grid-cols-2"
          getId={(entry) => entry.id}
          items={filteredEntries}
          layout="grid"
          onReorder={(next) =>
            onReorder(mergeVisibleOrder(entries, next, (entry) => entry.id))
          }
        >
          {(entry) => (
            <ConnectionCard
              assets={assets}
              collectionSlug={collection.slug}
              entry={entry}
              onDelete={() => onDelete(entry)}
              onEdit={() => onSelect(entry.id)}
              presentation={presentations.get(entry.id)!}
            />
          )}
        </SortableList>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center dark:border-zinc-700 dark:bg-zinc-950">
          <Search className="mx-auto h-8 w-8 text-zinc-400" />
          <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">
            {entries.length
              ? "No matches found"
              : isRelationship
                ? "No relationships yet"
                : "No memberships yet"}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {entries.length
              ? "Try another character or search term."
              : "Create the first one to connect this part of the wiki."}
          </p>
          {!entries.length ? (
            <Button className="mt-5" onClick={onCreate} type="button">
              {isRelationship ? "+ Add relationship" : "+ Add membership"}
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}
