"use client";

import CmsBlockEditor from "@/components/admin/cms-management/CmsBlockEditor";
import CmsEditorTabs, {
  type CmsEditorTab,
} from "@/components/admin/cms-management/CmsEditorTabs";
import CmsEntryBasics from "@/components/admin/cms-management/CmsEntryBasics";
import CmsMediaPanel from "@/components/admin/cms-management/CmsMediaPanel";
import CmsPublishingSettings from "@/components/admin/cms-management/CmsPublishingSettings";
import CmsRelationEditor from "@/components/admin/cms-management/CmsRelationEditor";
import CmsStructuredFields from "@/components/admin/cms-management/CmsStructuredFields";
import CmsCharacterMediaSettings, {
  isCharacterMediaField,
} from "@/components/admin/cms-management/CmsCharacterMediaSettings";
import CmsCharacterGalleryOverview from "@/components/admin/cms-management/CmsCharacterGalleryOverview";
import CmsCharacterRelationshipsOverview from "@/components/admin/cms-management/CmsCharacterRelationshipsOverview";
import CmsGalleryCharacterTagger from "@/components/admin/cms-management/CmsGalleryCharacterTagger";
import CmsConnectionEntryEditor from "@/components/admin/cms-management/CmsConnectionEntryEditor";
import {
  CONNECTION_COLLECTION_SLUGS,
  hasDuplicateConnection,
  isConnectionDraftReady,
} from "@/components/admin/cms-management/connection-entry-utils";
import type { AdminCmsTheme } from "@/components/admin/cms-management/admin-theme";
import { collectionItemLabel } from "@/components/admin/cms-management/collection-copy";
import type {
  CmsBlockDraft,
  CmsEntryDraft,
  CmsRelationSelections,
  CmsUploadStatus,
} from "@/components/admin/cms-management/editor-types";
import { galleryCharacterDefinition } from "@/components/admin/cms-management/gallery-character-tagging";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import {
  legacyEditorTabs,
  splitCharacterEditorFields,
  splitLegacyEditorFields,
} from "@/components/admin/cms-management/legacy-editor-tabs";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsCollection,
  ExocorpseCmsFieldDefinition,
  ExocorpseCmsRelationDefinition,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";
import { ChevronDown, Save, Trash2, UploadCloud } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

function CharacterEditorSection({
  children,
  description,
  id,
  open = true,
  title,
}: {
  children: ReactNode;
  description?: string;
  id: string;
  open?: boolean;
  title: string;
}) {
  const [expanded, setExpanded] = useState(open);
  return (
    <details
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950/40"
      id={id}
      onToggle={(event) => setExpanded(event.currentTarget.open)}
      open={expanded}
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 marker:content-none sm:px-6 sm:py-5">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
              {description}
            </p>
          ) : null}
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
      </summary>
      <div className="space-y-5 border-t border-slate-200 p-5 sm:p-6 dark:border-slate-800">
        {children}
      </div>
    </details>
  );
}

function EditorTabSection({
  active,
  children,
  id,
  initialOpen,
  label,
  labelledBy,
}: {
  active: boolean;
  children: ReactNode;
  id: string;
  initialOpen: boolean;
  label: string;
  labelledBy: string;
}) {
  const [expanded, setExpanded] = useState(initialOpen);

  useEffect(() => {
    if (active) setExpanded(true);
  }, [active]);

  return (
    <details
      aria-labelledby={labelledBy}
      className="group scroll-mt-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/60 shadow-sm dark:border-slate-700/70 dark:bg-slate-950/25"
      id={id}
      onToggle={(event) => setExpanded(event.currentTarget.open)}
      open={expanded}
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 marker:content-none sm:px-6 sm:py-5">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
            {label}
          </h3>
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-slate-200 p-4 sm:p-6 dark:border-slate-800">
        {children}
      </div>
    </details>
  );
}

