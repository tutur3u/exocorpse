import type { ExocorpseCmsStudio } from "@/types/exocorpse-cms";

export function addonServiceIds(
  studio: ExocorpseCmsStudio,
  addonId: string,
): string[] {
  const services = studio.collections.find(
    (collection) => collection.slug === "commission-services",
  );
  const definition = studio.relationDefinitions?.find(
    (item) =>
      item.source_collection_id === services?.id && item.key === "addons",
  );
  return [
    ...new Set(
      studio.relations
        ?.filter(
          (relation) =>
            relation.relation_definition_id === definition?.id &&
            relation.to_entry_id === addonId,
        )
        .map((relation) => relation.from_entry_id) ?? [],
    ),
  ];
}

export function planAddonServiceLinks(
  studio: ExocorpseCmsStudio,
  addonId: string,
  requestedServiceIds: string[],
) {
  const addons = studio.collections.find(
    (collection) => collection.slug === "commission-addons",
  );
  const services = studio.collections.find(
    (collection) => collection.slug === "commission-services",
  );
  const addon = studio.entries.find(
    (entry) => entry.id === addonId && entry.collection_id === addons?.id,
  );
  const definition = studio.relationDefinitions?.find(
    (item) =>
      item.source_collection_id === services?.id && item.key === "addons",
  );
  if (!addon || !definition)
    throw new Error(
      "This add-on or its service links are no longer available.",
    );
  const desired = new Set(requestedServiceIds);
  const available = studio.entries.filter(
    (entry) => entry.collection_id === services?.id,
  );
  if (
    available.filter((entry) => desired.has(entry.id)).length !== desired.size
  )
    throw new Error("One of the selected services is no longer available.");
  const profile = addon.profile_data;
  if (
    profile &&
    typeof profile === "object" &&
    !Array.isArray(profile) &&
    profile.isExclusive === true &&
    desired.size > 1
  )
    throw new Error("An exclusive add-on can only be linked to one service.");
  return available.flatMap((entry) => {
    const relations = (studio.relations ?? []).filter(
      (relation) =>
        relation.from_entry_id === entry.id && relation.relation_definition_id,
    );
    const exists = relations.some(
      (relation) =>
        relation.relation_definition_id === definition.id &&
        relation.to_entry_id === addonId,
    );
    if (exists === desired.has(entry.id)) return [];
    const kept = relations.filter(
      (relation) =>
        !(
          relation.relation_definition_id === definition.id &&
          relation.to_entry_id === addonId
        ),
    );
    return [
      {
        entry,
        relations: [
          ...kept.map((relation) => ({
            definitionId: relation.relation_definition_id!,
            metadata: relation.metadata,
            sortOrder: relation.sort_order,
            toEntryId: relation.to_entry_id,
          })),
          ...(desired.has(entry.id)
            ? [
                {
                  definitionId: definition.id,
                  metadata: {},
                  sortOrder:
                    Math.max(
                      -1,
                      ...kept
                        .filter(
                          (relation) =>
                            relation.relation_definition_id === definition.id,
                        )
                        .map((relation) => relation.sort_order),
                    ) + 1,
                  toEntryId: addonId,
                },
              ]
            : []),
        ],
      },
    ];
  });
}
