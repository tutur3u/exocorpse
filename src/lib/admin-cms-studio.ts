import type { AdminCmsSection } from "@/lib/admin-cms-sections";
import type { ExocorpseCmsStudio } from "@/types/exocorpse-cms";

/**
 * Keep the legacy admin workspace focused on the collections it is editing.
 * Relation target entries remain available so the editor can render its
 * searchable connection controls without shipping the complete CMS studio to
 * the browser for every section.
 */
export function selectAdminCmsStudio(
  studio: ExocorpseCmsStudio,
  section: AdminCmsSection,
): ExocorpseCmsStudio {
  if (section.collectionSlugs.length === 0) return studio;

  const sourceSlugs = new Set(section.collectionSlugs);
  const sourceCollectionIds = new Set(
    studio.collections
      .filter((collection) => sourceSlugs.has(collection.slug))
      .map((collection) => collection.id),
  );
  const relationDefinitions = (studio.relationDefinitions ?? []).filter(
    (definition) => sourceCollectionIds.has(definition.source_collection_id),
  );
  const worldCollectionId = studio.collections.find(
    (collection) => collection.slug === "worlds",
  )?.id;
  const storyContextDefinitions = (studio.relationDefinitions ?? []).filter(
    (definition) =>
      definition.source_collection_id === worldCollectionId &&
      definition.key === "story" &&
      relationDefinitions.some(
        (candidate) =>
          ["world", "worlds"].includes(candidate.key) &&
          (studio.relationDefinitionTargets ?? []).some(
            (target) =>
              target.relation_definition_id === candidate.id &&
              target.target_collection_id === worldCollectionId,
          ),
      ),
  );
  relationDefinitions.push(...storyContextDefinitions);
  const relationDefinitionIds = new Set(
    relationDefinitions.map((definition) => definition.id),
  );
  const relationDefinitionTargets = (
    studio.relationDefinitionTargets ?? []
  ).filter((target) =>
    relationDefinitionIds.has(target.relation_definition_id),
  );
  const includedCollectionIds = new Set(sourceCollectionIds);
  for (const target of relationDefinitionTargets) {
    includedCollectionIds.add(target.target_collection_id);
  }

  const sourceEntryIds = new Set(
    studio.entries
      .filter((entry) => sourceCollectionIds.has(entry.collection_id))
      .map((entry) => entry.id),
  );
  const relationSourceCollectionIds = new Set(
    relationDefinitions.map((definition) => definition.source_collection_id),
  );
  const relationSourceEntryIds = new Set(
    studio.entries
      .filter((entry) => relationSourceCollectionIds.has(entry.collection_id))
      .map((entry) => entry.id),
  );

  return {
    assets: studio.assets.filter(
      (asset) => asset.entry_id && sourceEntryIds.has(asset.entry_id),
    ),
    blocks: studio.blocks.filter((block) => sourceEntryIds.has(block.entry_id)),
    collections: studio.collections.filter((collection) =>
      includedCollectionIds.has(collection.id),
    ),
    entries: studio.entries.filter((entry) =>
      includedCollectionIds.has(entry.collection_id),
    ),
    fieldDefinitions: (studio.fieldDefinitions ?? []).filter(
      (definition) =>
        definition.collection_id !== null &&
        sourceCollectionIds.has(definition.collection_id),
    ),
    relations: (studio.relations ?? []).filter(
      (relation) =>
        relation.relation_definition_id !== null &&
        relationDefinitionIds.has(relation.relation_definition_id) &&
        relationSourceEntryIds.has(relation.from_entry_id),
    ),
    relationDefinitions,
    relationDefinitionTargets,
  };
}
