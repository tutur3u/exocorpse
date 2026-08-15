"use client";

import type { ExocorpseCmsAsset } from "@/types/exocorpse-cms";
import { shouldBypassImageOptimization } from "@/components/admin/cms-management/editor-utils";
import { FileImage, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@tuturuuu/ui/button";
import SortableList from "@/components/admin/SortableList";

export default function CmsAssetManager({
  allowedAssetTypes,
  assets,
  disabled,
  onDelete,
  onUpload,
  onReorder,
  previewSize = "default",
  mode = "gallery",
  showHeader = true,
  title,
  description,
}: {
  allowedAssetTypes: string[];
  assets: ExocorpseCmsAsset[];
  disabled: boolean;
  onDelete: (assetId: string) => void;
  onUpload: (file: File) => Promise<void> | void;
  onReorder: (assets: ExocorpseCmsAsset[]) => void;
  previewSize?: "compact" | "default";
  mode?: "gallery" | "single";
  showHeader?: boolean;
  title?: string;
  description?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedFile, setSelectedFile] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const accept = allowedAssetTypes.length
    ? allowedAssetTypes.map((type) => `${type}/*`).join(",")
    : undefined;
  const hasSingleAsset = mode === "single" && assets.length > 0;
  const uploadLabel = hasSingleAsset ? "Replace image" : "Upload";

  return (
    <section className="space-y-4">
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-dashed p-4 transition ${dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-transparent"}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          const file = event.dataTransfer.files[0];
          if (!file || disabled) return;
          void onUpload(file);
        }}
      >
        {showHeader ? (
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-zinc-950 dark:text-zinc-50">
              <FileImage className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              {title ?? (mode === "single" ? "Image" : "Media")}
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {description ??
                (hasSingleAsset
                  ? "Choose another image to replace the current one, or remove it."
                  : mode === "single"
                    ? "Choose one image. You can replace or remove it at any time."
                    : "Add and arrange the images visitors will see.")}
            </p>
          </div>
        ) : null}
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const file = new FormData(event.currentTarget).get("file");
            if (!(file instanceof File) || !file.size) return;
            try {
              await onUpload(file);
              formRef.current?.reset();
              setSelectedFile("");
            } catch {
              // The parent owns the user-facing error and keeps the selected
              // file available so the upload can be retried.
            }
          }}
          className="flex flex-wrap items-center gap-2"
          ref={formRef}
        >
          <label className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:text-blue-300">
            {selectedFile || "Choose a file"}
            <input
              accept={accept}
              className="sr-only"
              disabled={disabled}
              name="file"
              onChange={(event) =>
                setSelectedFile(event.target.files?.[0]?.name ?? "")
              }
              required
              type="file"
            />
          </label>
          <Button
            className="inline-flex items-center gap-1.5 rounded bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={disabled || !selectedFile}
            type="submit"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            {uploadLabel}
          </Button>
        </form>
      </div>

      <SortableList
        className={
          previewSize === "compact"
            ? "grid max-w-3xl gap-3 sm:grid-cols-2"
            : "grid gap-3 @2xl:grid-cols-2 @5xl:grid-cols-3"
        }
        getId={(asset) => asset.id}
        items={[...assets].sort(
          (left, right) => left.sort_order - right.sort_order,
        )}
        layout="grid"
        onReorder={mode === "single" ? () => undefined : onReorder}
      >
        {(asset) => {
          const imageUrl = asset.preview_url ?? asset.asset_url;
          return (
            <article
              className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
              key={asset.id}
            >
              {asset.asset_type === "image" && imageUrl ? (
                <div
                  className={`relative overflow-hidden bg-zinc-200 dark:bg-zinc-900 ${
                    previewSize === "compact" ? "aspect-[16/7]" : "aspect-video"
                  }`}
                >
                  <Image
                    alt={asset.alt_text ?? "Media preview"}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    src={imageUrl}
                    unoptimized={shouldBypassImageOptimization(asset)}
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
                    {asset.alt_text ?? `${asset.asset_type} file`}
                  </p>
                </div>
                <Button
                  aria-label="Delete media"
                  className="text-zinc-500 transition hover:bg-rose-100 hover:text-rose-700 disabled:opacity-40 dark:hover:bg-rose-950 dark:hover:text-rose-300"
                  disabled={disabled}
                  onClick={() => onDelete(asset.id)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          );
        }}
      </SortableList>
      {assets.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
          {mode === "single"
            ? "No image selected. Choose or drop one here."
            : "No media yet. Choose or drop a file to add the first one."}
        </div>
      ) : null}
    </section>
  );
}
