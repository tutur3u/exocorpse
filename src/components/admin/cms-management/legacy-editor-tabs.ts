import type { CmsEditorTab } from "@/components/admin/cms-management/CmsEditorTabs";
import type {
  ExocorpseCmsCollection,
  ExocorpseCmsFieldDefinition,
} from "@/types/exocorpse-cms";
import {
  BookOpenText,
  FileText,
  ImageIcon,
  Images,
  Link2,
  Palette,
  ScanFace,
  Settings2,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

export type CmsEditorTabConfig = {
  count?: number;
  icon: LucideIcon;
  id: CmsEditorTab;
  label: string;
};

const visualFieldKeys = new Set([
  "colorPalette",
  "themePrimaryColor",
  "themeSecondaryColor",
  "themeTextColor",
  "themeSoundtrackUrl",
]);

const publishingFieldKeys = new Set([
  "isActive",
  "isFeatured",
  "isPublished",
  "publishedAt",
  "visibility",
]);

const basicFieldKeys = new Set([
  "age",
  "birthday",
  "displayOrder",
  "nickname",
  "population",
  "size",
  "species",
  "worldType",
]);

const characterFieldGroups = {
  abilities: new Set(["abilities"]),
  fanwork: new Set(["fanworkPolicy"]),
  personality: new Set(["personalitySummary"]),
  physical: new Set([
    "age",
    "birthday",
    "build",
    "distinguishingFeatures",
    "eyeColor",
    "gender",
    "hairColor",
    "height",
    "occupation",
    "pronouns",
    "skinTone",
    "species",
    "status",
    "weight",
  ]),
};

export function splitCharacterEditorFields(
  definitions: ExocorpseCmsFieldDefinition[],
) {
  const assigned = new Set(
    Object.values(characterFieldGroups).flatMap((keys) => [...keys]),
  );
  return {
    abilities: definitions.filter((field) =>
      characterFieldGroups.abilities.has(field.key),
    ),
    basic: definitions.filter((field) => !assigned.has(field.key)),
    fanwork: definitions.filter((field) =>
      characterFieldGroups.fanwork.has(field.key),
    ),
    personality: definitions.filter((field) =>
      characterFieldGroups.personality.has(field.key),
    ),
    physical: definitions.filter((field) =>
      characterFieldGroups.physical.has(field.key),
    ),
  };
}

export function splitLegacyEditorFields(
  definitions: ExocorpseCmsFieldDefinition[],
) {
  return {
    basic: definitions.filter((field) => basicFieldKeys.has(field.key)),
    details: definitions.filter(
      (field) =>
        !basicFieldKeys.has(field.key) &&
        !visualFieldKeys.has(field.key) &&
        !publishingFieldKeys.has(field.key),
    ),
    publishing: definitions.filter((field) =>
      publishingFieldKeys.has(field.key),
    ),
    visuals: definitions.filter((field) => visualFieldKeys.has(field.key)),
  };
}

export function legacyEditorTabs({
  assetCount,
  blockCount,
  collection,
  connectionCount,
  fields,
  hasAssets,
  hasBlocks,
  hasConnections,
}: {
  assetCount: number;
  blockCount: number;
  collection: ExocorpseCmsCollection;
  connectionCount: number;
  fields: ReturnType<typeof splitLegacyEditorFields>;
  hasAssets: boolean;
  hasBlocks: boolean;
  hasConnections: boolean;
}): CmsEditorTabConfig[] {
  if (collection.slug === "characters") {
    return [
      {
        icon: FileText,
        id: "basic",
        label: "Basic Info & Publishing",
      },
      {
        icon: ScanFace,
        id: "physical",
        label: "Physical & Personality",
      },
      {
        icon: BookOpenText,
        id: "content",
        label: "Relationships, Lore & Abilities",
      },
      {
        icon: ImageIcon,
        id: "gallery",
        label: "Gallery & Fanwork Policy",
      },
    ];
  }
  const visualLabel =
    collection.slug === "stories"
      ? "Theme & Style"
      : collection.slug === "worlds" ||
          collection.slug === "factions" ||
          collection.slug === "locations"
        ? "Visuals"
        : "Media";
  const tabs: CmsEditorTabConfig[] = [
    { icon: FileText, id: "basic", label: "Basic Info" },
  ];
  if (fields.details.length) {
    tabs.push({ icon: SlidersHorizontal, id: "details", label: "Details" });
  }
  if (hasAssets || fields.visuals.length) {
    tabs.push({
      count: assetCount,
      icon: Palette,
      id: "media",
      label: visualLabel,
    });
  }
  if (hasBlocks && collection.slug !== "character-gallery") {
    tabs.push({
      count: blockCount,
      icon: Images,
      id: "content",
      label: "Content",
    });
  }
  if (
    hasConnections &&
    ![
      "character-gallery",
      "stories",
      "worlds",
      "factions",
      "locations",
    ].includes(collection.slug)
  ) {
    tabs.push({
      count: connectionCount,
      icon: Link2,
      id: "connections",
      label:
        collection.slug === "characters" ? "Relationships" : "Related content",
    });
  }
  tabs.push({ icon: Settings2, id: "settings", label: "Publishing" });
  if (["character-gallery", "portfolio-art"].includes(collection.slug)) {
    const mediaIndex = tabs.findIndex((tab) => tab.id === "media");
    if (mediaIndex > 0) {
      const [mediaTab] = tabs.splice(mediaIndex, 1);
      if (mediaTab) tabs.unshift(mediaTab);
    }
  }
  return tabs;
}
