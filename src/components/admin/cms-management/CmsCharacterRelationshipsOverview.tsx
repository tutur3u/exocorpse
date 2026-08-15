"use client";

import { connectionPresentation } from "@/components/admin/cms-management/connection-entry-utils";
import type { ExocorpseCmsStudio } from "@/types/exocorpse-cms";
import { Button } from "@tuturuuu/ui/button";
import { HeartHandshake, Plus, UserRound } from "lucide-react";

export default function CmsCharacterRelationshipsOverview({
  characterId,
  onCreate,
  onEdit,
  studio,
}: {
  characterId: string;
  onCreate: () => void;
  onEdit: (entryId: string) => void;
  studio: ExocorpseCmsStudio;
}) {
  const collection = studio.collections.find(
    (item) => item.slug === "character-relationships",
  );
  const entries = studio.entries
    .filter((entry) => entry.collection_id === collection?.id)
    .map((entry) => ({
      entry,
      presentation: connectionPresentation(
        "character-relationships",
        entry,
        studio,
      ),
    }))
    .filter(({ presentation }) => presentation.targetIds.includes(characterId))
    .sort((left, right) =>
      left.presentation.primary.localeCompare(right.presentation.primary),
    );

  if (!characterId) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-300 px-5 py-8 text-center dark:border-slate-700">
        <UserRound className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 font-semibold text-slate-800 dark:text-slate-200">
          Save the character first
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Relationships can be added as soon as this character exists.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-rose-200/70 bg-rose-50/60 p-4 sm:flex-row sm:items-center dark:border-rose-300/15 dark:bg-rose-400/5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">
            <HeartHandshake className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-slate-950 dark:text-white">
              {entries.length
                ? `${entries.length} ${entries.length === 1 ? "relationship" : "relationships"}`
                : "No relationships yet"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Connect this character to someone and describe their history.
            </p>
          </div>
        </div>
        <Button onClick={onCreate} type="button">
          <Plus className="h-4 w-4" /> Add relationship
        </Button>
      </div>

      {entries.length ? (
        <div className="grid gap-3 @2xl:grid-cols-2">
          {entries.map(({ entry, presentation }) => {
            const other =
              presentation.characterA?.id === characterId
                ? presentation.characterB
                : presentation.characterA;
            return (
              <button
                className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-rose-300 hover:bg-rose-50/40 focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:outline-none dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-rose-300/30 dark:hover:bg-rose-400/5"
                key={entry.id}
                onClick={() => onEdit(entry.id)}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">
                    <HeartHandshake className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-950 dark:text-white">
                      {other?.title ?? "Choose a character"}
                    </p>
                    <p className="truncate text-sm text-rose-700 dark:text-rose-200">
                      {presentation.secondary}
                    </p>
                  </div>
                </div>
                {(entry.summary || entry.subtitle) && (
                  <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-600 dark:text-slate-400">
                    {entry.summary ?? entry.subtitle}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
