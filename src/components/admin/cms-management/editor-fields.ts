import type { CmsEntryDraft } from "./editor-types";
import { isJsonRecord } from "./editor-utils";
import type { ExocorpseCmsFieldDefinition } from "@/types/exocorpse-cms";

type LegacyField = Pick<
  ExocorpseCmsFieldDefinition,
  "key" | "label" | "field_type"
>;
const galleryFields: LegacyField[] = [
  { key: "artistName", label: "Artist name", field_type: "string" },
  { key: "artistUrl", label: "Artist URL", field_type: "string" },
  { key: "commissionDate", label: "Commission date", field_type: "date" },
  { key: "tags", label: "Tags", field_type: "string-array" },
  { key: "isFeatured", label: "Featured", field_type: "boolean" },
];
const legacyMediaFields: Record<string, LegacyField[]> = {
  "character-gallery": galleryFields,
  "location-gallery": galleryFields,
  "character-outfits": [
    {
      key: "referenceImages",
      label: "Reference images",
      field_type: "string-array",
    },
    { key: "notes", label: "Notes", field_type: "markdown" },
  ],
};

export function configuredEditorFields(
  fields: ExocorpseCmsFieldDefinition[],
  collectionId: string | undefined,
  collectionSlug: string | undefined,
) {
  if (!collectionId) return [];
  const configured = fields.filter(
    (field) => field.collection_id === collectionId,
  );
  // Keep operator-defined fields and explicit disabling authoritative. Older
  // imported collections may predate the retained legacy media fields.
  const knownKeys = new Set(configured.map((field) => field.key));
  const fallback = (legacyMediaFields[collectionSlug ?? ""] ?? [])
    .filter((field) => !knownKeys.has(field.key))
    .map((field, index): ExocorpseCmsFieldDefinition => ({
      ...field,
      collection_id: collectionId,
      default_value: null,
      description: null,
      field_scope: "profile_data",
      id: `exocorpse:${collectionId}:${field.key}`,
      is_enabled: true,
      is_required: false,
      options: [],
      sort_order: Number.MAX_SAFE_INTEGER - 10 + index,
      source: "exocorpse",
    }));
  return [...configured, ...fallback]
    .filter(
      (field) =>
        field.is_enabled &&
        !(field.key === "tags" && collectionSlug === "blog-posts"),
    )
    .sort((left, right) => left.sort_order - right.sort_order);
}

export function ensureStorySoundtrackField(
  collectionId: string,
  collectionSlug: string | undefined,
  fields: ExocorpseCmsFieldDefinition[],
) {
  if (
    collectionSlug !== "stories" ||
    fields.some((definition) => definition.key === "themeSoundtrackUrl")
  ) {
    return fields;
  }

  return [
    ...fields,
    {
      collection_id: collectionId,
      default_value: null,
      description:
        "Choose a soundtrack for this story, or keep the site default.",
      field_scope: "profile_data" as const,
      field_type: "string" as const,
      id: `exocorpse:${collectionId}:themeSoundtrackUrl`,
      is_enabled: true,
      is_required: false,
      key: "themeSoundtrackUrl",
      label: "Story soundtrack",
      options: [],
      sort_order: Number.MAX_SAFE_INTEGER,
      source: "exocorpse",
    },
  ];
}

export function applyFieldDefaults(
  draft: CmsEntryDraft,
  fields: ExocorpseCmsFieldDefinition[],
) {
  return fields.reduce((current, definition) => {
    if (definition.default_value === null) return current;
    const scope = definition.field_scope;
    const record = isJsonRecord(current[scope]) ? current[scope] : {};
    return {
      ...current,
      [scope]: { ...record, [definition.key]: definition.default_value },
    };
  }, draft);
}
