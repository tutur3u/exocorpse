"use client";

import CmsMediaPanel from "./CmsMediaPanel";
import CmsCharacterMediaSettings from "./CmsCharacterMediaSettings";
import CmsGalleryCharacterTagger from "./CmsGalleryCharacterTagger";
import CmsStructuredFields from "./CmsStructuredFields";
import type { CmsEntryEditorProps } from "./CmsEntryEditor";
import type { splitLegacyEditorFields } from "./legacy-editor-tabs";
import type { ExocorpseCmsRelationDefinition } from "@/types/exocorpse-cms";

type Props = Pick<
  CmsEntryEditorProps,
  | "allowedAssetTypes"
  | "assets"
  | "draft"
  | "collection"
  | "onDeleteAsset"
  | "onSave"
  | "onUploadAsset"
  | "onReorderAssets"
  | "onPendingUploadFileChange"
  | "onTitleChange"
  | "pending"
  | "selectedEntryId"
  | "onRelationsChange"
  | "relationSelections"
  | "studio"
  | "onDraftChange"
  | "fields"
> & {
  canSave: boolean;
  isBlog: boolean;
  taggedCharactersDefinition: ExocorpseCmsRelationDefinition | null;
  groupedFields: ReturnType<typeof splitLegacyEditorFields>;
  inlineUpload?: (file: File) => Promise<string>;
  onPendingFileChange: (pending: boolean) => void;
};

export default function CmsEntryMediaSection({
  allowedAssetTypes,
  assets,
  draft,
  collection,
  canSave,
  onDeleteAsset,
  onSave,
  onUploadAsset,
  onReorderAssets,
  onPendingUploadFileChange,
  onTitleChange,
  isBlog,
  pending,
  selectedEntryId,
  taggedCharactersDefinition,
  onRelationsChange,
  relationSelections,
  studio,
  onDraftChange,
  groupedFields,
  fields,
  inlineUpload,
  onPendingFileChange,
}: Props) {
  const usesSingleArtwork = [
    "character-gallery",
    "location-gallery",
    "portfolio-art",
    "commission-pictures",
    "character-outfits",
    "blog-posts",
    "portfolio-writing",
  ].includes(collection.slug);
  return (
    <>
      <CmsMediaPanel
        allowUploadBeforeSave
        allowedAssetTypes={allowedAssetTypes}
        assets={assets}
        canSave={canSave}
        onDelete={onDeleteAsset}
        onSave={onSave}
        onUpload={onUploadAsset}
        onReorder={onReorderAssets}
        onFileSelectionChange={(file) => {
          onPendingUploadFileChange(file);
          if (
            file &&
            !draft.title.trim() &&
            usesSingleArtwork &&
            !isBlog &&
            collection.slug !== "portfolio-writing"
          )
            onTitleChange(file.name.replace(/\.[^.]+$/, ""));
        }}
        onPendingFileChange={(hasPendingFile) =>
          onPendingFileChange(hasPendingFile)
        }
        pending={pending}
        previewSize={usesSingleArtwork ? "compact" : "default"}
        mode={usesSingleArtwork ? "single" : "gallery"}
        title={
          collection.slug === "portfolio-art"
            ? "Artwork image"
            : collection.slug === "character-gallery"
              ? "Gallery artwork"
              : collection.slug === "blog-posts"
                ? "Cover Image"
                : undefined
        }
        description={
          collection.slug === "blog-posts"
            ? "Pick a file now. It uploads right after the post is saved."
            : undefined
        }
        saved={Boolean(selectedEntryId)}
      />
      {taggedCharactersDefinition ? (
        <CmsGalleryCharacterTagger
          definition={taggedCharactersDefinition}
          onChange={(entryIds) =>
            onRelationsChange({
              ...relationSelections,
              [taggedCharactersDefinition.id]: entryIds,
            })
          }
          studio={studio}
          value={relationSelections[taggedCharactersDefinition.id] ?? []}
        />
      ) : null}
      <CmsCharacterMediaSettings
        assets={assets}
        collectionSlug={collection.slug}
        draft={draft}
        onChange={onDraftChange}
      />
      <CmsStructuredFields
        compact
        definitions={[
          ...groupedFields.visuals,
          ...fields.filter((field) => field.key === "spotifyLink"),
        ]}
        draft={draft}
        onChange={onDraftChange}
        onImageUpload={inlineUpload}
        title="Visual Style"
      />
    </>
  );
}
