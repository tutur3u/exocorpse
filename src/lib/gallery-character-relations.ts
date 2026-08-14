export const CHARACTER_GALLERY_RELATION_KEYS = [
  "character",
  "gallery-character",
] as const;

export function galleryCharacterTargetIds(
  relations: Array<{ key: string; targetEntryId: string }>,
) {
  return [
    ...new Set(
      relations
        .filter((relation) =>
          CHARACTER_GALLERY_RELATION_KEYS.includes(
            relation.key as (typeof CHARACTER_GALLERY_RELATION_KEYS)[number],
          ),
        )
        .map((relation) => relation.targetEntryId)
        .filter(Boolean),
    ),
  ];
}
