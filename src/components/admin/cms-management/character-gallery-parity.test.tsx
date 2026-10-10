import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import CmsEntryEditor, { type CmsEntryEditorProps } from "./CmsEntryEditor";
import type {
  ExocorpseCmsEntry,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";
import { configuredEditorFields } from "./editor-fields";
import { adminCmsTheme } from "./admin-theme";

const noop = () => {};
const collections = [
  "characters",
  "character-gallery",
  "character-outfits",
].map((slug) => ({ id: slug, slug, title: slug, collection_type: "content" }));
const entry = (id: string, collection: string): ExocorpseCmsEntry => ({
  id,
  collection_id: collection,
  title: id,
  slug: id,
  subtitle: null,
  summary: null,
  status: "published",
  sort_order: 0,
  metadata: {},
  profile_data: {},
  scheduled_for: null,
  published_at: null,
  created_at: "2026-10-10",
  updated_at: "2026-10-10",
  stable_source_id: null,
});
const character = entry("Fenrys", "characters");
const studio: ExocorpseCmsStudio = {
  collections,
  assets: [],
  blocks: [],
  entries: [
    character,
    entry("Portrait", "character-gallery"),
    entry("Costume", "character-outfits"),
    entry("Other character artwork", "character-gallery"),
  ],
  relationDefinitions: ["character-gallery", "character-outfits"].map(
    (slug) => ({
      id: `${slug}-character`,
      source_collection_id: slug,
      key: "character",
      label: "Character",
      cardinality: "many",
      is_required: true,
    }),
  ),
  relations: ["Portrait", "Costume"].map((id, index) => ({
    id,
    from_entry_id: id,
    to_entry_id: character.id,
    metadata: {},
    relation_type: "character",
    sort_order: 0,
    relation_definition_id: `${index === 0 ? "character-gallery" : "character-outfits"}-character`,
  })),
};
const props: CmsEntryEditorProps = {
  allowedAssetTypes: ["image"],
  allowedBlockTypes: [],
  assets: [],
  blocks: [],
  collection: collections[0],
  definitions: [],
  draft: character,
  fields: [],
  selectedEntryId: character.id,
  studio,
  pending: false,
  isDirty: false,
  linkedServiceIds: [],
  relationSelections: {},
  uploadStatus: null,
  theme: adminCmsTheme("characters"),
  onPendingUploadFileChange: noop,
  onLinkedServicesChange: noop,
  onBlocksChange: noop,
  onDelete: noop,
  onDeleteAsset: noop,
  onCancel: noop,
  onDraftChange: noop,
  onSave: noop,
  onTitleChange: noop,
  onUploadAsset: noop,
  onUploadGalleryAsset: async () => {},
  onUploadInlineAsset: async () => "",
  onEditGalleryEntry: noop,
  onDeleteRelated: noop,
  onEditRelated: noop,
  onCreateRelated: noop,
  onCreateRelationshipEntry: noop,
  onEditRelationshipEntry: noop,
  onPendingMediaChange: noop,
  onRelationsChange: noop,
  onReorderAssets: noop,
};
const panel = (html: string, id: string) =>
  html.match(
    new RegExp(
      `<section[^>]*id="cms-${id}-panel"[^>]*>([\\s\\S]*?)(?=<section[^>]*aria-labelledby="cms-|</section></div>)`,
    ),
  )?.[0] ?? "";

describe("character gallery feature parity", () => {
  test("renders related artwork and outfits in separate reachable panels", () => {
    const html = renderToStaticMarkup(
      <CmsEntryEditor {...props} initialTab="gallery" />,
    );
    const gallery = panel(html, "gallery");
    const outfits = panel(html, "outfits");
    expect(gallery).toContain("Gallery (1)");
    expect(gallery).toContain("Portrait");
    expect(gallery).not.toContain("Costume");
    expect(gallery).not.toContain("Other character artwork");
    expect(gallery).toContain("Add Image");
    expect(gallery).toContain("Edit");
    expect(gallery).toContain("Delete");
    expect(outfits).toContain("Costume");
    expect(outfits).not.toContain("Portrait");
    expect(html).toContain("Manage Gallery");
    expect((html.match(/Gallery \(1\)/g) ?? []).length).toBe(1);
  });

  test("new characters cannot add detached gallery or outfit entries", () => {
    const html = renderToStaticMarkup(
      <CmsEntryEditor {...props} selectedEntryId="" />,
    );
    expect(panel(html, "gallery")).toContain("Save the character first");
    expect(panel(html, "gallery")).not.toContain("Add Image");
    expect(panel(html, "outfits")).toMatch(/disabled=""[^>]*>\+ Add outfit/);
  });
});

test("gallery artwork retains its editable legacy tags", () => {
  const tags = {
    id: "gallery-tags",
    collection_id: "character-gallery",
    key: "tags",
    label: "Tags",
    field_type: "string-array" as const,
    field_scope: "profile_data" as const,
    default_value: null,
    description: null,
    is_enabled: true,
    is_required: false,
    options: [],
    sort_order: 0,
    source: "test",
  };
  const fields = configuredEditorFields(
    [tags],
    "character-gallery",
    "character-gallery",
  );
  expect(fields.filter((field) => field.key === "tags")).toHaveLength(1);
  const artwork = studio.entries.find((entry) => entry.id === "Portrait")!;
  const html = renderToStaticMarkup(
    <CmsEntryEditor
      {...props}
      collection={collections[1]}
      fields={fields}
      draft={{ ...artwork, profile_data: { tags: ["portrait", "commission"] } }}
      selectedEntryId={artwork.id}
    />,
  );
  expect(html).toContain("Tags");
  expect(html).toContain("portrait\ncommission");
  expect(
    configuredEditorFields(
      [{ ...tags, is_enabled: false }],
      "character-gallery",
      "character-gallery",
    ).map((field) => field.key),
  ).not.toContain("tags");
  expect(configuredEditorFields([tags], "characters", "characters")).toEqual(
    [],
  );
});

test("older media collections retain legacy controls and imported values", () => {
  for (const slug of ["character-outfits", "location-gallery"]) {
    const fields = configuredEditorFields([], slug, slug);
    const draft = {
      ...character,
      collection_id: slug,
      profile_data: {
        referenceImages: ["https://example.com/ref.png"],
        notes: "Outfit notes",
        commissionDate: "2026-10-10",
        tags: ["landscape"],
        isFeatured: true,
      },
    };
    const html = renderToStaticMarkup(
      <CmsEntryEditor
        {...props}
        collection={{ id: slug, slug, title: slug, collection_type: "content" }}
        fields={fields}
        draft={draft}
      />,
    );
    if (slug === "character-outfits") {
      expect(html).toContain("Reference images");
      expect(html).toContain("https://example.com/ref.png");
      expect(html).toContain("Notes");
    } else {
      expect(html).toContain("Commission date");
      expect(html).toContain("2026-10-10");
      expect(html).toContain("landscape");
      expect(html).toContain("Featured");
    }
  }
});
