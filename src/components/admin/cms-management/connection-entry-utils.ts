import {
  isJsonRecord,
  slugify,
} from "@/components/admin/cms-management/editor-utils";
import type {
  CmsEntryDraft,
  CmsRelationSelections,
} from "@/components/admin/cms-management/editor-types";
import type {
  ExocorpseCmsEntry,
  ExocorpseCmsRelationDefinition,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";

export const CONNECTION_COLLECTION_SLUGS = new Set([
  "character-relationships",
  "character-factions",
]);

export type CmsConnectionPresentation = {
  characterA?: ExocorpseCmsEntry;
  characterB?: ExocorpseCmsEntry;
  faction?: ExocorpseCmsEntry;
  isCurrent?: boolean;
  primary: string;
  secondary: string;
  searchText: string;
  targetIds: string[];
  type?: ExocorpseCmsEntry;
};

export function charactersInSameStory(
  anchorId: string | undefined,
  studio: ExocorpseCmsStudio,
) {
  const characters = studio.collections.find(
    (item) => item.slug === "characters",
  );
  const worlds = studio.collections.find((item) => item.slug === "worlds");
  if (!characters || !worlds || !anchorId) {
    return studio.entries.filter(
      (entry) => entry.collection_id === characters?.id,
    );
  }
  const definitionById = new Map(
    (studio.relationDefinitions ?? []).map((definition) => [
      definition.id,
      definition,
    ]),
  );
  const worldStoryIds = new Map<string, Set<string>>();
  for (const relation of studio.relations ?? []) {
    const definition = relation.relation_definition_id
      ? definitionById.get(relation.relation_definition_id)
      : undefined;
    if (
      definition?.source_collection_id !== worlds.id ||
      definition.key !== "story"
    )
      continue;
    const ids = worldStoryIds.get(relation.from_entry_id) ?? new Set<string>();
    ids.add(relation.to_entry_id);
    worldStoryIds.set(relation.from_entry_id, ids);
  }
  const characterStories = (characterId: string) => {
    const storyIds = new Set<string>();
    for (const relation of studio.relations ?? []) {
      const definition = relation.relation_definition_id
        ? definitionById.get(relation.relation_definition_id)
        : undefined;
      if (
        relation.from_entry_id !== characterId ||
        definition?.source_collection_id !== characters.id ||
        definition.key !== "worlds"
      )
        continue;
      for (const storyId of worldStoryIds.get(relation.to_entry_id) ?? [])
        storyIds.add(storyId);
    }
    return storyIds;
  };
  const anchorStories = characterStories(anchorId);
  if (!anchorStories.size)
    return studio.entries.filter(
      (entry) => entry.collection_id === characters.id,
    );
  return studio.entries.filter((entry) => {
    if (entry.collection_id !== characters.id) return false;
    if (entry.id === anchorId) return true;
    return [...characterStories(entry.id)].some((storyId) =>
      anchorStories.has(storyId),
    );
  });
}

function targetsForEntry(entryId: string, studio: ExocorpseCmsStudio) {
  const definitionById = new Map(
    (studio.relationDefinitions ?? []).map((definition) => [
      definition.id,
      definition,
    ]),
  );
  const entryById = new Map(studio.entries.map((entry) => [entry.id, entry]));
  const targets = new Map<string, ExocorpseCmsEntry>();

  for (const relation of studio.relations ?? []) {
    if (relation.from_entry_id !== entryId) continue;
    const definition = relation.relation_definition_id
      ? definitionById.get(relation.relation_definition_id)
      : undefined;
    const target = entryById.get(relation.to_entry_id);
    if (definition && target) targets.set(definition.key, target);
  }

  return targets;
}

export function connectionPresentation(
  collectionSlug: string,
  entry: ExocorpseCmsEntry,
  studio: ExocorpseCmsStudio,
): CmsConnectionPresentation {
  const targets = targetsForEntry(entry.id, studio);
  const profile = isJsonRecord(entry.profile_data) ? entry.profile_data : {};

  if (collectionSlug === "character-relationships") {
    const characterA = targets.get("character-a");
    const characterB = targets.get("character-b");
    const type = targets.get("type");
    const primary =
      characterA && characterB
        ? `${characterA.title} & ${characterB.title}`
        : "Choose both characters";
    const secondary =
      (typeof profile.forwardLabel === "string" &&
        profile.forwardLabel.trim()) ||
      type?.title ||
      "Related";
    return {
      characterA,
      characterB,
      primary,
      secondary,
      searchText: [primary, secondary, entry.summary].filter(Boolean).join(" "),
      targetIds: [characterA?.id, characterB?.id].filter(
        (value): value is string => Boolean(value),
      ),
      type,
    };
  }

  const characterA = targets.get("character");
  const faction = targets.get("faction");
  const role = typeof profile.role === "string" ? profile.role : "";
  const rank = typeof profile.rank === "string" ? profile.rank : "";
  const primary = characterA?.title ?? "Choose a character";
  const secondary = faction?.title ?? "Choose a faction";
  return {
    characterA,
    faction,
    isCurrent: profile.isCurrent !== false,
    primary,
    secondary,
    searchText: [primary, secondary, role, rank, profile.notes]
      .filter(Boolean)
      .join(" "),
    targetIds: [characterA?.id, faction?.id].filter((value): value is string =>
      Boolean(value),
    ),
  };
}

function selectedTarget(
  key: string,
  definitions: ExocorpseCmsRelationDefinition[],
  selections: CmsRelationSelections,
  studio: ExocorpseCmsStudio,
) {
  const definition = definitions.find((item) => item.key === key);
  const targetId = definition ? selections[definition.id]?.[0] : undefined;
  return studio.entries.find((entry) => entry.id === targetId);
}

export function normalizeConnectionDraft({
  collectionSlug,
  definitions,
  draft,
  selections,
  studio,
}: {
  collectionSlug: string;
  definitions: ExocorpseCmsRelationDefinition[];
  draft: CmsEntryDraft;
  selections: CmsRelationSelections;
  studio: ExocorpseCmsStudio;
}) {
  if (!CONNECTION_COLLECTION_SLUGS.has(collectionSlug)) return draft;

  if (collectionSlug === "character-relationships") {
    const characterA = selectedTarget(
      "character-a",
      definitions,
      selections,
      studio,
    );
    const characterB = selectedTarget(
      "character-b",
      definitions,
      selections,
      studio,
    );
    const type = selectedTarget("type", definitions, selections, studio);
    const profile = isJsonRecord(draft.profile_data) ? draft.profile_data : {};
    const label =
      (typeof profile.forwardLabel === "string" &&
        profile.forwardLabel.trim()) ||
      type?.title ||
      "Related";
    const title = [characterA?.title, characterB?.title]
      .filter(Boolean)
      .join(" & ");
    const fullTitle = `${title} — ${label}`;
    return {
      ...draft,
      slug: slugify(fullTitle),
      status: "published" as const,
      subtitle: label,
      title: fullTitle,
    };
  }

  const character = selectedTarget(
    "character",
    definitions,
    selections,
    studio,
  );
  const faction = selectedTarget("faction", definitions, selections, studio);
  const title = [character?.title, faction?.title].filter(Boolean).join(" — ");
  return {
    ...draft,
    slug: slugify(title),
    status: "published" as const,
    subtitle: faction?.title ?? null,
    title,
  };
}

export function isConnectionDraftReady(
  definitions: ExocorpseCmsRelationDefinition[],
  selections: CmsRelationSelections,
  collectionSlug?: string,
) {
  return definitions
    .filter(
      (definition) =>
        definition.is_required &&
        !(
          collectionSlug === "character-relationships" &&
          definition.key === "type"
        ),
    )
    .every((definition) => Boolean(selections[definition.id]?.length));
}

export function hasDuplicateConnection({
  collectionId,
  collectionSlug,
  definitions,
  entryId,
  selections,
  studio,
}: {
  collectionId: string;
  collectionSlug: string;
  definitions: ExocorpseCmsRelationDefinition[];
  entryId: string;
  selections: CmsRelationSelections;
  studio: ExocorpseCmsStudio;
}) {
  if (!CONNECTION_COLLECTION_SLUGS.has(collectionSlug)) return false;
  const selectedByKey = new Map(
    definitions.map((definition) => [
      definition.key,
      selections[definition.id]?.[0],
    ]),
  );
  const requiredKeys =
    collectionSlug === "character-relationships"
      ? ["character-a", "character-b"]
      : ["character", "faction"];
  if (requiredKeys.some((key) => !selectedByKey.get(key))) return false;
  const identity =
    collectionSlug === "character-relationships"
      ? [
          [selectedByKey.get("character-a"), selectedByKey.get("character-b")]
            .sort()
            .join(":"),
        ].join("|")
      : [selectedByKey.get("character"), selectedByKey.get("faction")].join(
          "|",
        );
  const definitionById = new Map(
    definitions.map((definition) => [definition.id, definition.key]),
  );
  return studio.entries
    .filter(
      (entry) => entry.collection_id === collectionId && entry.id !== entryId,
    )
    .some((entry) => {
      const targetByKey = new Map<string, string>();
      for (const relation of studio.relations ?? []) {
        if (relation.from_entry_id !== entry.id) continue;
        const key = relation.relation_definition_id
          ? definitionById.get(relation.relation_definition_id)
          : undefined;
        if (key) targetByKey.set(key, relation.to_entry_id);
      }
      const candidate =
        collectionSlug === "character-relationships"
          ? [
              [targetByKey.get("character-a"), targetByKey.get("character-b")]
                .sort()
                .join(":"),
            ].join("|")
          : [targetByKey.get("character"), targetByKey.get("faction")].join(
              "|",
            );
      return candidate === identity;
    });
}
