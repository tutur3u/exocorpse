"use client";

import CmsEntryEditor from "@/components/admin/cms-management/CmsEntryEditor";
import CmsEntryEditorDialog from "@/components/admin/cms-management/CmsEntryEditorDialog";
import CmsEntryGallery from "@/components/admin/cms-management/CmsEntryGallery";
import { adminCmsTheme } from "@/components/admin/cms-management/admin-theme";
import {
  collectionItemLabel,
  collectionTabLabel,
} from "@/components/admin/cms-management/collection-copy";
import { buildCmsEntryGalleryFilter } from "@/components/admin/cms-management/gallery-utils";
import { isJsonRecord } from "@/components/admin/cms-management/editor-utils";
import { useCmsManagementWorkspace } from "@/components/admin/cms-management/useCmsManagementWorkspace";
import { cmsCollectionIcon } from "@/components/admin/admin-navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import type { AdminCmsSection } from "@/lib/admin-cms-sections";
import type { ExocorpseCmsStudio } from "@/types/exocorpse-cms";
import {
  ChevronDown,
  Library,
  Plus,
  RefreshCw,
  Settings2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function CmsManagementWorkspace({
  cmsHref,
  initialStudio,
  section,
}: {
  cmsHref: string;
  initialStudio: ExocorpseCmsStudio;
  section: AdminCmsSection;
}) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [manager, setManager] = useState<{
    collectionId: string;
    title: string;
  } | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const [hasPendingMedia, setHasPendingMedia] = useState(false);
  const [relatedTarget, setRelatedTarget] = useState<{
    id: string;
    relationKey: string;
  } | null>(null);
  const [aboutTab, setAboutTab] = useState<
    "profile" | "about" | "faq" | "dni" | "socials"
  >("profile");
  const workspace = useCmsManagementWorkspace({ initialStudio, section });
  const [editorParents, setEditorParents] = useState<
    Array<{
      snapshot: ReturnType<typeof workspace.captureEditor>;
      tab: import("./CmsEditorTabs").CmsEditorTab;
    }>
  >([]);
  const [editorInitialTab, setEditorInitialTab] =
    useState<import("./CmsEditorTabs").CmsEditorTab>("basic");
  const {
    assets,
    blocks,
    cancelUploads,
    captureEditor,
    restoreEditor,
    changeTitle,
    collection,
    config,
    createEntry,
    createEntryForCollection,
    definitions,
    deleteAsset,
    deleteEntry,
    discardChanges,
    draft,
    entries,
    entryId,
    fields,
    isDirty,
    message,
    pending,
    relationSelections,
    linkedServiceIds,
    setLinkedServiceIds,
    reorderEntries,
    reorderAssets,
    save,
    selectCollection,
    setEntryVisibility,
    setBlocks,
    setDraft,
    setEntryId,
    setMessage,
    setRelationSelections,
    studio,
    uploadAsset,
    uploadCharacterGalleryAsset,
    uploadInlineAsset,
    uploadStatus,
    pendingUploadFile,
    setPendingUploadFile,
    uploading,
    visibleCollections,
  } = workspace;

  const hasUnsavedEditorWork =
    isDirty || hasPendingMedia || Boolean(pendingUploadFile) || uploading;
  const handlePendingMediaChange = useCallback(
    (hasPendingFile: boolean) => setHasPendingMedia(hasPendingFile),
    [],
  );

  useEffect(() => {
    if (!editorOpen || !hasUnsavedEditorWork) return;
    const preventAccidentalNavigation = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", preventAccidentalNavigation);
    return () =>
      window.removeEventListener("beforeunload", preventAccidentalNavigation);
  }, [editorOpen, hasUnsavedEditorWork]);

  if (!collection) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
        This content area is not ready yet. Please refresh the page or try again
        in a moment.
      </div>
    );
  }

  const primaryCollectionSlugs = new Set(
    section.primaryCollectionSlugs ??
      (section.collectionSlugs.length ? section.collectionSlugs : []),
  );
  const primaryCollections = primaryCollectionSlugs.size
    ? visibleCollections.filter((item) => primaryCollectionSlugs.has(item.slug))
    : visibleCollections;
  const supportingCollections = primaryCollectionSlugs.size
    ? visibleCollections.filter(
        (item) => !primaryCollectionSlugs.has(item.slug),
      )
    : [];
  const inlineCharacterCollections = new Set([
    "character-factions",
    "character-gallery",
    "character-locations",
    "character-outfits",
    "character-relationships",
    "outfit-types",
    "relationship-types",
  ]);
  const visibleSupportingCollections =
    section.key === "characters"
      ? supportingCollections.filter(
          (item) => !inlineCharacterCollections.has(item.slug),
        )
      : supportingCollections;
  const relationFilter = buildCmsEntryGalleryFilter(
    studio,
    collection.id,
    manager ? relatedTarget?.relationKey : undefined,
  );
  const itemLabel = collectionItemLabel(collection);
  const theme = adminCmsTheme(section.key);
  const canCreate =
    !["about", "portfolio"].includes(section.key) &&
    collection.slug !== "about" &&
    collection.slug !== "relationship-types" &&
    (section.key !== "factions" || Boolean(relatedTarget));
  const createActionLabel =
    section.key === "services"
      ? "Create Service"
      : section.key === "addons"
        ? "Create Add-on"
        : `New ${itemLabel.replace(/^./, (letter) => letter.toUpperCase())}`;
  const visibleEntries =
    section.key !== "about" || collection.slug !== "about-content"
      ? entries
      : entries.filter((entry) => {
          const profile = isJsonRecord(entry.profile_data)
            ? entry.profile_data
            : {};
          const entrySection = profile.section;
          if (aboutTab === "dni") {
            return entrySection === "dni_soft" || entrySection === "dni_hard";
          }
          if (aboutTab === "socials") return entrySection === "social_link";
          return !["dni_soft", "dni_hard", "social_link"].includes(
            String(entrySection),
          );
        });

  const beginCreateEntry = () => {
    setEditorParents([]);
    setEditorInitialTab("basic");
    const relation = relatedTarget
      ? definitions.find(
          (definition) => definition.key === relatedTarget.relationKey,
        )
      : undefined;
    createEntry(
      {},
      relation && relatedTarget
        ? { [relation.id]: [relatedTarget.id] }
        : undefined,
    );
    setEditorOpen(true);
  };

  const returnToParentEditor = () => {
    const parent = editorParents.at(-1);
    if (!parent) {
      setEditorOpen(false);
      return;
    }
    restoreEditor(parent.snapshot);
    setEditorInitialTab(parent.tab);
    setEditorParents((parents) => parents.slice(0, -1));
  };
  const beginRelatedEditor = (
    slug: string,
    childId?: string,
    parentId?: string,
    relationKey?: string,
  ) => {
    const target = visibleCollections.find((item) => item.slug === slug);
    if (!target || uploading) return;
    const tab =
      collection.slug === "commission-services"
        ? "styles"
        : slug === "character-outfits"
          ? "outfits"
          : "gallery";
    setEditorParents((parents) => [
      ...parents,
      { snapshot: captureEditor(), tab },
    ]);
    setEditorInitialTab("basic");
    if (childId) {
      selectCollection(target.id);
      setEntryId(childId);
    } else {
      const initialRelations =
        parentId && relationKey ? { [relationKey]: [parentId] } : {};
      if (slug === "commission-pictures" && relationKey === "style") {
        const styleCollection = studio.collections.find(
          (item) => item.slug === "commission-styles",
        );
        const serviceDefinition = studio.relationDefinitions?.find(
          (item) =>
            item.source_collection_id === styleCollection?.id &&
            item.key === "service",
        );
        const serviceId = studio.relations?.find(
          (item) =>
            item.from_entry_id === parentId &&
            item.relation_definition_id === serviceDefinition?.id,
        )?.to_entry_id;
        if (serviceId) initialRelations.service = [serviceId];
      }
      createEntryForCollection(target.id, initialRelations);
    }
  };

  const finishEditorExit = () => {
    setConfirmingDiscard(false);
    setHasPendingMedia(false);
    if (editorParents.length) returnToParentEditor();
    else setEditorOpen(false);
  };

  const requestEditorExit = () => {
    if (pending) return;
    if (hasUnsavedEditorWork) {
      setConfirmingDiscard(true);
      return;
    }
    finishEditorExit();
  };

  const discardAndExitEditor = () => {
    cancelUploads();
    discardChanges();
    finishEditorExit();
  };

  const collectionButton = (
    item: (typeof visibleCollections)[number],
    variant: "pill" | "tab" = "pill",
  ) => {
    const count = studio.entries.filter(
      (entry) => entry.collection_id === item.id,
    ).length;
    const Icon = cmsCollectionIcon(item.slug);
    return (
      <button
        aria-current={item.id === collection.id ? "page" : undefined}
        title={collectionTabLabel(item)}
        className={`flex shrink-0 items-center gap-2 text-sm font-medium transition ${
          variant === "tab"
            ? "border-b-2 px-1 py-3 whitespace-nowrap"
            : "rounded-lg px-3 py-2"
        } ${
          item.id === collection.id
            ? variant === "tab"
              ? section.key === "characters"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : theme.activeTab
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            : variant === "tab"
              ? "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        }`}
        key={item.id}
        onClick={() => {
          setRelatedTarget(null);
          selectCollection(item.id);
        }}
        type="button"
      >
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        {collectionTabLabel(item)}
        {section.key === "cms" ? (
          <span className="rounded-full bg-current/10 px-1.5 py-0.5 text-[10px] opacity-75">
            {count}
          </span>
        ) : null}
      </button>
    );
  };

  const entryGallery = (
    <CmsEntryGallery
      aboutTab={aboutTab}
      assets={studio.assets}
      collection={collection}
      entries={visibleEntries}
      initialRelationTargetId={
        manager || relatedTarget?.relationKey.startsWith("character")
          ? relatedTarget?.id
          : undefined
      }
      key={collection.id}
      onCreate={(profileData) => {
        if (profileData && Object.keys(profileData).length) {
          createEntry(profileData);
          setEditorOpen(true);
          return;
        }
        beginCreateEntry();
      }}
      onDelete={setDeleteTargetId}
      onContextChange={(id, relationKey) =>
        setRelatedTarget(id ? { id, relationKey } : null)
      }
      onSetVisibility={setEntryVisibility}
      onOpenCollection={(slug, targetId, relationKey) => {
        const target = visibleCollections.find((item) => item.slug === slug);
        if (target) {
          setManager({
            collectionId: collection.id,
            title: `${studio.entries.find((entry) => entry.id === targetId)?.title ?? collection.title} — ${collectionTabLabel(target)}`,
          });
          setRelatedTarget(
            targetId && relationKey ? { id: targetId, relationKey } : null,
          );
          selectCollection(target.id);
        }
      }}
      onReorder={reorderEntries}
      onSelect={(nextEntryId) => {
        setEditorParents([]);
        setEditorInitialTab("basic");
        setEntryId(nextEntryId);
        setEditorOpen(true);
      }}
      relationFilter={relationFilter}
      sectionKey={section.key}
      studio={studio}
      supportsImages={config.assetTypes.includes("image")}
      theme={theme}
    />
  );

  const supportingNavigation = visibleSupportingCollections.length ? (
    <details className="group rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 marker:content-none dark:text-gray-300">
        <Settings2 className="h-4 w-4 text-gray-400" />
        <span className="flex-1">More content</span>
        <span className="text-xs font-normal text-gray-500">
          {visibleSupportingCollections.length} types
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400 transition group-open:rotate-180" />
      </summary>
      <div className="flex flex-wrap gap-1 border-t border-gray-200 p-2 dark:border-gray-800">
        {visibleSupportingCollections.map((item) => collectionButton(item))}
      </div>
    </details>
  ) : null;
  return (
    <div className="@container space-y-4">
      {section.key !== "blog-posts" ? (
        <AdminPageHeader
          actions={
            <>
              {canCreate ? (
                <button
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors ${theme.button}`}
                  onClick={beginCreateEntry}
                  type="button"
                >
                  <Plus className="size-4" aria-hidden="true" />{" "}
                  {createActionLabel}
                </button>
              ) : null}
              {section.key === "cms" ? (
                <a
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  href={cmsHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Library className="h-3.5 w-3.5" />
                  Content library
                </a>
              ) : null}
            </>
          }
          title={
            section.key === "portfolio" ? "Portfolio Management" : section.title
          }
          description={section.description.replace(/\.$/, "")}
        />
      ) : null}

      {message && (!editorOpen || message.kind === "success") ? (
        <div
          className={`fixed top-5 right-5 z-[70] flex max-w-md items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl ${
            message.kind === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
              : "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100"
          }`}
          role="status"
        >
          <span>{message.text}</span>
          <button
            aria-label="Dismiss message"
            className="rounded-lg p-1 transition hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => setMessage(null)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {section.key === "about" ? (
        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-[1.75rem] border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <nav aria-label={`${section.title} content`} className="space-y-2">
              {[
                ["profile", "Profile"],
                ["about", "About"],
                ["faq", "FAQ"],
                ["dni", "DNI"],
                ["socials", "Socials"],
              ].map(([id, label]) => (
                <button
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    aboutTab === id
                      ? "border-cyan-300 bg-cyan-50 shadow-sm dark:border-cyan-800 dark:bg-cyan-950/30"
                      : "border-transparent bg-gray-50 hover:border-gray-200 hover:bg-white dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:bg-gray-950"
                  }`}
                  key={id}
                  onClick={() => {
                    const nextTab = id as typeof aboutTab;
                    setAboutTab(nextTab);
                    const targetSlug =
                      nextTab === "profile"
                        ? "about"
                        : nextTab === "faq"
                          ? "about-faqs"
                          : "about-content";
                    const target = primaryCollections.find(
                      (item) => item.slug === targetSlug,
                    );
                    if (target) selectCollection(target.id);
                  }}
                  type="button"
                >
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {label}
                  </p>
                </button>
              ))}
            </nav>
          </aside>
          <div className="min-w-0 space-y-6">{entryGallery}</div>
        </div>
      ) : section.key === "portfolio" ? (
        <div className="rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
          <nav
            aria-label={`${section.title} content`}
            className="-mb-px flex gap-8 overflow-x-auto border-b border-gray-200 px-6 dark:border-gray-700"
          >
            {primaryCollections.map((item) => collectionButton(item, "tab"))}
          </nav>
          <div className="p-6">{entryGallery}</div>
        </div>
      ) : (
        <div className="space-y-6">
          {primaryCollections.length > 1 && section.key !== "services" ? (
            <nav
              aria-label={`${section.title} content`}
              className="-mb-px flex gap-8 overflow-x-auto border-b border-gray-200 dark:border-gray-700"
            >
              {primaryCollections.map((item) => collectionButton(item, "tab"))}
            </nav>
          ) : null}
          {section.key === "cms" ? supportingNavigation : null}
          {entryGallery}
        </div>
      )}

      {manager ? (
        <CmsEntryEditorDialog
          collectionSlug={collection.slug}
          title={manager.title}
          onClose={() => {
            setManager(null);
            setRelatedTarget(null);
            selectCollection(manager.collectionId);
          }}
        >
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
            <h2 className="text-2xl font-bold">{manager.title}</h2>
            <button
              className="rounded bg-gray-200 px-4 py-2 text-sm dark:bg-gray-700"
              onClick={() => {
                setManager(null);
                setRelatedTarget(null);
                selectCollection(manager.collectionId);
              }}
              type="button"
            >
              Close
            </button>
          </div>
          <div className="min-h-0 space-y-4 overflow-y-auto p-6">
            {collection.slug === "character-gallery" ||
            collection.slug === "location-gallery" ? (
              <button
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                onClick={beginCreateEntry}
                type="button"
              >
                + Add {itemLabel}
              </button>
            ) : null}
            {entryGallery}
          </div>
        </CmsEntryEditorDialog>
      ) : null}

      {editorOpen ? (
        <CmsEntryEditorDialog
          onClose={requestEditorExit}
          title={
            entryId
              ? `Edit ${itemLabel.replace(/^./, (letter) => letter.toUpperCase())}`
              : `Create New ${itemLabel.replace(/^./, (letter) => letter.toUpperCase())}`
          }
          variant={section.key === "blog-posts" ? "blog" : "default"}
          collectionSlug={collection.slug}
        >
          <CmsEntryEditor
            allowedAssetTypes={config.assetTypes}
            allowedBlockTypes={config.blockTypes}
            assets={assets}
            blocks={blocks}
            collection={collection}
            definitions={definitions}
            draft={draft}
            fields={fields}
            key={`${collection.id}:${entryId || "new"}`}
            onBlocksChange={setBlocks}
            onDelete={() => deleteEntry(undefined, returnToParentEditor)}
            onDeleteAsset={deleteAsset}
            onDraftChange={setDraft}
            onRelationsChange={setRelationSelections}
            onReorderAssets={reorderAssets}
            onSave={() => save(returnToParentEditor)}
            initialTab={editorInitialTab}
            onDeleteRelated={setDeleteTargetId}
            onEditRelated={(slug, childId) => beginRelatedEditor(slug, childId)}
            onCreateRelated={(slug, parentId, relationKey) =>
              beginRelatedEditor(slug, undefined, parentId, relationKey)
            }
            onCancel={() => {
              requestEditorExit();
            }}
            onTitleChange={changeTitle}
            onUploadAsset={uploadAsset}
            onUploadGalleryAsset={(file, title) =>
              uploadCharacterGalleryAsset(file, entryId, title)
            }
            onUploadInlineAsset={uploadInlineAsset}
            onEditGalleryEntry={(childId) =>
              beginRelatedEditor("character-gallery", childId)
            }
            onEditRelationshipEntry={(childId) =>
              beginRelatedEditor("character-relationships", childId)
            }
            onCreateRelationshipEntry={() =>
              beginRelatedEditor(
                "character-relationships",
                undefined,
                entryId,
                "character-a",
              )
            }
            isDirty={isDirty}
            linkedServiceIds={linkedServiceIds}
            onLinkedServicesChange={setLinkedServiceIds}
            onPendingMediaChange={handlePendingMediaChange}
            onPendingUploadFileChange={setPendingUploadFile}
            pendingUploadFileName={pendingUploadFile?.name}
            error={message?.kind === "error" ? message.text : undefined}
            pending={pending}
            relationSelections={relationSelections}
            selectedEntryId={entryId}
            studio={studio}
            showPublishingControls={section.key === "cms"}
            theme={theme}
            uploadStatus={uploadStatus}
          />
        </CmsEntryEditorDialog>
      ) : null}

      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTargetId)}
        loading={pending}
        title={`Delete ${collectionItemLabel(
          studio.collections.find(
            (item) =>
              item.id ===
              studio.entries.find((entry) => entry.id === deleteTargetId)
                ?.collection_id,
          ) ?? collection,
        ).replace(/^./, (letter) => letter.toUpperCase())}`}
        message={`Are you sure you want to delete “${studio.entries.find((entry) => entry.id === deleteTargetId)?.title ?? "this item"}”? This action cannot be undone.`}
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId)
            deleteEntry(deleteTargetId, () => setDeleteTargetId(null));
        }}
      />

      <ConfirmDeleteDialog
        confirmText="Discard changes"
        isOpen={confirmingDiscard}
        message={
          uploading
            ? "A media upload is still in progress. Leaving now will cancel it and discard every unsaved change."
            : hasPendingMedia
              ? "The selected media has not been uploaded. Leaving now will clear it and discard every unsaved change."
              : "Your unsaved changes will be discarded."
        }
        onCancel={() => setConfirmingDiscard(false)}
        onConfirm={discardAndExitEditor}
        title="Discard unsaved changes?"
      />

      {pending ? (
        <div className="fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-zinc-950">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          Saving your changes…
        </div>
      ) : null}
    </div>
  );
}
