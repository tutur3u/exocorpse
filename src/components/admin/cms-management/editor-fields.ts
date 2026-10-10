import type { ExocorpseCmsFieldDefinition } from "@/types/exocorpse-cms";

export function configuredEditorFields(
  fields: ExocorpseCmsFieldDefinition[],
  collectionId: string | undefined,
  collectionSlug: string | undefined,
) {
  return fields
    .filter(
      (field) =>
        field.collection_id === collectionId &&
        field.is_enabled &&
        !(field.key === "tags" && collectionSlug === "blog-posts"),
    )
    .sort((left, right) => left.sort_order - right.sort_order);
}
