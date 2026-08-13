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
  primaryCollectionSlugs?: string[];
  title: string;
};

export const ADMIN_CMS_SECTIONS: Record<AdminCmsSectionKey, AdminCmsSection> = {
  about: {
    collectionSlugs: ["about", "about-content", "about-faqs"],
    defaultCollectionSlug: "about",
    description:
      "Manage your profile, social cards, favorites, boundaries, and frequently asked questions.",
    eyebrow: "Identity desk",
    key: "about",
    primaryCollectionSlugs: ["about", "about-content", "about-faqs"],
    title: "About Me",
  },
  addons: {
    collectionSlugs: ["commission-addons", "commission-services"],
    defaultCollectionSlug: "commission-addons",
    description:
      "Manage commission add-ons, prices, and the services they belong to.",
    eyebrow: "Commission modifiers",
    key: "addons",
    primaryCollectionSlugs: ["commission-addons"],
    title: "Add-ons",
  },
  "blog-posts": {
    collectionSlugs: ["blog-posts", "tags"],
    defaultCollectionSlug: "blog-posts",
    description: "Write, illustrate, and publish blog posts.",
    eyebrow: "Editorial desk",
    key: "blog-posts",
    primaryCollectionSlugs: ["blog-posts"],
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
      "Manage character profiles, artwork, outfits, relationships, and locations.",
    eyebrow: "Character archive",
    key: "characters",
    primaryCollectionSlugs: ["characters"],
    title: "Characters",
  },
  cms: {
    collectionSlugs: [],
    description: "Manage every part of the site from one complete library.",
    eyebrow: "Tuturuuu CMS",
    key: "cms",
    title: "Complete Content Library",
  },
  factions: {
    collectionSlugs: ["factions", "character-factions"],
    defaultCollectionSlug: "factions",
    description:
      "Manage factions, their hierarchy, members, and the worlds they belong to.",
    eyebrow: "Faction registry",
    key: "factions",
    primaryCollectionSlugs: ["factions"],
    title: "Factions",
  },
  locations: {
    collectionSlugs: ["locations", "location-gallery", "character-locations"],
    defaultCollectionSlug: "locations",
    description:
      "Manage places, maps, galleries, and the worlds they belong to.",
    eyebrow: "Atlas desk",
    key: "locations",
    primaryCollectionSlugs: ["locations"],
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
      "Manage artwork, writing, games, and what appears as featured work.",
    eyebrow: "Portfolio rotation",
    key: "portfolio",
    primaryCollectionSlugs: [
      "portfolio-art",
      "portfolio-writing",
      "portfolio-games",
    ],
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
      "Manage commission services, styles, examples, prices, and availability.",
    eyebrow: "Commission catalogue",
    key: "services",
    primaryCollectionSlugs: ["commission-services"],
    title: "Commission Services",
  },
  stories: {
    collectionSlugs: ["stories", "tags"],
    defaultCollectionSlug: "stories",
    description: "Manage story universes, themes, visibility, and publishing.",
    eyebrow: "Universe registry",
    key: "stories",
    primaryCollectionSlugs: ["stories"],
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
      "Manage worlds within your stories, with timelines and events close at hand.",
    eyebrow: "Worldbuilding atlas",
    key: "worlds",
    primaryCollectionSlugs: ["worlds"],
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
