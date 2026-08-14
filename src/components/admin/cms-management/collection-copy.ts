import type { ExocorpseCmsCollection } from "@/types/exocorpse-cms";

const ITEM_LABELS: Record<string, string> = {
  about: "profile section",
  "about-content": "about section",
  "about-faqs": "question",
  "blog-posts": "post",
  characters: "character",
  "character-factions": "membership",
  "character-gallery": "gallery item",
  "character-locations": "location record",
  "character-outfits": "outfit",
  "character-relationships": "relationship",
  "commission-addons": "add-on",
  "commission-pictures": "example",
  "commission-services": "service",
  "commission-styles": "style",
  events: "event",
  factions: "faction",
  locations: "location",
  "location-gallery": "gallery item",
  "outfit-types": "outfit type",
  "portfolio-art": "artwork",
  "portfolio-games": "game",
  "portfolio-writing": "writing",
  "relationship-types": "relationship type",
  stories: "story",
  tags: "tag",
  timelines: "timeline",
  worlds: "world",
};

export function collectionItemLabel(collection: ExocorpseCmsCollection) {
  return ITEM_LABELS[collection.slug] ?? "item";
}

const TAB_LABELS: Record<string, string> = {
  about: "Profile",
  "about-content": "About",
  "about-faqs": "FAQ",
  characters: "Characters",
  "character-factions": "Factions",
  "character-gallery": "Gallery",
  "character-outfits": "Outfits",
  "character-relationships": "Relationships",
  "portfolio-art": "Art",
  "portfolio-games": "Games",
  "portfolio-writing": "Writing",
};

export function collectionTabLabel(collection: ExocorpseCmsCollection) {
  return TAB_LABELS[collection.slug] ?? collection.title;
}
