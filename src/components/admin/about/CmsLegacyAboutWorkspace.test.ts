import { describe, expect, test } from "bun:test";
import type { ExocorpseCmsStudio } from "@/types/exocorpse-cms";
import { aboutPageData } from "./CmsLegacyAboutWorkspace";

const studio: ExocorpseCmsStudio = {
  assets: [
    {
      alt_text: "CMS hero",
      asset_type: "image",
      asset_url: "https://cdn.example/hero.webp",
      entry_id: "settings",
      id: "hero",
      metadata: {},
      preview_url: "https://cdn.example/hero-preview.webp",
      sort_order: 0,
      source_url: null,
      storage_path: "about/hero.webp",
      updated_at: "2026-08-14T00:00:00.000Z",
    },
  ],
  blocks: [
    {
      block_type: "markdown",
      content: { markdown: "CMS-backed biography" },
      entry_id: "settings",
      id: "settings-body",
      sort_order: 0,
      stable_source_id: null,
      title: null,
    },
    {
      block_type: "markdown",
      content: { markdown: "CMS-backed card body" },
      entry_id: "card",
      id: "card-body",
      sort_order: 0,
      stable_source_id: null,
      title: null,
    },
  ],
  collections: [
    {
      collection_type: "content",
      id: "about",
      slug: "about",
      title: "About",
    },
    {
      collection_type: "content",
      id: "about-content",
      slug: "about-content",
      title: "About Content",
    },
    {
      collection_type: "content",
      id: "about-faqs",
      slug: "about-faqs",
      title: "About FAQs",
    },
  ],
  entries: [
    {
      collection_id: "about",
      created_at: "2026-05-12T00:00:00.000Z",
      id: "settings",
      metadata: {},
      profile_data: {
        faqTitle: "Questions",
        heroImageAlt: "Portrait alt",
        heroName: "EXOCORPSE",
      },
      published_at: "2026-05-12T00:00:00.000Z",
      scheduled_for: null,
      slug: "settings",
      sort_order: 0,
      stable_source_id: null,
      status: "published",
      subtitle: null,
      summary: null,
      title: "About settings",
      updated_at: "2026-08-14T00:00:00.000Z",
    },
    {
      collection_id: "about-content",
      created_at: "2026-05-12T00:00:00.000Z",
      id: "card",
      metadata: {},
      profile_data: {
        displayOrder: 3,
        iconKey: "palette",
        section: "about_use_card",
      },
      published_at: "2026-05-12T00:00:00.000Z",
      scheduled_for: null,
      slug: "digital-art",
      sort_order: 3,
      stable_source_id: null,
      status: "published",
      subtitle: null,
      summary: null,
      title: "Digital Art",
      updated_at: "2026-08-14T00:00:00.000Z",
    },
    {
      collection_id: "about-faqs",
      created_at: "2026-05-12T00:00:00.000Z",
      id: "faq",
      metadata: {},
      profile_data: {
        display_order: 2,
        faq_type: "programs",
        programs_text: "Procreate",
        question: "What programs do you use?",
      },
      published_at: "2026-05-12T00:00:00.000Z",
      scheduled_for: null,
      slug: "programs",
      sort_order: 2,
      stable_source_id: null,
      status: "published",
      subtitle: null,
      summary: null,
      title: "Programs",
      updated_at: "2026-08-14T00:00:00.000Z",
    },
  ],
};

describe("legacy About CMS adapter", () => {
  test("maps Tuturuuu entries, blocks, and managed assets to legacy editors", () => {
    const data = aboutPageData(studio);

    expect(data.settings).toMatchObject({
      faq_title: "Questions",
      hero_bio: "CMS-backed biography",
      hero_image_alt: "Portrait alt",
      hero_image_url: "https://cdn.example/hero-preview.webp",
      hero_name: "EXOCORPSE",
    });
    expect(data.items[0]).toMatchObject({
      body: "CMS-backed card body",
      display_order: 3,
      icon_key: "palette",
      id: "card",
      section: "about_use_card",
      title: "Digital Art",
    });
    expect(data.faqs[0]).toMatchObject({
      display_order: 2,
      faq_type: "programs",
      id: "faq",
      programs_text: "Procreate",
      question: "What programs do you use?",
    });
  });
});
