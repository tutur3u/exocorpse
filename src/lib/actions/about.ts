"use server";

import { DEFAULT_ABOUT_SETTINGS, type AboutPageData } from "@/lib/about";
import { getCmsAboutPageData } from "@/lib/tuturuuu-cms-delivery";

export async function getAboutPageData(): Promise<AboutPageData> {
  return (
    (await getCmsAboutPageData()) ?? {
      faqs: [],
      items: [],
      settings: DEFAULT_ABOUT_SETTINGS,
    }
  );
}
