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
