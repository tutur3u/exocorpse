import type { Tables } from "../../supabase/types";

export const ABOUT_FAQ_TYPES = [
  "programs",
  "brushes",
  "permissions",
  "social",
  "assets",
  "artists",
  "commissions",
  "username",
  "alias",
] as const;

export const ABOUT_CONTENT_SECTIONS = [
  "about_use_card",
  "experience",
  "more_info",
  "favorite",
  "social_link",
  "dni_soft",
  "dni_hard",
  "faq_program_other",
  "faq_brush_inside",
  "faq_brush_outside",
  "faq_permission_allowed",
  "faq_permission_prohibited",
  "faq_asset_credit",
  "faq_artist",
] as const;

export const ABOUT_SOCIAL_ICON_KEYS = [
  "tumblr",
  "twitch",
  "vgen",
  "bluesky",
  "discord",
  "twitter",
] as const;

export const ABOUT_SOCIAL_COLOR_KEYS = [
  "blue",
  "purple",
  "pink",
  "sky",
  "indigo",
  "vgen",
] as const;

export const ABOUT_USE_ICON_KEYS = ["palette", "desktop", "pencil"] as const;

export type AboutFaqType = (typeof ABOUT_FAQ_TYPES)[number];
export type AboutContentSection = (typeof ABOUT_CONTENT_SECTIONS)[number];
export type AboutSocialIconKey = (typeof ABOUT_SOCIAL_ICON_KEYS)[number];
export type AboutSocialColorKey = (typeof ABOUT_SOCIAL_COLOR_KEYS)[number];
export type AboutUseIconKey = (typeof ABOUT_USE_ICON_KEYS)[number];

export type AboutPageSettings = Tables<"about_page_settings">;
export type AboutFaq = Tables<"about_faqs">;
export type AboutContentItem = Tables<"about_content_items">;

export type AboutPageData = {
  settings: AboutPageSettings;
  faqs: AboutFaq[];
  items: AboutContentItem[];
};

export type InitialAboutData = AboutPageData;

export const DEFAULT_ABOUT_SETTINGS: AboutPageSettings = {
  id: 1,
  hero_name: "",
  hero_subtitle: "",
  hero_bio: "",
  hero_image_url: null,
  hero_image_alt: "About Me",
  about_use_heading: "What I Use",
  experiences_heading: "Experiences",
  more_info_heading: "More Information",
  favorites_heading: "Favorites",
  faq_title: "Frequently Asked Questions",
  faq_intro: "",
  dni_title: "Do Not Interact",
  dni_intro: "",
  socials_title: "Social Media",
  socials_intro: "",
  socials_primary_username: "exocorpse",
  socials_secondary_username: "exocorpsehq",
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

export function groupAboutItemsBySection(items: AboutContentItem[]) {
  return ABOUT_CONTENT_SECTIONS.reduce(
    (acc, section) => {
      acc[section] = items
        .filter((item) => item.section === section)
        .sort((a, b) => {
          if (a.display_order !== b.display_order) {
            return a.display_order - b.display_order;
          }

          return a.created_at.localeCompare(b.created_at);
        });
      return acc;
    },
    {} as Record<AboutContentSection, AboutContentItem[]>,
  );
}

export function mapAboutFaqsByType(faqs: AboutFaq[]) {
  return ABOUT_FAQ_TYPES.reduce(
    (acc, faqType) => {
      acc[faqType] = faqs.find((faq) => faq.faq_type === faqType) ?? null;
      return acc;
    },
    {} as Record<AboutFaqType, AboutFaq | null>,
  );
}
