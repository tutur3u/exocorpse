"use client";

import CmsEntryEditor from "@/components/admin/cms-management/CmsEntryEditor";
import CmsEntryEditorDialog from "@/components/admin/cms-management/CmsEntryEditorDialog";
import CmsEntryGallery from "@/components/admin/cms-management/CmsEntryGallery";
import { CONNECTION_COLLECTION_SLUGS } from "@/components/admin/cms-management/connection-entry-utils";
import { adminCmsTheme } from "@/components/admin/cms-management/admin-theme";
import {
  collectionItemLabel,
  collectionTabLabel,
} from "@/components/admin/cms-management/collection-copy";
import { buildCmsEntryGalleryFilter } from "@/components/admin/cms-management/gallery-utils";
import { isJsonRecord } from "@/components/admin/cms-management/editor-utils";
import { useCmsManagementWorkspace } from "@/components/admin/cms-management/useCmsManagementWorkspace";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import type { AdminCmsSection } from "@/lib/admin-cms-sections";
import type { ExocorpseCmsStudio } from "@/types/exocorpse-cms";
import { ChevronDown, Library, RefreshCw, Settings2, X } from "lucide-react";
import { useState } from "react";

export default function CmsManagementWorkspace({
  cmsHref,
  initialStudio,
  section,
}: {
  cmsHref: string;
  initialStudio: ExocorpseCmsStudio;
  section: AdminCmsSection;
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [relatedTarget, setRelatedTarget] = useState<{
    id: string;
    relationKey: string;
  } | null>(null);
  const [aboutTab, setAboutTab] = useState<
    "profile" | "about" | "faq" | "dni" | "socials"
  >("profile");
  const workspace = useCmsManagementWorkspace({ initialStudio, section });
  const {
    assets,
    blocks,
    changeTitle,
    collection,
    config,
    createEntry,
    definitions,
    deleteAsset,
    deleteEntry,
    draft,
    entries,
    entryId,
    fields,
    message,
    pending,
    relationSelections,
    reorderEntries,
    reorderAssets,
    save,
    selectCollection,
    setBlocks,
    setDraft,
    setEntryId,
    setMessage,
    setRelationSelections,
    studio,
    uploadAsset,
    visibleCollections,
  } = workspace;

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
  const relationFilter = buildCmsEntryGalleryFilter(studio, collection.id);
  const itemLabel = collectionItemLabel(collection);
  const theme = adminCmsTheme(section.key);
  const canCreate =
    !["about", "portfolio"].includes(section.key) &&
    collection.slug !== "about";
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
    createEntry();
    if (relatedTarget) {
      const relation = definitions.find(
        (definition) => definition.key === relatedTarget.relationKey,
      );
      if (relation) {
        setRelationSelections((current) => ({
          ...current,
          [relation.id]: [relatedTarget.id],
        }));
      }
    }
    setEditorOpen(true);
  };

  const collectionButton = (
    item: (typeof visibleCollections)[number],
    variant: "pill" | "tab" = "pill",
  ) => {
    const count = studio.entries.filter(
      (entry) => entry.collection_id === item.id,
    ).length;
    return (
      <button
        className={`flex shrink-0 items-center gap-2 text-sm font-medium transition ${
          variant === "tab"
            ? "border-b-2 px-1 py-4 whitespace-nowrap"
            : "rounded-lg px-3 py-2"
        } ${
          item.id === collection.id
            ? variant === "tab"
              ? theme.activeTab
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
        {collectionTabLabel(item)}
        <span className="rounded-full bg-current/10 px-1.5 py-0.5 text-[10px] opacity-75">
          {count}
        </span>
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
        relatedTarget?.relationKey.startsWith("character")
          ? relatedTarget.id
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
      onDelete={(entry) => setDeletingEntryId(entry.id)}
      onOpenCollection={(slug, targetId, relationKey) => {
        const target = visibleCollections.find((item) => item.slug === slug);
        if (target) {
          setRelatedTarget(
            targetId && relationKey ? { id: targetId, relationKey } : null,
          );
          selectCollection(target.id);
        }
      }}
      onReorder={reorderEntries}
      onSelect={(nextEntryId) => {
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

  const supportingNavigation = supportingCollections.length ? (
    <details className="group rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 marker:content-none dark:text-gray-300">
        <Settings2 className="h-4 w-4 text-gray-400" />
        <span className="flex-1">More content</span>
        <span className="text-xs font-normal text-gray-500">
          {supportingCollections.length} types
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400 transition group-open:rotate-180" />
      </summary>
      <div className="flex flex-wrap gap-1 border-t border-gray-200 p-2 dark:border-gray-800">
        {supportingCollections.map((item) => collectionButton(item))}
      </div>
    </details>
  ) : null;
  const relatedContentNavigation =
    section.key === "characters" ? (
      <nav
        aria-label="Character content"
        className="-mb-px flex gap-6 overflow-x-auto rounded-lg border border-gray-200 bg-white px-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        {[
          "characters",
          "character-gallery",
          "character-outfits",
          "character-relationships",
          "character-factions",
        ]
          .map((slug) =>
            [...primaryCollections, ...supportingCollections].find(
              (item) => item.slug === slug,
            ),
          )
          .filter((item) => item !== undefined)
          .map((item) => collectionButton(item, "tab"))}
      </nav>
    ) : null;

  return (
    <div className="@container space-y-6">
      <AdminPageHeader
        actions={
          <>
            {canCreate ? (
              <button
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 ${theme.button}`}
                onClick={beginCreateEntry}
                type="button"
              >
                + {createActionLabel}
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
                Advanced library
              </a>
            ) : null}
          </>
        }
        title={section.title}
      />

      {message ? (
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
        <>
          {relatedContentNavigation}
          {!relatedContentNavigation && primaryCollections.length > 1 ? (
            <nav
              aria-label={`${section.title} content`}
              className="-mb-px flex gap-6 overflow-x-auto rounded-lg border border-gray-200 bg-white px-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              {primaryCollections.map((item) => collectionButton(item, "tab"))}
            </nav>
          ) : null}
          {section.key === "cms" ? supportingNavigation : null}
          {entryGallery}
        </>
      )}

      {editorOpen ? (
        <CmsEntryEditorDialog
          onClose={() => setEditorOpen(false)}
          title={
            entryId
              ? CONNECTION_COLLECTION_SLUGS.has(collection.slug)
                ? `Edit ${itemLabel}`
                : `Edit ${draft.title}`
              : `Add ${itemLabel}`
          }
          variant={section.key === "blog-posts" ? "blog" : "default"}
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
            onDelete={() => {
              deleteEntry();
              setEditorOpen(false);
            }}
            onDeleteAsset={deleteAsset}
            onDraftChange={setDraft}
            onRelationsChange={setRelationSelections}
            onReorderAssets={reorderAssets}
            onSave={save}
            onCancel={() => setEditorOpen(false)}
            onTitleChange={changeTitle}
            onUploadAsset={uploadAsset}
            onOpenCollection={(slug) => {
              const target = visibleCollections.find(
                (item) => item.slug === slug,
              );
              if (!target) return;
              setRelatedTarget(
                entryId ? { id: entryId, relationKey: "character" } : null,
              );
              selectCollection(target.id);
              setEditorOpen(false);
            }}
            pending={pending}
            relationSelections={relationSelections}
            selectedEntryId={entryId}
            studio={studio}
            theme={theme}
          />
        </CmsEntryEditorDialog>
      ) : null}

      <ConfirmDeleteDialog
        isOpen={Boolean(deletingEntryId)}
        loading={pending}
        message="This item and everything attached to it will be permanently removed."
        onCancel={() => setDeletingEntryId(null)}
        onConfirm={() => {
          if (deletingEntryId) deleteEntry(deletingEntryId);
          setDeletingEntryId(null);
        }}
        title="Delete this item?"
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
