"use client";

import {
  deleteAdminCmsAsset,
  deleteAdminCmsEntry,
  saveAdminCmsEntry,
  uploadAdminCmsAsset,
} from "@/lib/actions/cms";
import type {
  ExocorpseCmsEntry,
  ExocorpseCmsStudio,
  ExocorpseJson,
} from "@/types/exocorpse-cms";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

function emptyEntry(collectionId: string): ExocorpseCmsEntry {
  const now = new Date().toISOString();
  return {
    collection_id: collectionId,
    created_at: now,
    id: "",
    metadata: {},
    profile_data: {},
    published_at: null,
    scheduled_for: null,
    slug: "",
    sort_order: 0,
    stable_source_id: null,
    status: "draft",
    subtitle: null,
    summary: null,
    title: "",
    updated_at: now,
  };
}

export default function CmsAdminClient({
  initialStudio,
}: {
  initialStudio: ExocorpseCmsStudio;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [collectionId, setCollectionId] = useState(
    initialStudio.collections[0]?.id ?? "",
  );
  const [entryId, setEntryId] = useState("");
  const [draft, setDraft] = useState(() => emptyEntry(collectionId));
  const [blocksJson, setBlocksJson] = useState("[]");
  const [relationSelections, setRelationSelections] = useState<
    Record<string, string[]>
  >({});
  const [message, setMessage] = useState<string | null>(null);

  const collection = initialStudio.collections.find(
    (item) => item.id === collectionId,
  );
  const entries = initialStudio.entries.filter(
    (entry) => entry.collection_id === collectionId,
  );
  const selectedEntry = useMemo(
    () => initialStudio.entries.find((entry) => entry.id === entryId),
    [entryId, initialStudio.entries],
  );
  const definitions = useMemo(
    () =>
      (initialStudio.relationDefinitions ?? []).filter(
        (definition) => definition.source_collection_id === collectionId,
      ),
    [collectionId, initialStudio.relationDefinitions],
  );
  const assets = initialStudio.assets.filter(
    (asset) => asset.entry_id === entryId,
  );

  useEffect(() => {
    const next = selectedEntry ?? emptyEntry(collectionId);
    setDraft(next);
    setBlocksJson(
      JSON.stringify(
        initialStudio.blocks
          .filter((block) => block.entry_id === selectedEntry?.id)
          .map((block) => ({
            blockType: block.block_type,
            content: block.content,
            id: block.id,
            sortOrder: block.sort_order,
            stableSourceId: block.stable_source_id,
            title: block.title,
          })),
        null,
        2,
      ),
    );
    setRelationSelections(
      Object.fromEntries(
        definitions.map((definition) => [
          definition.id,
          (initialStudio.relations ?? [])
            .filter(
              (relation) =>
                relation.from_entry_id === selectedEntry?.id &&
                relation.relation_definition_id === definition.id,
            )
            .map((relation) => relation.to_entry_id),
        ]),
      ),
    );
  }, [
    collectionId,
    definitions,
    initialStudio.blocks,
    initialStudio.relations,
    selectedEntry,
  ]);

  const relationOptions = useMemo(
    () =>
      Object.fromEntries(
        definitions.map((definition) => {
          const targetIds = new Set(
            (initialStudio.relationDefinitionTargets ?? [])
              .filter(
                (target) => target.relation_definition_id === definition.id,
              )
              .map((target) => target.target_collection_id),
          );
          return [
            definition.id,
            initialStudio.entries.filter(
              (entry) =>
                targetIds.has(entry.collection_id) && entry.id !== entryId,
            ),
          ];
        }),
      ),
    [definitions, entryId, initialStudio],
  );

  function run(operation: () => Promise<unknown>, success: string) {
    setMessage(null);
    startTransition(async () => {
      try {
        await operation();
        setMessage(success);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Operation failed");
      }
    });
  }

  function save() {
    let blocks: Array<{
      blockType: string;
      content: ExocorpseJson;
      id?: string;
      sortOrder?: number;
      stableSourceId?: string | null;
      title?: string | null;
    }>;
    try {
      blocks = JSON.parse(blocksJson) as typeof blocks;
      if (!Array.isArray(blocks)) throw new Error();
    } catch {
      setMessage("Blocks must be a valid JSON array.");
      return;
    }

    run(
      () =>
        saveAdminCmsEntry({
          blocks,
          entry: {
            collectionId,
            metadata: draft.metadata,
            profileData: draft.profile_data,
            slug: draft.slug,
            sortOrder: draft.sort_order,
            status: draft.status,
            subtitle: draft.subtitle,
            summary: draft.summary,
            title: draft.title,
          },
          entryId: selectedEntry?.id,
          expectedUpdatedAt: selectedEntry?.updated_at,
          relations: definitions.flatMap((definition) =>
            (relationSelections[definition.id] ?? []).map(
              (toEntryId, sortOrder) => ({
                definitionId: definition.id,
                sortOrder,
                toEntryId,
              }),
            ),
          ),
        }),
      selectedEntry ? "Entry updated." : "Entry created.",
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tuturuuu CMS Editor
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Edit Exocorpse entries, blocks, media, publication, and UUID
          relations.
        </p>
      </div>

      {message ? (
        <div className="rounded-lg border border-blue-300 bg-blue-50 p-3 text-sm text-blue-900">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <aside className="space-y-3 rounded-xl border bg-white p-4 dark:bg-gray-950">
          <label className="block text-sm font-medium">Collection</label>
          <select
            className="w-full rounded-lg border p-2 dark:bg-gray-900"
            value={collectionId}
            onChange={(event) => {
              setCollectionId(event.target.value);
              setEntryId("");
            }}
          >
            {initialStudio.collections.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <button
            className="w-full rounded-lg border p-2 text-left font-medium"
            onClick={() => setEntryId("")}
            type="button"
          >
            + New entry
          </button>
          <div className="max-h-[60vh] space-y-1 overflow-auto">
            {entries.map((entry) => (
              <button
                className="w-full rounded-lg border p-2 text-left text-sm"
                key={entry.id}
                onClick={() => setEntryId(entry.id)}
                type="button"
              >
                <span className="block font-medium">{entry.title}</span>
                <span className="text-gray-500">{entry.status}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-5 rounded-xl border bg-white p-5 dark:bg-gray-950">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span>Title</span>
              <input
                className="w-full rounded-lg border p-2 dark:bg-gray-900"
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Slug</span>
              <input
                className="w-full rounded-lg border p-2 dark:bg-gray-900"
                value={draft.slug}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    slug: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <label className="block space-y-1 text-sm">
            <span>Summary</span>
            <textarea
              className="min-h-24 w-full rounded-lg border p-2 dark:bg-gray-900"
              value={draft.summary ?? ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  summary: event.target.value || null,
                }))
              }
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Status</span>
            <select
              className="w-full rounded-lg border p-2 dark:bg-gray-900"
              value={draft.status}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  status: event.target.value as ExocorpseCmsEntry["status"],
                }))
              }
            >
              {["draft", "scheduled", "published", "archived"].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-sm">
            <span>Blocks JSON</span>
            <textarea
              className="min-h-56 w-full rounded-lg border p-2 font-mono text-xs dark:bg-gray-900"
              value={blocksJson}
              onChange={(event) => setBlocksJson(event.target.value)}
            />
          </label>

          {definitions.map((definition) => (
            <label className="block space-y-1 text-sm" key={definition.id}>
              <span>{definition.label}</span>
              <select
                className="min-h-28 w-full rounded-lg border p-2 dark:bg-gray-900"
                multiple={definition.cardinality === "many"}
                value={relationSelections[definition.id] ?? []}
                onChange={(event) =>
                  setRelationSelections((current) => ({
                    ...current,
                    [definition.id]: Array.from(
                      event.target.selectedOptions,
                    ).map((option) => option.value),
                  }))
                }
              >
                {(relationOptions[definition.id] ?? []).map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.title}
                  </option>
                ))}
              </select>
            </label>
          ))}

          {selectedEntry ? (
            <div className="space-y-3 rounded-lg border p-4">
              <h2 className="font-semibold">Media</h2>
              <form
                action={(formData) =>
                  run(
                    () =>
                      uploadAdminCmsAsset({
                        collectionType:
                          collection?.collection_type ?? "content",
                        entryId: selectedEntry.id,
                        entrySlug: selectedEntry.slug,
                        formData,
                      }),
                    "Media uploaded.",
                  )
                }
                className="flex gap-2"
              >
                <input name="file" type="file" />
                <button
                  className="rounded-lg bg-blue-600 px-3 py-2 text-white"
                  type="submit"
                >
                  Upload
                </button>
              </form>
              {assets.map((asset) => (
                <div
                  className="flex items-center justify-between gap-3 text-sm"
                  key={asset.id}
                >
                  <span>
                    {asset.alt_text ?? asset.asset_type} ·{" "}
                    {asset.source_url ? "external" : "managed"}
                  </span>
                  <button
                    className="rounded border px-2 py-1"
                    onClick={() =>
                      run(() => deleteAdminCmsAsset(asset.id), "Media deleted.")
                    }
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex gap-3">
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
              disabled={pending || !draft.title.trim() || !draft.slug.trim()}
              onClick={save}
              type="button"
            >
              {pending ? "Saving…" : "Save entry"}
            </button>
            {selectedEntry ? (
              <button
                className="rounded-lg border border-red-300 px-4 py-2 text-red-700"
                onClick={() =>
                  run(
                    () => deleteAdminCmsEntry(selectedEntry.id),
                    "Entry deleted.",
                  )
                }
                type="button"
              >
                Delete entry
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
