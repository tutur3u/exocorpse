"use client";

import type { ExocorpseCmsAsset } from "@/types/exocorpse-cms";
import { FileImage, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

export default function CmsAssetManager({
  allowedAssetTypes,
  assets,
  disabled,
  onDelete,
  onUpload,
}: {
  allowedAssetTypes: string[];
  assets: ExocorpseCmsAsset[];
  disabled: boolean;
  onDelete: (assetId: string) => void;
  onUpload: (formData: FormData) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const accept = allowedAssetTypes.length
    ? allowedAssetTypes.map((type) => `${type}/*`).join(",")
    : undefined;

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-zinc-950 dark:text-zinc-50">
            <FileImage className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            Managed media
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Uploads use Tuturuuu Storage and versioned delivery URLs.
          </p>
        </div>
        <form
          action={(formData) => {
            onUpload(formData);
            formRef.current?.reset();
          }}
          className="flex flex-wrap items-center gap-2"
          ref={formRef}
        >
          <input
            accept={accept}
            className="max-w-52 text-xs text-zinc-500 file:mr-2 file:rounded-lg file:border-0 file:bg-zinc-200 file:px-2.5 file:py-1.5 file:text-xs file:font-medium dark:file:bg-zinc-800 dark:file:text-zinc-200"
            disabled={disabled}
            name="file"
            required
            type="file"
          />
          <button
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-50"
            disabled={disabled}
            type="submit"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Upload
          </button>
        </form>
      </div>

      <div className="grid gap-3 @2xl:grid-cols-2 @5xl:grid-cols-3">
        {assets.map((asset) => {
          const imageUrl = asset.preview_url ?? asset.asset_url;
          return (
            <article
              className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
              key={asset.id}
            >
              {asset.asset_type === "image" && imageUrl ? (
                <div className="relative aspect-video overflow-hidden bg-zinc-200 dark:bg-zinc-900">
                  <Image
                    alt={asset.alt_text ?? "CMS asset preview"}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    src={imageUrl}
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-zinc-200 text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  {asset.asset_type}
                </div>
              )}
              <div className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    {asset.alt_text ?? `${asset.asset_type} asset`}
                  </p>
                  <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                    {asset.storage_path ? "Managed" : "External"} · revisioned
                  </p>
                </div>
                <button
                  aria-label="Delete media"
                  className="rounded-lg p-2 text-zinc-500 transition hover:bg-rose-100 hover:text-rose-700 disabled:opacity-40 dark:hover:bg-rose-950 dark:hover:text-rose-300"
                  disabled={disabled}
                  onClick={() => onDelete(asset.id)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No media attached to this record.
        </div>
      ) : null}
    </section>
  );
}
