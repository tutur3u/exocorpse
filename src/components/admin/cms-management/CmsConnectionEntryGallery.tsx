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
  HeartHandshake,
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
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-500 shadow-[0_0_0_3px_rgba(255,255,255,0.7)] dark:border-white/15 dark:bg-slate-900 dark:text-slate-400 dark:shadow-[0_0_0_3px_rgba(34,211,238,0.06)]">
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
      <span className="truncate font-serif text-base font-semibold text-slate-950 dark:text-[#fff6e8]">
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
    <article className="group relative h-full overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] shadow-[0_14px_36px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400/45 hover:shadow-[0_22px_52px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_34%),radial-gradient(circle_at_88%_14%,rgba(217,70,239,0.08),transparent_26%),linear-gradient(180deg,rgba(12,16,28,0.98),rgba(7,10,18,0.98))] dark:shadow-[0_18px_48px_rgba(2,6,23,0.34)] dark:hover:border-cyan-300/35">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/70 to-fuchsia-300/40 opacity-50 transition group-hover:opacity-100" />
      <button
        aria-label={`Edit ${presentation.primary}`}
        className="w-full px-5 pt-5 pb-4 text-left focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:outline-none focus-visible:ring-inset"
        onClick={onEdit}
        type="button"
      >
        {collectionSlug === "character-relationships" ? (
          <>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 pt-11">
              <Identity
                asset={avatarFor(presentation.characterA, assets)}
                entry={presentation.characterA}
              />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-rose-200/70 bg-rose-50 text-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.12)] dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-200">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <Identity
                asset={avatarFor(presentation.characterB, assets)}
                entry={presentation.characterB}
              />
            </div>
            <div className="mt-5 flex items-center gap-2 border-t border-slate-200/70 pt-4 dark:border-white/8">
              <span className="rounded-full border border-rose-200/70 bg-rose-50 px-3 py-1 text-xs font-semibold tracking-wide text-rose-800 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-100">
                {presentation.secondary}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 pt-11">
              <Identity
                asset={avatarFor(presentation.characterA, assets)}
                entry={presentation.characterA}
              />
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-200/70 bg-violet-50 text-violet-600 dark:border-violet-300/20 dark:bg-violet-400/10 dark:text-violet-200">
                <ArrowRight className="h-4 w-4" />
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-200/70 bg-violet-50 text-violet-700 dark:border-violet-300/20 dark:bg-violet-400/10 dark:text-violet-200">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="truncate font-serif text-base font-semibold text-slate-950 dark:text-[#fff6e8]">
                  {presentation.faction?.title ?? "Not selected"}
                </span>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200/70 pt-4 dark:border-white/8">
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
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </button>
      <div className="flex items-center justify-end gap-1.5 border-t border-slate-200/70 bg-white/35 px-4 py-3 dark:border-white/8 dark:bg-white/[0.015]">
        <Button
          className="border-slate-300 bg-white/70 text-slate-700 shadow-sm hover:border-cyan-400/60 hover:bg-cyan-50 hover:text-cyan-800 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:border-cyan-300/45 dark:hover:bg-cyan-300/10 dark:hover:text-cyan-100"
          onClick={onEdit}
          size="sm"
          type="button"
          variant="outline"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
        <Button
          aria-label={`Delete ${presentation.primary}`}
          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-400/10"
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
      <div className="relative overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-5 shadow-sm dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.09),transparent_32%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.07),transparent_26%),linear-gradient(180deg,rgba(8,12,22,0.98),rgba(5,8,15,0.98))]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-cyan-300/15 via-cyan-300/70 to-fuchsia-300/45" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-cyan-700 uppercase dark:text-cyan-300/80">
              {isRelationship ? "Connection map" : "Faction roster"}
            </p>
            <h2 className="mt-1 font-serif text-xl font-semibold text-slate-950 dark:text-[#fff6e8]">
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
          <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/60 px-3 py-1.5 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-400">
            <UsersRound className="h-4 w-4" />
            {filteredEntries.length} of {entries.length}
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.45fr)]">
          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              aria-label={`Search ${collection.title.toLowerCase()}`}
              className="h-11 border-slate-300 bg-white/80 pl-9 shadow-inner dark:border-slate-700 dark:bg-slate-950/70"
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
            className="h-11 w-full rounded-md border border-slate-300 bg-white/80 px-3 text-sm text-slate-900 shadow-inner outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
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
          handleClassName="top-3 right-3 left-auto border-cyan-300/30 bg-slate-950/90 text-cyan-100 shadow-[0_12px_28px_rgba(2,6,23,0.42)] hover:border-cyan-200/70 hover:bg-cyan-300/15 hover:text-cyan-50"
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
