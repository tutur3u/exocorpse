"use client";

import { isJsonRecord } from "@/components/admin/cms-management/editor-utils";
import type {
  ExocorpseCmsCollection,
  ExocorpseCmsEntry,
  ExocorpseJson,
} from "@/types/exocorpse-cms";
import { Pencil, Plus, Trash2 } from "lucide-react";

const groupCopy: Record<string, { description: string; title: string }> = {
  about_use_card: {
    description: "Controls the feature cards inside the public About tab.",
    title: "What I Use Cards",
  },
  dni_hard: {
    description: "Hardblock boundaries shown in the red panel.",
    title: "Hard DNI Rules",
  },
  dni_soft: {
    description: "Preference-based boundaries shown in the yellow panel.",
    title: "Soft DNI Rules",
  },
  experience: {
    description: "Short experience notes displayed on the About page.",
    title: "Experiences",
  },
  favorite: {
    description: "Favorite categories and their listed items.",
    title: "Favorites",
  },
  more_info: {
    description: "Additional profile details shown below the introduction.",
    title: "More Information",
  },
  social_link: {
    description:
      "Controls the ordering, icon theme, and width of the public social cards.",
    title: "Social Platform Cards",
  },
};

function entrySection(entry: ExocorpseCmsEntry) {
  const profile = isJsonRecord(entry.profile_data) ? entry.profile_data : {};
  return typeof profile.section === "string" ? profile.section : "content";
}

export default function CmsAboutEntryGallery({
  aboutTab,
  collection,
  entries,
  onCreate,
  onDelete,
  onSelect,
}: {
  aboutTab?: "about" | "dni" | "faq" | "profile" | "socials";
  collection: ExocorpseCmsCollection;
  entries: ExocorpseCmsEntry[];
  onCreate: (profileData?: Record<string, ExocorpseJson>) => void;
  onDelete: (entry: ExocorpseCmsEntry) => void;
  onSelect: (entryId: string) => void;
}) {
  if (collection.slug === "about") {
    const profile = entries[0];
    return (
      <section className="rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Profile & Section Copy
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Hero identity, introductory copy, and the labels used throughout
              the public About window.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
            onClick={() => (profile ? onSelect(profile.id) : onCreate())}
            type="button"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </button>
        </div>
      </section>
    );
  }

  if (collection.slug === "about-faqs") {
    return (
      <section className="rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Fixed FAQ renderers and the copy shown inside each answer.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
            onClick={() => onCreate()}
            type="button"
          >
            <Plus className="h-4 w-4" /> Add FAQ
          </button>
        </div>
        <div className="mt-6 space-y-3">
          {entries.map((entry) => (
            <article
              className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
              key={entry.id}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {entry.title}
                  </h3>
                  {(entry.summary ?? entry.subtitle) ? (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {entry.summary ?? entry.subtitle}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                    onClick={() => onSelect(entry.id)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                    onClick={() => onDelete(entry)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  const sections =
    aboutTab === "dni"
      ? ["dni_soft", "dni_hard"]
      : aboutTab === "socials"
        ? ["social_link"]
        : ["about_use_card", "experience", "favorite", "more_info"];
  const groups = new Map<string, ExocorpseCmsEntry[]>(
    sections.map((section) => [section, []]),
  );
  for (const entry of entries) {
    const section = entrySection(entry);
    const sectionEntries = groups.get(section);
    if (sectionEntries) sectionEntries.push(entry);
    else groups.set(section, [entry]);
  }
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {[...groups.entries()].map(([section, sectionEntries]) => {
        const copy = groupCopy[section] ?? {
          description: "Content displayed in the public About window.",
          title: section.replaceAll("_", " "),
        };
        return (
          <section
            className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950"
            key={section}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 capitalize dark:text-white">
                  {copy.title}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {copy.description}
                </p>
              </div>
              <button
                aria-label={`Add ${copy.title}`}
                className="rounded-lg bg-cyan-100 p-2 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400"
                onClick={() => onCreate({ section })}
                type="button"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {sectionEntries.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                  No entries yet. Add the first one for this section.
                </p>
              ) : null}
              {sectionEntries.map((entry) => (
                <article
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
                  key={entry.id}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {entry.title}
                  </h3>
                  {(entry.summary ?? entry.subtitle) ? (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {entry.summary ?? entry.subtitle}
                    </p>
                  ) : null}
                  <div className="mt-3 flex gap-2">
                    <button
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                      onClick={() => onSelect(entry.id)}
                      type="button"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                      onClick={() => onDelete(entry)}
                      type="button"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
