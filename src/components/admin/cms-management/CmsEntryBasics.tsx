"use client";

import type { CmsEntryDraft } from "./editor-types";

const inputClassName =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

export default function CmsEntryBasics({
  draft,
  onChange,
  onTitleChange,
  collectionSlug = "",
  children,
}: {
  draft: CmsEntryDraft;
  onChange: (draft: CmsEntryDraft) => void;
  onImageUpload?: (file: File) => Promise<string>;
  onTitleChange: (title: string) => void;
  collectionSlug?: string;
  children?: React.ReactNode;
}) {
  const isName = [
    "worlds",
    "characters",
    "factions",
    "locations",
    "commission-services",
    "commission-addons",
    "commission-styles",
    "character-outfits",
    "relationship-types",
  ].includes(collectionSlug);
  const placeholders: Record<string, string> = {
    stories: "My Fantasy Story",
    worlds: "Terra Nova",
    characters: "John Doe",
    factions: "Exocorpse",
    locations: "Enter location name",
    "commission-services": "e.g., Full Body Illustration",
    "commission-addons": "e.g., Extra Character, Complex Background",
    "commission-styles": "e.g., Anime Style, Realistic, Chibi",
    "relationship-types": "e.g., Parent, Friend, Rival",
  };
  const showSlug = ![
    "commission-addons",
    "commission-pictures",
    "relationship-types",
    "character-gallery",
    "character-outfits",
    "location-gallery",
  ].includes(collectionSlug);
  const showTitle = collectionSlug !== "commission-pictures";
  const showSummary = ![
    "characters",
    "commission-pictures",
    "commission-addons",
    "commission-services",
    "commission-styles",
    "portfolio-art",
    "portfolio-games",
    "relationship-types",
    "character-gallery",
    "character-outfits",
    "location-gallery",
  ].includes(collectionSlug);
  return (
    <section className="space-y-4">
      {showTitle ? (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {isName ? "Name" : "Title"} *
          </span>
          <input
            className={inputClassName}
            maxLength={160}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder={placeholders[collectionSlug] ?? "Enter title"}
            required
            value={draft.title}
          />
        </label>
      ) : null}
      {children}
      {showSlug ? (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Slug *
          </span>
          <input
            className={inputClassName}
            onChange={(event) =>
              onChange({ ...draft, slug: event.target.value })
            }
            placeholder="url-friendly-slug"
            required
            value={draft.slug}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            URL-friendly identifier (lowercase, hyphens only)
          </p>
        </label>
      ) : null}
      {showSummary ? (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {["portfolio-writing", "blog-posts"].includes(collectionSlug)
              ? "Excerpt"
              : "Summary"}
          </span>
          <input
            className={inputClassName}
            onChange={(event) =>
              onChange({ ...draft, summary: event.target.value || null })
            }
            placeholder="A brief one-line summary"
            value={draft.summary ?? ""}
          />
        </label>
      ) : null}
    </section>
  );
}
