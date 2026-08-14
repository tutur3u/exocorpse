import type {
  ExocorpseCmsRelationDefinition,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";

export const CHARACTER_GALLERY_RELATION_KEY = "character";

export function galleryCharacterDefinition(
  studio: Pick<ExocorpseCmsStudio, "relationDefinitions">,
  collectionId: string,
) {
  const definition = (studio.relationDefinitions ?? []).find(
    (item) =>
      item.source_collection_id === collectionId &&
      item.key === CHARACTER_GALLERY_RELATION_KEY,
  );

  return definition
    ? ({
        ...definition,
        cardinality: "many",
        label: "Tagged characters",
      } satisfies ExocorpseCmsRelationDefinition)
    : null;
}
