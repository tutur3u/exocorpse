"use client";

import { shouldBypassImageOptimization } from "@/components/admin/cms-management/editor-utils";
import { entryCardDescription } from "@/components/admin/cms-management/gallery-utils";
import CmsCardQuickActions from "@/components/admin/cms-management/CmsCardQuickActions";
import type { AdminCmsTheme } from "@/components/admin/cms-management/admin-theme";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsCollection,
  ExocorpseCmsEntry,
} from "@/types/exocorpse-cms";
import Image from "next/image";

export default function CmsEntryCard({
  avatarAsset,
  collection,
  eager = false,
  entry,
  onEdit,
  publicPath,
  secondaryActions = [],
  previewAsset,
  supportsImages,
  theme,
}: {
  avatarAsset?: ExocorpseCmsAsset;
  collection: ExocorpseCmsCollection;
  eager?: boolean;
  entry: ExocorpseCmsEntry;
  onEdit: () => void;
  publicPath?: string;
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    tone: "blue" | "pink" | "purple";
  }>;
  previewAsset?: ExocorpseCmsAsset;
  supportsImages: boolean;
  theme: AdminCmsTheme;
}) {
  const imageUrl = previewAsset?.preview_url ?? previewAsset?.asset_url;
  const avatarUrl = avatarAsset?.preview_url ?? avatarAsset?.asset_url;
  const hasPreview = previewAsset?.asset_type === "image" && Boolean(imageUrl);
  const description = entryCardDescription(entry);
  const previewSize =
    collection.slug === "portfolio-art"
      ? "aspect-square"
      : collection.slug === "characters"
        ? "h-32"
        : "h-48";
  return (
    <article
      aria-label={`Edit ${entry.title}`}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 [content-visibility:auto] hover:-translate-y-1 hover:border-cyan-300/60 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none dark:border-slate-700 dark:bg-slate-900 dark:hover:border-cyan-300/30"
      onClick={onEdit}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onEdit();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <CmsCardQuickActions
        className="absolute top-3 left-3 z-30"
        path={publicPath}
      />
      {supportsImages ? (
        <div
          className={`relative overflow-hidden rounded-t-xl ${previewSize} ${theme.media}`}
        >
          {hasPreview && imageUrl && previewAsset ? (
            <Image
              alt={previewAsset.alt_text ?? `${entry.title} preview`}
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 5'%3E%3Crect width='12' height='5' fill='%23181a20'/%3E%3C/svg%3E"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              fetchPriority={eager ? "high" : "auto"}
              fill
              loading={eager ? "eager" : "lazy"}
              placeholder="blur"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              src={imageUrl}
              unoptimized={shouldBypassImageOptimization(previewAsset)}
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      ) : null}
      {supportsImages && avatarAsset && avatarUrl ? (
        <div className="absolute top-[5.5rem] left-4 z-20 h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-md dark:border-gray-800 dark:bg-gray-700">
          <Image
            alt={`${entry.title} profile`}
            className="object-cover"
            fill
            sizes="80px"
            src={avatarUrl}
            unoptimized={shouldBypassImageOptimization(avatarAsset)}
          />
        </div>
      ) : null}

      <div
        className={`flex flex-1 flex-col p-4 ${avatarAsset && avatarUrl ? "pt-12" : ""}`}
      >
        <h3 className="line-clamp-2 text-lg leading-6 font-bold text-gray-900 dark:text-gray-100">
          {entry.title || "Untitled"}
        </h3>
        {description ? (
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-gray-600 dark:text-gray-400">
            {description}
          </p>
        ) : null}
        {secondaryActions.length ? (
          <div className="mt-4 space-y-2">
            {secondaryActions.map((action) => (
              <button
                className={`w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  action.tone === "purple"
                    ? "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50"
                    : action.tone === "pink"
                      ? "bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:hover:bg-pink-900/50"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                }`}
                key={action.label}
                onClick={(event) => {
                  event.stopPropagation();
                  action.onClick();
                }}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
