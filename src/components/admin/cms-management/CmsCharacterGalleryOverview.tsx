"use client";

import {
  isJsonRecord,
  shouldBypassImageOptimization,
} from "@/components/admin/cms-management/editor-utils";
import CmsCardQuickActions from "@/components/admin/cms-management/CmsCardQuickActions";
import { cmsEntryPublicPath } from "@/components/admin/cms-management/cms-entry-public-url";
import type { ExocorpseCmsStudio } from "@/types/exocorpse-cms";
import { Button } from "@tuturuuu/ui/button";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

export default function CmsCharacterGalleryOverview({
  characterId,
  onEdit,
  onUpload,
  pending,
  studio,
}: {
  characterId: string;
  onEdit: (entryId: string) => void;
  onUpload: (file: File) => Promise<void>;
  pending: boolean;
  studio: ExocorpseCmsStudio;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async (files: FileList | File[]) => {
    const images = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!images.length) return;
    setUploading(true);
    try {
      for (const file of images) await onUpload(file);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  if (!characterId) {
    return (
      <section className="rounded-xl border-2 border-dashed border-zinc-300 px-6 py-14 text-center dark:border-zinc-700">
        <ImageIcon className="mx-auto h-10 w-10 text-zinc-400" />
        <p className="mt-3 font-semibold text-zinc-800 dark:text-zinc-200">
          Save the character first
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          You can add gallery images as soon as the character has been created.
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
  const busy = pending || uploading;
  const character = studio.entries.find((entry) => entry.id === characterId);
  const publicPath = character
    ? cmsEntryPublicPath("characters", character, studio)
    : undefined;

  return (
    <section className="space-y-5">
      <div
        className={`rounded-2xl border-2 border-dashed p-5 transition sm:p-6 ${
          dragging
            ? "border-cyan-400 bg-cyan-50 dark:bg-cyan-950/20"
            : "border-slate-300 bg-slate-50/70 hover:border-cyan-400 dark:border-slate-700 dark:bg-slate-900/40"
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setDragging(false);
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void uploadFiles(event.dataTransfer.files);
        }}
      >
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-semibold text-slate-950 dark:text-white">
              {busy ? "Adding images…" : "Add images to this gallery"}
            </h4>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Drop one or more images here, or choose them from your device.
            </p>
          </div>
          <input
            accept="image/*"
            className="sr-only"
            disabled={busy}
            multiple
            onChange={(event) => {
              if (event.target.files) void uploadFiles(event.target.files);
            }}
            ref={inputRef}
            type="file"
          />
          <Button
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <ImageIcon className="h-4 w-4" />
            Choose images
          </Button>
        </div>
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
              <article
                aria-label={`Edit ${entry.title}`}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 text-left transition hover:border-cyan-400 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                key={entry.id}
                onClick={() => onEdit(entry.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onEdit(entry.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <CmsCardQuickActions
                  className="absolute top-2 right-2 z-20"
                  path={publicPath}
                />
                <div className="relative aspect-[4/3] bg-zinc-200 dark:bg-zinc-950">
                  {asset?.asset_type === "image" && imageUrl ? (
                    <Image
                      alt={asset.alt_text ?? entry.title}
                      className="object-cover transition duration-200 group-hover:scale-[1.02]"
                      fill
                      sizes="(max-width: 768px) 100vw, 420px"
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
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 px-6 py-8 text-center dark:border-slate-700">
          <ImageIcon className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 font-semibold text-slate-800 dark:text-slate-200">
            No gallery images yet
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Add the first image above. It will appear here immediately.
          </p>
        </div>
      )}
    </section>
  );
}
