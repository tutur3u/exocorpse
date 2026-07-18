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
}: {
  allowedAssetTypes: string[];
  assets: ExocorpseCmsAsset[];
  canSave: boolean;
  pending: boolean;
  saved: boolean;
  onDelete: (assetId: string) => void;
  onSave: () => void;
  onUpload: (formData: FormData) => void;
}) {
  if (saved) {
    return (
      <CmsAssetManager
        allowedAssetTypes={allowedAssetTypes}
        assets={assets}
        disabled={pending}
        onDelete={onDelete}
        onUpload={onUpload}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/60 px-5 py-12 text-center dark:border-cyan-900 dark:bg-cyan-950/20">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
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
        className="mt-4 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-45"
        disabled={!canSave}
        onClick={onSave}
        type="button"
      >
        Save item
      </button>
    </div>
  );
}
