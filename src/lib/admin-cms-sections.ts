export type AdminCmsSectionKey =
  | "about"
  | "addons"
  | "blog-posts"
  | "characters"
  | "cms"
  | "factions"
  | "locations"
  | "portfolio"
  | "services"
  | "stories"
  | "worlds";

export type AdminCmsSection = {
  collectionSlugs: string[];
  defaultCollectionSlug?: string;
  description: string;
  eyebrow: string;
  key: AdminCmsSectionKey;
  title: string;
};

export const ADMIN_CMS_SECTIONS: Record<AdminCmsSectionKey, AdminCmsSection> = {
  about: {
    collectionSlugs: ["about", "about-content", "about-faqs"],
    defaultCollectionSlug: "about",
    description:
      "Shape the profile, social cards, favorites, boundaries, and frequently asked questions as one connected About experience.",
    eyebrow: "Identity desk",
    key: "about",
    title: "About Me",
  },
  addons: {
    collectionSlugs: ["commission-addons", "commission-services"],
    defaultCollectionSlug: "commission-addons",
    description:
      "Maintain price modifiers and connect each add-on to the commission services where it belongs.",
    eyebrow: "Commission modifiers",
    key: "addons",
    title: "Add-ons",
  },
  "blog-posts": {
    collectionSlugs: ["blog-posts", "tags"],
    defaultCollectionSlug: "blog-posts",
    description:
      "Write, preview, tag, publish, and illustrate long-form posts without leaving the Exocorpse control room.",
    eyebrow: "Editorial desk",
    key: "blog-posts",
    title: "Blog Posts",
  },
  characters: {
    collectionSlugs: [
      "characters",
      "character-outfits",
      "character-gallery",
      "character-relationships",
      "character-factions",
      "character-locations",
      "relationship-types",
      "outfit-types",
    ],
    defaultCollectionSlug: "characters",
    description:
      "Manage character profiles alongside outfits, galleries, relationships, memberships, locations, and reusable types.",
    eyebrow: "Character archive",
    key: "characters",
    title: "Characters",
  },
  cms: {
    collectionSlugs: [],
    description:
      "Inspect every Exocorpse collection with typed fields, content blocks, managed media, publishing, and UUID relations.",
    eyebrow: "Tuturuuu CMS",
    key: "cms",
    title: "Complete Content Library",
  },
  factions: {
    collectionSlugs: ["factions", "character-factions"],
    defaultCollectionSlug: "factions",
    description:
      "Maintain organizations, hierarchy, world placement, and content-bearing character memberships together.",
    eyebrow: "Faction registry",
    key: "factions",
    title: "Factions",
  },
  locations: {
    collectionSlugs: ["locations", "location-gallery", "character-locations"],
    defaultCollectionSlug: "locations",
    description:
      "Build nested places, assign their worlds, curate location galleries, and connect character location records.",
    eyebrow: "Atlas desk",
    key: "locations",
    title: "Locations",
  },
  portfolio: {
    collectionSlugs: [
      "portfolio-art",
      "portfolio-writing",
      "portfolio-games",
      "tags",
    ],
    defaultCollectionSlug: "portfolio-art",
    description:
      "Curate art, writing, and games with shared tags, featured ordering, media, and publication controls.",
    eyebrow: "Portfolio rotation",
    key: "portfolio",
    title: "Portfolio",
  },
  services: {
    collectionSlugs: [
      "commission-services",
      "commission-styles",
      "commission-pictures",
      "commission-addons",
    ],
    defaultCollectionSlug: "commission-services",
    description:
      "Manage services, styles, examples, pricing, availability, and add-on relationships in one commission workspace.",
    eyebrow: "Commission catalogue",
    key: "services",
    title: "Commission Services",
  },
  stories: {
    collectionSlugs: ["stories", "tags"],
    defaultCollectionSlug: "stories",
    description:
      "Create story universes, control publication and theme, and connect reusable taxonomy through native CMS relations.",
    eyebrow: "Universe registry",
    key: "stories",
    title: "Stories",
  },
  worlds: {
    collectionSlugs: [
      "worlds",
      "timelines",
      "events",
      "event-types",
      "event-participants",
      "event-factions",
    ],
    defaultCollectionSlug: "worlds",
    description:
      "Build worlds and their chronology together: timelines, events, participants, factions, types, and locations remain connected by UUID.",
    eyebrow: "Worldbuilding atlas",
    key: "worlds",
    title: "Worlds",
  },
};

export const LEGACY_ADMIN_SECTION_KEYS: AdminCmsSectionKey[] = [
  "stories",
  "worlds",
  "characters",
  "factions",
  "locations",
  "about",
  "portfolio",
  "blog-posts",
  "services",
  "addons",
];
