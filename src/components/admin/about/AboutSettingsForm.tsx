"use client";

import ImageUploader from "@/components/shared/ImageUploader";
import type { AboutPageSettings } from "@/lib/about";
import { deleteFile } from "@/lib/actions/storage";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type AboutSettingsFormProps = {
  settings: AboutPageSettings;
  onSave: (updates: Partial<AboutPageSettings>) => Promise<void>;
};

type SettingsDraft = {
  hero_name: string;
  hero_subtitle: string;
  hero_bio: string;
  hero_image_url: string;
  hero_image_alt: string;
  about_use_heading: string;
  experiences_heading: string;
  more_info_heading: string;
  favorites_heading: string;
  faq_title: string;
  faq_intro: string;
  dni_title: string;
  dni_intro: string;
  socials_title: string;
  socials_intro: string;
  socials_primary_username: string;
  socials_secondary_username: string;
};

function toDraft(settings: AboutPageSettings): SettingsDraft {
  return {
    hero_name: settings.hero_name,
    hero_subtitle: settings.hero_subtitle,
    hero_bio: settings.hero_bio,
    hero_image_url: settings.hero_image_url ?? "",
    hero_image_alt: settings.hero_image_alt,
    about_use_heading: settings.about_use_heading,
    experiences_heading: settings.experiences_heading,
    more_info_heading: settings.more_info_heading,
    favorites_heading: settings.favorites_heading,
    faq_title: settings.faq_title,
    faq_intro: settings.faq_intro,
    dni_title: settings.dni_title,
    dni_intro: settings.dni_intro,
    socials_title: settings.socials_title,
    socials_intro: settings.socials_intro,
    socials_primary_username: settings.socials_primary_username,
    socials_secondary_username: settings.socials_secondary_username,
  };
}

async function deleteStoredHeroImage(oldValue: string, newValue: string) {
  if (
    !oldValue ||
    oldValue === newValue ||
    oldValue.startsWith("http://") ||
    oldValue.startsWith("https://") ||
    oldValue.startsWith("/")
  ) {
    return;
  }

  await deleteFile(oldValue);
}

export default function AboutSettingsForm({
  settings,
  onSave,
}: AboutSettingsFormProps) {
  const [draft, setDraft] = useState<SettingsDraft>(toDraft(settings));
  const [saving, setSaving] = useState(false);
  const initialDraft = useMemo(() => toDraft(settings), [settings]);
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(initialDraft);

  useEffect(() => {
    setDraft(toDraft(settings));
  }, [settings]);

  const setField = (key: keyof SettingsDraft, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <section className="space-y-6 rounded-[2rem] border border-gray-200 bg-linear-to-br from-white via-white to-gray-50 p-6 shadow-sm dark:border-gray-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-blue-600 uppercase dark:text-blue-400">
            Profile Control
          </p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            Hero and Section Copy
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Update the public header image, identity text, and the labels shown
            across the About, FAQ, DNI, and Socials tabs.
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            setSaving(true);
            try {
              await onSave({
                ...draft,
                hero_image_url: draft.hero_image_url.trim() || null,
              });
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving || !hasChanges}
          className="rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile Settings"}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <details
          open
          className="group rounded-[1.5rem] border border-gray-200 bg-white/80 dark:border-gray-800 dark:bg-gray-950/80"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Hero
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                This is the panel visitors see before switching tabs.
              </p>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
          </summary>

          <div className="space-y-5 border-t border-gray-200 p-5 dark:border-gray-800">
            <ImageUploader
              label="Hero Image"
              value={draft.hero_image_url}
              onChange={(value) => setField("hero_image_url", value)}
              helpText="Use a public URL, keep the current local image, or upload a new hero image."
              uploadPath="about/hero"
              onBeforeChange={deleteStoredHeroImage}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Hero Name
                </span>
                <input
                  value={draft.hero_name}
                  onChange={(event) =>
                    setField("hero_name", event.target.value)
                  }
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 transition outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Hero Image Alt
                </span>
                <input
                  value={draft.hero_image_alt}
                  onChange={(event) =>
                    setField("hero_image_alt", event.target.value)
                  }
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 transition outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Hero Subtitle
              </span>
              <input
                value={draft.hero_subtitle}
                onChange={(event) =>
                  setField("hero_subtitle", event.target.value)
                }
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 transition outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Hero Bio
              </span>
              <textarea
                value={draft.hero_bio}
                rows={6}
                onChange={(event) => setField("hero_bio", event.target.value)}
                className="resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 transition outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </label>
          </div>
        </details>

        <details
          open
          className="group rounded-[1.5rem] border border-gray-200 bg-white/80 dark:border-gray-800 dark:bg-gray-950/80"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Public Labels
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Fine-tune the language used in each public tab and section.
              </p>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
          </summary>

          <div className="grid gap-4 border-t border-gray-200 p-5 dark:border-gray-800">
            {[
              ["about_use_heading", "About Use Heading"],
              ["experiences_heading", "Experiences Heading"],
              ["more_info_heading", "More Info Heading"],
              ["favorites_heading", "Favorites Heading"],
              ["faq_title", "FAQ Title"],
              ["faq_intro", "FAQ Intro"],
              ["dni_title", "DNI Title"],
              ["dni_intro", "DNI Intro"],
              ["socials_title", "Socials Title"],
              ["socials_intro", "Socials Intro"],
              ["socials_primary_username", "Primary Username"],
              ["socials_secondary_username", "Secondary Username"],
            ].map(([key, label]) => {
              const fieldKey = key as keyof SettingsDraft;
              const isLongText = key.endsWith("_intro");

              return (
                <label key={key} className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {label}
                  </span>
                  {isLongText ? (
                    <textarea
                      value={draft[fieldKey]}
                      rows={3}
                      onChange={(event) =>
                        setField(fieldKey, event.target.value)
                      }
                      className="resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 transition outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  ) : (
                    <input
                      value={draft[fieldKey]}
                      onChange={(event) =>
                        setField(fieldKey, event.target.value)
                      }
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 transition outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  )}
                </label>
              );
            })}
          </div>
        </details>
      </div>
    </section>
  );
}
