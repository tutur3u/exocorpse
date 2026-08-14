"use client";

import { shouldBypassImageOptimization } from "@/components/admin/cms-management/editor-utils";
import type {
  ExocorpseCmsEntry,
  ExocorpseCmsRelationDefinition,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";
import { Button } from "@tuturuuu/ui/button";
import { Input } from "@tuturuuu/ui/input";
import { Check, Plus, Search, UserRound, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

function CharacterAvatar({
  character,
  studio,
}: {
  character: ExocorpseCmsEntry;
  studio: ExocorpseCmsStudio;
}) {
  const asset = studio.assets
    .filter((item) => item.entry_id === character.id)
    .sort((left, right) => left.sort_order - right.sort_order)[0];
  const imageUrl = asset?.preview_url ?? asset?.asset_url;

  return (
    <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-cyan-200 bg-cyan-50 text-sm font-bold text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-200">
      {asset?.asset_type === "image" && imageUrl ? (
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="40px"
          src={imageUrl}
          unoptimized={shouldBypassImageOptimization(asset)}
        />
      ) : (
        character.title.slice(0, 1).toUpperCase()
      )}
    </span>
  );
}

export default function CmsGalleryCharacterTagger({
  definition,
  onChange,
  studio,
  value,
}: {
  definition: ExocorpseCmsRelationDefinition;
  onChange: (entryIds: string[]) => void;
  studio: ExocorpseCmsStudio;
  value: string[];
}) {
  const [choosing, setChoosing] = useState(false);
  const [query, setQuery] = useState("");
  const characterCollection = studio.collections.find(
    (collection) => collection.slug === "characters",
  );
  const characters = useMemo(
    () =>
      studio.entries
        .filter((entry) => entry.collection_id === characterCollection?.id)
        .sort((left, right) => left.title.localeCompare(right.title)),
    [characterCollection?.id, studio.entries],
  );
  const characterById = new Map(
    characters.map((character) => [character.id, character]),
  );
  const selectedCharacters = value
    .map((entryId) => characterById.get(entryId))
    .filter((entry): entry is ExocorpseCmsEntry => Boolean(entry));
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCharacters = characters.filter(
    (character) =>
      !normalizedQuery ||
      character.title.toLowerCase().includes(normalizedQuery) ||
      character.slug.toLowerCase().includes(normalizedQuery),
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-200/80 bg-linear-to-br from-cyan-50/80 via-white to-fuchsia-50/50 dark:border-cyan-900/70 dark:from-cyan-950/25 dark:via-slate-950 dark:to-fuchsia-950/20">
      <div className="flex flex-col gap-3 border-b border-cyan-100 px-4 py-4 sm:flex-row sm:items-center sm:px-5 dark:border-cyan-950">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200">
          <UserRound className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-950 dark:text-white">
            Tagged characters
            {definition.is_required ? (
              <span className="text-rose-500"> *</span>
            ) : null}
          </h3>
          <p className="mt-0.5 text-sm leading-5 text-slate-600 dark:text-slate-400">
            This artwork appears in every selected character&apos;s gallery.
          </p>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => setChoosing((current) => !current)}
          type="button"
          variant={choosing ? "secondary" : "default"}
        >
          {choosing ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {choosing ? "Done" : "Tag characters"}
        </Button>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        {selectedCharacters.length ? (
          <div className="grid gap-2 @xl:grid-cols-2">
            {selectedCharacters.map((character) => (
              <div
                className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white/90 p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
                key={character.id}
              >
                <CharacterAvatar character={character} studio={studio} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                    {character.title}
                  </p>
                  <p className="text-xs text-cyan-700 dark:text-cyan-300">
                    Included in gallery
                  </p>
                </div>
                <Button
                  aria-label={`Remove ${character.title}`}
                  className="shrink-0 text-slate-500 hover:text-rose-600"
                  onClick={() =>
                    onChange(
                      value.filter((entryId) => entryId !== character.id),
                    )
                  }
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center dark:border-slate-700">
            <UserRound className="mx-auto h-6 w-6 text-slate-400" />
            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              No characters tagged yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Tag at least one character so visitors can find this artwork.
            </p>
          </div>
        )}

        {choosing ? (
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <label className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                autoFocus
                className="w-full pl-9"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search characters…"
                value={query}
              />
            </label>
            <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto pr-1 @xl:grid-cols-2">
              {filteredCharacters.map((character) => {
                const active = value.includes(character.id);
                return (
                  <button
                    aria-pressed={active}
                    className={`flex min-w-0 items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                      active
                        ? "border-cyan-400 bg-cyan-50 text-cyan-950 dark:border-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-50"
                        : "border-slate-200 hover:border-cyan-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-cyan-900 dark:hover:bg-slate-900"
                    }`}
                    key={character.id}
                    onClick={() =>
                      onChange(
                        active
                          ? value.filter((entryId) => entryId !== character.id)
                          : [...value, character.id],
                      )
                    }
                    type="button"
                  >
                    <CharacterAvatar character={character} studio={studio} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {character.title}
                    </span>
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                        active
                          ? "border-cyan-600 bg-cyan-600 text-white"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {active ? <Check className="h-3.5 w-3.5" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
            {filteredCharacters.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                No characters match that search.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
