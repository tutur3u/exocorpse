import type { AboutContentSection } from "@/lib/about";

const sectionNames: Partial<Record<AboutContentSection, string>> = {
  about_use_card: "What I use",
  dni_hard: "Hard boundary",
  dni_soft: "Soft boundary",
  experience: "Experience",
  favorite: "Favorite",
  more_info: "More information",
  social_link: "Social link",
};

export function aboutSectionName(section: AboutContentSection) {
  return sectionNames[section] ?? "FAQ answer";
}

function plainText(value: string) {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^[#>*+\-\d.\s]+/gm, "")
    .replace(/[*_~`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function aboutContentItemSummary(draft: {
  body: string;
  section: AboutContentSection;
  subtitle: string;
  title: string;
}) {
  const internalTitle = draft.title.trim().toLowerCase() === draft.section;
  const candidates = [
    internalTitle ? "" : draft.title,
    draft.subtitle,
    draft.body,
  ];
  const summary = candidates.map(plainText).find(Boolean);
  if (!summary)
    return `Untitled ${aboutSectionName(draft.section).toLowerCase()}`;
  return summary.length > 96 ? `${summary.slice(0, 93).trimEnd()}...` : summary;
}