type Props = {
  allowedAssetTypes: string[];
  allowedBlockTypes: string[];
  assets: ExocorpseCmsAsset[];
  blocks: CmsBlockDraft[];
  collection: ExocorpseCmsCollection;
  definitions: ExocorpseCmsRelationDefinition[];
  draft: CmsEntryDraft;
  fields: ExocorpseCmsFieldDefinition[];
  onBlocksChange: (blocks: CmsBlockDraft[]) => void;
  onDelete: () => void;
  onDeleteAsset: (assetId: string) => void;
  onCancel: () => void;
  onDraftChange: (draft: CmsEntryDraft) => void;
  onSave: () => void;
  onTitleChange: (title: string) => void;
  onUploadAsset: (file: File) => void;
  onUploadGalleryAsset: (file: File) => Promise<void>;
  onUploadInlineAsset: (file: File) => Promise<string>;
  onEditGalleryEntry: (entryId: string) => void;
  onCreateRelationshipEntry: () => void;
  onEditRelationshipEntry: (entryId: string) => void;
  onPendingMediaChange: (pending: boolean) => void;
  onRelationsChange: (selections: CmsRelationSelections) => void;
  onReorderAssets: (assets: ExocorpseCmsAsset[]) => void;
  pending: boolean;
  relationSelections: CmsRelationSelections;
  isDirty: boolean;
  selectedEntryId: string;
  studio: ExocorpseCmsStudio;
  theme: AdminCmsTheme;
  uploadStatus: CmsUploadStatus;
};

