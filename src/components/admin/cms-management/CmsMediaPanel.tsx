"use client";

import CmsAssetManager from "@/components/admin/cms-management/CmsAssetManager";
import type { ExocorpseCmsAsset } from "@/types/exocorpse-cms";
import { Images } from "lucide-react";

export default function CmsMediaPanel({
  allowedAssetTypes,
  assets,
  canSave,
  pending,
  saved,
  onDelete,
  onSave,
  onUpload,
  onReorder,
}: {
  allowedAssetTypes: string[];
  assets: ExocorpseCmsAsset[];
  canSave: boolean;
  pending: boolean;
  saved: boolean;
  onDelete: (assetId: string) => void;
  onSave: () => void;
  onUpload: (file: File) => void;
  onReorder: (assets: ExocorpseCmsAsset[]) => void;
}) {
  if (saved) {
    return (
      <CmsAssetManager
        allowedAssetTypes={allowedAssetTypes}
        assets={assets}
        disabled={pending}
        onDelete={onDelete}
        onUpload={onUpload}
        onReorder={onReorder}
      />
    );
  }

  return (
    <div className="rounded-lg border-2 border-dashed border-gray-300 px-5 py-12 text-center dark:border-gray-600">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
        <Images className="h-5 w-5" />
      </span>
      <p className="mt-4 font-semibold text-zinc-900 dark:text-zinc-100">
        Save the basics first
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        Add a title and save this item, then you can attach images and other
        media here.
      </p>
      <button
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        disabled={!canSave}
        onClick={onSave}
        type="button"
      >
        Save item
      </button>
    </div>
  );
}
