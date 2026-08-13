import type { CmsEditorTab } from "@/components/admin/cms-management/CmsEditorTabs";
import type {
  ExocorpseCmsCollection,
  ExocorpseCmsFieldDefinition,
} from "@/types/exocorpse-cms";
import {
  FileText,
  Images,
  Link2,
  Palette,
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
  if (hasBlocks) {
    tabs.push({
      count: blockCount,
      icon: Images,
      id: "content",
      label: "Content",
    });
  }
  if (
    hasConnections &&
    !["stories", "worlds", "factions", "locations"].includes(collection.slug)
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
  return tabs;
}