export default function CmsEntryEditor({
  allowedAssetTypes,
  allowedBlockTypes,
  assets,
  blocks,
  collection,
  definitions,
  draft,
  fields,
  onBlocksChange,
  onCancel,
  onDelete,
  onDeleteAsset,
  onDraftChange,
  onRelationsChange,
  onReorderAssets,
  onSave,
  onTitleChange,
  onUploadAsset,
  onUploadGalleryAsset,
  onUploadInlineAsset,
  onEditGalleryEntry,
  onCreateRelationshipEntry,
  onEditRelationshipEntry,
  onPendingMediaChange,
  pending,
  relationSelections,
  isDirty,
  selectedEntryId,
  studio,
  theme,
  uploadStatus,
}: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pendingMediaSections, setPendingMediaSections] = useState<Set<string>>(
    () => new Set(),
  );
  const [activeTab, setActiveTab] = useState<CmsEditorTab>(() =>
    ["character-gallery", "portfolio-art"].includes(collection.slug)
      ? "media"
      : "basic",
  );
  const isConnectionEntry = CONNECTION_COLLECTION_SLUGS.has(collection.slug);
  const duplicateConnection = isConnectionEntry
    ? hasDuplicateConnection({
        collectionId: collection.id,
        collectionSlug: collection.slug,
        definitions,
        entryId: selectedEntryId,
        selections: relationSelections,
        studio,
      })
    : false;
  const canSave = isConnectionEntry
    ? isConnectionDraftReady(definitions, relationSelections) &&
      !duplicateConnection &&
      !pending &&
      isDirty
    : Boolean(draft.title.trim() && draft.slug.trim() && !pending && isDirty);
  const updatePendingMedia = useCallback(
    (section: string, hasPendingFile: boolean) => {
      setPendingMediaSections((current) => {
        const next = new Set(current);
        if (hasPendingFile) next.add(section);
        else next.delete(section);
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    onPendingMediaChange(pendingMediaSections.size > 0);
  }, [onPendingMediaChange, pendingMediaSections]);

  useEffect(() => () => onPendingMediaChange(false), [onPendingMediaChange]);
  const connectionCount = Object.values(relationSelections).reduce(
    (count, selections) => count + selections.length,
    0,
  );
  const groupedFields = splitLegacyEditorFields(
    fields.filter(
      (field) =>
        !isCharacterMediaField(field.key) &&
        !["displayOrder", "display_order", "sortOrder", "sort_order"].includes(
          field.key,
        ),
    ),
  );
  const characterFields = splitCharacterEditorFields([
    ...groupedFields.basic,
    ...groupedFields.details,
  ]);
  const isCharacter = collection.slug === "characters";
  const taggedCharactersDefinition =
    collection.slug === "character-gallery"
      ? galleryCharacterDefinition(studio, collection.id)
      : null;
  const tabs = legacyEditorTabs({
    assetCount: assets.length,
    blockCount: blocks.length,
    collection,
    connectionCount,
    fields: groupedFields,
    hasAssets: allowedAssetTypes.length > 0,
    hasBlocks: allowedBlockTypes.length > 0,
    hasConnections: definitions.length > 0,
  });
  const itemName = collectionItemLabel(collection).replace(/^./, (letter) =>
    letter.toUpperCase(),
  );
  const isBlog = collection.slug === "blog-posts";
  const visibleDefinitions = definitions.filter(
    (definition) =>
      !(
        definition.key === "tags" &&
        [
          "blog-posts",
          "characters",
          "portfolio-art",
          "portfolio-games",
          "portfolio-writing",
          "stories",
        ].includes(collection.slug)
      ),
  );
  const characterWorldDefinitions = visibleDefinitions.filter(
    (definition) => definition.key === "worlds",
  );
  const relationInBasics =
    visibleDefinitions.length > 0 &&
    ["stories", "worlds", "factions", "locations"].includes(collection.slug);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab(
      ["character-gallery", "portfolio-art"].includes(collection.slug)
        ? "media"
        : "basic",
    );
  }, [collection.id, collection.slug]);

  const scrollToSection = (tab: CmsEditorTab) => {
    setActiveTab(tab);
    const scrollArea = scrollAreaRef.current;
    if (isCharacter) {
      scrollArea?.scrollTo({ behavior: "smooth", top: 0 });
      return;
    }
    const panel = scrollArea?.querySelector<HTMLElement>(`#cms-${tab}-panel`);
    if (!scrollArea || !panel) return;
    if (panel instanceof HTMLDetailsElement) panel.open = true;
    const top =
      scrollArea.scrollTop +
      panel.getBoundingClientRect().top -
      scrollArea.getBoundingClientRect().top -
      16;
    scrollArea.scrollTo({ behavior: "smooth", top });
  };

  const updateActiveSection = () => {
    if (isCharacter) return;
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;
    if (
      scrollArea.scrollTop + scrollArea.clientHeight >=
      scrollArea.scrollHeight - 8
    ) {
      const finalTab = tabs.at(-1)?.id;
      if (finalTab) {
        setActiveTab(finalTab);
        return;
      }
    }
    const marker = scrollArea.getBoundingClientRect().top + 48;
    let next = tabs[0]?.id ?? "basic";
    for (const tab of tabs) {
      const panel = scrollArea.querySelector<HTMLElement>(
        `#cms-${tab.id}-panel`,
      );
      if (panel && panel.getBoundingClientRect().top <= marker) next = tab.id;
    }
    setActiveTab((current) => (current === next ? current : next));
  };

  const characterSubsections: Record<
    "basic" | "content" | "gallery" | "physical",
    { id: string; label: string }[]
  > = {
    basic: [
      { id: "character-basic-info", label: "Basic Info" },
      { id: "character-profile-images", label: "Profile Images" },
      { id: "character-publishing", label: "Publishing" },
    ],
    physical: [
      { id: "character-physical-details", label: "Physical Details" },
      { id: "character-personality", label: "Personality" },
    ],
    content: [
      { id: "character-relationships", label: "Relationships" },
      { id: "character-lore", label: "Backstory / Lore" },
      { id: "character-abilities", label: "Abilities" },
    ],
    gallery: [
      { id: "character-gallery", label: "Gallery" },
      { id: "character-fanwork", label: "Fanwork Policy" },
    ],
  };

  const scrollToCharacterSubsection = (id: string) => {
    const scrollArea = scrollAreaRef.current;
    const panel = scrollArea?.querySelector<HTMLDetailsElement>(`#${id}`);
    if (!scrollArea || !panel) return;
    panel.open = true;
    const top =
      scrollArea.scrollTop +
      panel.getBoundingClientRect().top -
      scrollArea.getBoundingClientRect().top -
      64;
    scrollArea.scrollTo({ behavior: "smooth", top });
  };

  const renderSection = (tab: CmsEditorTab) => {
    if (tab === "basic") {
      return (
        <>
          <CmsEntryBasics
            draft={draft}
            onChange={onDraftChange}
            onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
            onTitleChange={onTitleChange}
          />
          <CmsStructuredFields
            definitions={
              isCharacter ? characterFields.basic : groupedFields.basic
            }
            draft={draft}
            onChange={onDraftChange}
            onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
            title="Basic Details"
          />
          {relationInBasics ? (
            <CmsRelationEditor
              definitions={visibleDefinitions}
              entryId={selectedEntryId}
              onChange={onRelationsChange}
              selections={relationSelections}
              studio={studio}
            />
          ) : null}
        </>
      );
    }
    if (tab === "details") {
      return (
        <CmsStructuredFields
          definitions={groupedFields.details}
          draft={draft}
          onChange={onDraftChange}
          onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
        />
      );
    }
    if (tab === "physical") {
      return (
        <CmsStructuredFields
          definitions={characterFields.physical}
          draft={draft}
          onChange={onDraftChange}
          onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
          title="Physical Details"
        />
      );
    }
    if (tab === "personality") {
      return (
        <CmsStructuredFields
          definitions={characterFields.personality}
          draft={draft}
          onChange={onDraftChange}
          onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
          title="Personality Summary"
        />
      );
    }
    if (tab === "abilities") {
      return (
        <CmsStructuredFields
          definitions={characterFields.abilities}
          draft={draft}
          onChange={onDraftChange}
          onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
          title="Abilities & Skills"
        />
      );
    }
    if (tab === "fanwork") {
      return (
        <CmsStructuredFields
          definitions={characterFields.fanwork}
          draft={draft}
          onChange={onDraftChange}
          title="Fanwork Policy"
        />
      );
    }
    if (tab === "gallery") {
      return (
        <CmsCharacterGalleryOverview
          characterId={selectedEntryId}
          onEdit={onEditGalleryEntry}
          onUpload={onUploadGalleryAsset}
          pending={pending}
          studio={studio}
        />
      );
    }
    if (tab === "content") {
      return (
        <CmsBlockEditor
          allowedBlockTypes={allowedBlockTypes}
          blocks={blocks}
          onChange={onBlocksChange}
          onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
          singleDocument={isBlog}
        />
      );
    }
    if (tab === "connections") {
      return (
        <CmsRelationEditor
          definitions={visibleDefinitions}
          entryId={selectedEntryId}
          onChange={onRelationsChange}
          selections={relationSelections}
          studio={studio}
        />
      );
    }
    if (tab === "media") {
      const usesSingleArtwork = [
        "character-gallery",
        "location-gallery",
        "portfolio-art",
      ].includes(collection.slug);
      return (
        <>
          <CmsMediaPanel
            allowUploadBeforeSave={usesSingleArtwork}
            allowedAssetTypes={allowedAssetTypes}
            assets={assets}
            canSave={canSave}
            onDelete={onDeleteAsset}
            onSave={onSave}
            onUpload={onUploadAsset}
            onReorder={onReorderAssets}
            onPendingFileChange={(hasPendingFile) =>
              updatePendingMedia("media", hasPendingFile)
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
                    ? "Cover and post images"
                    : undefined
            }
            description={
              collection.slug === "blog-posts"
                ? "The cover appears first. Add more images to use inside the post."
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
            definitions={groupedFields.visuals}
            draft={draft}
            onChange={onDraftChange}
            onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
            title="Visual Style"
          />
        </>
      );
    }
    if (tab === "settings") {
      return (
        <>
          <CmsStructuredFields
            definitions={groupedFields.publishing}
            draft={draft}
            onChange={onDraftChange}
            title="Publishing Options"
          />
          <CmsPublishingSettings draft={draft} onChange={onDraftChange} />
        </>
      );
    }
    return null;
  };

  const renderCharacterSection = () => {
    if (activeTab === "basic") {
      return (
        <>
          <CharacterEditorSection
            description="Name, introduction, and the details readers see first."
            id="character-basic-info"
            title="Basic Info"
          >
            <CmsEntryBasics
              draft={draft}
              onChange={onDraftChange}
              onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
              onTitleChange={onTitleChange}
            />
            <CmsStructuredFields
              definitions={characterFields.basic}
              draft={draft}
              onChange={onDraftChange}
              onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
            />
            <CmsRelationEditor
              definitions={characterWorldDefinitions}
              entryId={selectedEntryId}
              onChange={onRelationsChange}
              selections={relationSelections}
              studio={studio}
            />
          </CharacterEditorSection>
          <CharacterEditorSection
            description="Profile picture, banner, and the character's visual presentation."
            id="character-profile-images"
            title="Profile Images"
          >
            <CmsCharacterMediaSettings
              assets={assets}
              collectionSlug={collection.slug}
              draft={draft}
              onChange={onDraftChange}
            />
            <CmsStructuredFields
              definitions={groupedFields.visuals}
              draft={draft}
              onChange={onDraftChange}
              onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
            />
            <CmsMediaPanel
              allowedAssetTypes={allowedAssetTypes}
              assets={assets}
              canSave={canSave}
              mode="gallery"
              onDelete={onDeleteAsset}
              onReorder={onReorderAssets}
              onPendingFileChange={(hasPendingFile) =>
                updatePendingMedia("character-profile", hasPendingFile)
              }
              onSave={onSave}
              onUpload={onUploadAsset}
              pending={pending}
              saved={Boolean(selectedEntryId)}
              title="Profile and banner images"
            />
          </CharacterEditorSection>
          <CharacterEditorSection
            description="Choose when and how this character appears on the site."
            id="character-publishing"
            title="Publishing"
          >
            <CmsStructuredFields
              definitions={groupedFields.publishing}
              draft={draft}
              onChange={onDraftChange}
              onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
            />
            <CmsPublishingSettings draft={draft} onChange={onDraftChange} />
          </CharacterEditorSection>
        </>
      );
    }
    if (activeTab === "physical") {
      return (
        <>
          <CharacterEditorSection
            description="Appearance, identity, and distinguishing traits."
            id="character-physical-details"
            title="Physical Details"
          >
            <CmsStructuredFields
              definitions={characterFields.physical}
              draft={draft}
              onChange={onDraftChange}
              onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
            />
          </CharacterEditorSection>
          <CharacterEditorSection
            description="Temperament, habits, motivations, and personality."
            id="character-personality"
            title="Personality Summary"
          >
            <CmsStructuredFields
              definitions={characterFields.personality}
              draft={draft}
              onChange={onDraftChange}
              onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
            />
          </CharacterEditorSection>
        </>
      );
    }
    if (activeTab === "content") {
      return (
        <>
          <CharacterEditorSection
            description="The people, factions, stories, and places connected to this character."
            id="character-relationships"
            title="Relationships"
          >
            <CmsCharacterRelationshipsOverview
              characterId={selectedEntryId}
              onCreate={onCreateRelationshipEntry}
              onEdit={onEditRelationshipEntry}
              studio={studio}
            />
          </CharacterEditorSection>
          <CharacterEditorSection
            description="Write the character's history and longer story sections."
            id="character-lore"
            title="Backstory / Lore"
          >
            <CmsBlockEditor
              allowedBlockTypes={allowedBlockTypes}
              blocks={blocks}
              onChange={onBlocksChange}
              onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
            />
          </CharacterEditorSection>
          <CharacterEditorSection
            description="Powers, learned skills, strengths, and limitations."
            id="character-abilities"
            title="Abilities"
          >
            <CmsStructuredFields
              definitions={characterFields.abilities}
              draft={draft}
              onChange={onDraftChange}
              onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
            />
          </CharacterEditorSection>
        </>
      );
    }
    return (
      <>
        <CharacterEditorSection
          description="Upload and edit this character's artwork without leaving the editor."
          id="character-gallery"
          title="Gallery"
        >
          <CmsCharacterGalleryOverview
            characterId={selectedEntryId}
            onEdit={onEditGalleryEntry}
            onUpload={onUploadGalleryAsset}
            pending={pending}
            studio={studio}
          />
        </CharacterEditorSection>
        <CharacterEditorSection
          description="Explain what fans may create and how the work may be shared."
          id="character-fanwork"
          title="Fanwork Policy"
        >
          <CmsStructuredFields
            definitions={characterFields.fanwork}
            draft={draft}
            onChange={onDraftChange}
            onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
          />
        </CharacterEditorSection>
      </>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-gray-800">
      <div
        className={`px-4 pt-6 pr-16 pb-4 sm:px-6 sm:pr-18 ${isBlog ? "border-b border-zinc-200 bg-linear-to-br from-red-50 via-white to-orange-50 dark:border-zinc-800 dark:from-red-950/30 dark:via-zinc-950 dark:to-zinc-950" : "border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_30%)] dark:border-slate-700"}`}
      >
        {isBlog ? (
          <p className="text-xs font-semibold tracking-[0.32em] text-red-700 uppercase dark:text-red-300">
            {selectedEntryId ? "Edit post" : "New post"}
          </p>
        ) : null}
        <h2 className="truncate text-2xl font-bold text-gray-900 dark:text-white">
          {selectedEntryId ? `Edit ${itemName}` : `Create New ${itemName}`}
        </h2>
        {isBlog ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Shape the story, choose its cover, and control who can read it.
          </p>
        ) : null}
      </div>

      {!isConnectionEntry ? (
        <CmsEditorTabs
          activeTab={activeTab}
          onChange={scrollToSection}
          tabs={tabs}
          theme={theme}
        />
      ) : null}

      {uploadStatus ? (
        <div
          aria-live="polite"
          className="mx-4 mt-3 rounded-xl border border-cyan-200 bg-cyan-50/95 px-4 py-3 shadow-sm sm:mx-6 dark:border-cyan-900/70 dark:bg-cyan-950/55"
        >
          <div className="flex items-center gap-3">
            <UploadCloud className="h-4 w-4 shrink-0 text-cyan-700 dark:text-cyan-300" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold text-cyan-950 dark:text-cyan-100">
                <span className="truncate">
                  {uploadStatus.stage === "preparing"
                    ? "Preparing"
                    : uploadStatus.stage === "saving"
                      ? "Finishing"
                      : "Uploading"}{" "}
                  {uploadStatus.fileName}
                </span>
                <span>{uploadStatus.percentage}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cyan-950/10 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-linear-to-r from-cyan-500 to-blue-500 transition-[width] duration-200"
                  style={{ width: `${uploadStatus.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6"
        onScroll={isCharacter ? undefined : updateActiveSection}
        ref={scrollAreaRef}
      >
        {isConnectionEntry ? (
          <CmsConnectionEntryEditor
            allowedBlockTypes={allowedBlockTypes}
            blocks={blocks}
            collectionSlug={collection.slug}
            definitions={definitions}
            duplicate={duplicateConnection}
            draft={draft}
            fields={fields.filter(
              (field) =>
                ![
                  "displayOrder",
                  "display_order",
                  "sortOrder",
                  "sort_order",
                ].includes(field.key),
            )}
            onBlocksChange={onBlocksChange}
            onDraftChange={onDraftChange}
            onRelationsChange={onRelationsChange}
            relationSelections={relationSelections}
            studio={studio}
          />
        ) : isCharacter ? (
          <section
            aria-labelledby={`cms-${activeTab}-tab`}
            className="space-y-4"
            id={`cms-${activeTab}-panel`}
          >
            <nav
              aria-label="Sections in this tab"
              className="sticky top-0 z-20 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/95"
            >
              {characterSubsections[
                activeTab as keyof typeof characterSubsections
              ].map((subsection) => (
                <button
                  className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-800 dark:text-slate-300 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-200"
                  key={subsection.id}
                  onClick={() => scrollToCharacterSubsection(subsection.id)}
                  type="button"
                >
                  {subsection.label}
                </button>
              ))}
            </nav>
            {renderCharacterSection()}
          </section>
        ) : (
          tabs.map((tab, index) => (
            <EditorTabSection
              active={activeTab === tab.id}
              id={`cms-${tab.id}-panel`}
              initialOpen={index === 0}
              key={tab.id}
              label={tab.label}
              labelledBy={`cms-${tab.id}-tab`}
            >
              {renderSection(tab.id)}
            </EditorTabSection>
          ))
        )}
      </div>

      <div
        className={`sticky bottom-0 flex flex-col-reverse items-stretch gap-2 border-t px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-4 ${isBlog ? "border-zinc-200 bg-[#fffaf6]/95 dark:border-zinc-800 dark:bg-zinc-950/95" : "border-gray-300 bg-white/95 dark:border-gray-600 dark:bg-gray-800/95"}`}
      >
        <div>
          {selectedEntryId ? (
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50 sm:w-auto dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
              disabled={pending}
              onClick={() => setConfirmingDelete(true)}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          ) : null}
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button
            className="w-full rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50 sm:w-auto dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            disabled={pending}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`inline-flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${isBlog ? "rounded-full bg-cyan-700 hover:bg-cyan-600 dark:bg-cyan-500 dark:text-zinc-950 dark:hover:bg-cyan-400" : "rounded bg-blue-600 hover:bg-blue-700"}`}
            disabled={!canSave}
            onClick={onSave}
            type="button"
          >
            <Save className="h-4 w-4" />
            {pending
              ? "Saving..."
              : selectedEntryId
                ? isConnectionEntry
                  ? "Save changes"
                  : `Update ${itemName}`
                : isConnectionEntry
                  ? collection.slug === "character-relationships"
                    ? "Add relationship"
                    : "Add membership"
                  : `Create ${itemName}`}
          </button>
        </div>
      </div>

      <ConfirmDeleteDialog
        isOpen={confirmingDelete}
        loading={pending}
        message={
          isConnectionEntry
            ? "This connection will be permanently removed from the wiki."
            : `“${draft.title}” and everything attached to it will be permanently removed.`
        }
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => {
          setConfirmingDelete(false);
          onDelete();
        }}
        title={`Delete this ${itemName.toLowerCase()}?`}
      />
    </div>
  );
}
