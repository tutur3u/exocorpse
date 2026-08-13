import type { AdminCmsSectionKey } from "@/lib/admin-cms-sections";

export type AdminCmsTheme = {
  accentText: string;
  activeTab: string;
  button: string;
  emptyIcon: string;
  media: string;
};

const THEMES: Record<AdminCmsSectionKey, AdminCmsTheme> = {
  about: {
    accentText: "text-cyan-700 dark:text-cyan-400",
    activeTab:
      "border-cyan-300 bg-cyan-50 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-300",
    button: "bg-linear-to-r from-cyan-600 to-blue-600 hover:shadow-lg",
    emptyIcon:
      "bg-linear-to-br from-cyan-100 to-blue-100 text-cyan-600 dark:from-cyan-900/30 dark:to-blue-900/30 dark:text-cyan-400",
    media: "bg-linear-to-br from-cyan-400 via-blue-400 to-indigo-400",
  },
  addons: {
    accentText: "text-blue-600 dark:text-blue-400",
    activeTab:
      "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400",
    button: "bg-blue-600 hover:bg-blue-700",
    emptyIcon:
      "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    media: "bg-linear-to-br from-blue-400 via-indigo-400 to-purple-400",
  },
  "blog-posts": {
    accentText: "text-red-700 dark:text-red-300",
    activeTab:
      "border-red-600 text-red-700 dark:border-red-400 dark:text-red-300",
    button: "bg-red-600 hover:bg-red-700",
    emptyIcon: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    media: "bg-linear-to-br from-red-500 via-rose-500 to-zinc-700",
  },
  characters: {
    accentText: "text-green-600 dark:text-green-400",
    activeTab:
      "border-green-500 text-green-600 dark:border-green-400 dark:text-green-400",
    button: "bg-linear-to-r from-green-600 to-emerald-600 hover:shadow-lg",
    emptyIcon:
      "bg-linear-to-br from-green-100 to-emerald-100 text-green-600 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400",
    media: "bg-linear-to-br from-green-400 via-emerald-400 to-teal-400",
  },
  cms: {
    accentText: "text-blue-600 dark:text-blue-400",
    activeTab:
      "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400",
    button: "bg-blue-600 hover:bg-blue-700",
    emptyIcon:
      "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    media: "bg-linear-to-br from-blue-400 via-indigo-400 to-purple-400",
  },
  factions: {
    accentText: "text-purple-600 dark:text-purple-400",
    activeTab:
      "border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400",
    button: "bg-linear-to-r from-purple-600 to-pink-600 hover:shadow-lg",
    emptyIcon:
      "bg-linear-to-br from-purple-100 to-pink-100 text-purple-600 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-400",
    media: "bg-linear-to-br from-purple-400 via-pink-400 to-rose-400",
  },
  locations: {
    accentText: "text-amber-600 dark:text-amber-400",
    activeTab:
      "border-amber-500 text-amber-700 dark:border-amber-400 dark:text-amber-400",
    button: "bg-linear-to-r from-amber-600 to-orange-600 hover:shadow-lg",
    emptyIcon:
      "bg-linear-to-br from-amber-100 to-orange-100 text-amber-600 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-400",
    media: "bg-linear-to-br from-amber-400 via-orange-400 to-red-400",
  },
  portfolio: {
    accentText: "text-blue-600 dark:text-blue-400",
    activeTab:
      "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400",
    button: "bg-blue-600 hover:bg-blue-700",
    emptyIcon:
      "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    media: "bg-linear-to-br from-blue-400 via-indigo-400 to-purple-400",
  },
  services: {
    accentText: "text-blue-600 dark:text-blue-400",
    activeTab:
      "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400",
    button: "bg-blue-600 hover:bg-blue-700",
    emptyIcon:
      "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    media: "bg-linear-to-br from-blue-400 via-indigo-400 to-purple-400",
  },
  stories: {
    accentText: "text-blue-600 dark:text-blue-400",
    activeTab:
      "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400",
    button: "bg-linear-to-r from-blue-600 to-purple-600 hover:shadow-lg",
    emptyIcon:
      "bg-linear-to-br from-blue-100 to-purple-100 text-blue-600 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-400",
    media: "bg-linear-to-br from-blue-500 via-purple-500 to-pink-500",
  },
  worlds: {
    accentText: "text-indigo-600 dark:text-indigo-400",
    activeTab:
      "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400",
    button: "bg-linear-to-r from-indigo-600 to-cyan-600 hover:shadow-lg",
    emptyIcon:
      "bg-linear-to-br from-indigo-100 to-cyan-100 text-indigo-600 dark:from-indigo-900/30 dark:to-cyan-900/30 dark:text-indigo-400",
    media: "bg-linear-to-br from-indigo-400 via-cyan-400 to-teal-400",
  },
};

export function adminCmsTheme(sectionKey: AdminCmsSectionKey) {
  return THEMES[sectionKey];
}
