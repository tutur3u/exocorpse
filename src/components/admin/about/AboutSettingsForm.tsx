"use client";

import CmsAssetManager from "@/components/admin/cms-management/CmsAssetManager";
import type { AboutPageSettings } from "@/lib/about";
import type { ExocorpseCmsAsset } from "@/types/exocorpse-cms";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@tuturuuu/ui/input";
import { Textarea } from "@tuturuuu/ui/textarea";
import { Button } from "@tuturuuu/ui/button";

type AboutSettingsFormProps = {
  assets: ExocorpseCmsAsset[];
  mediaPending: boolean;
  onDeleteAsset: (assetId: string) => void;
  onReorderAssets: (assets: ExocorpseCmsAsset[]) => void;
  settings: AboutPageSettings;
  onSave: (updates: Partial<AboutPageSettings>) => Promise<void>;
  onUploadAsset: (file: File) => void;
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

export default function AboutSettingsForm({
  assets,
  mediaPending,
  onDeleteAsset,
  onReorderAssets,
  settings,
  onSave,
  onUploadAsset,
}: AboutSettingsFormProps) {
  const [draft, setDraft] = useState<SettingsDraft>(toDraft(settings));
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<"hero" | "labels">("hero");
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
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-col gap-4 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
        <nav
          aria-label="Profile settings"
          className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900"
        >
          {(["hero", "labels"] as const).map((item) => (
            <button
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${section === item ? "bg-white text-blue-700 shadow-sm dark:bg-gray-800 dark:text-blue-300" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}
              key={item}
              onClick={() => setSection(item)}
              type="button"
            >
              {item === "hero" ? "Profile" : "Section labels"}
            </button>
          ))}
        </nav>
        <Button
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
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>

      {section === "hero" ? (
        <div className="space-y-5 p-5">
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/40">
            <CmsAssetManager
              allowedAssetTypes={["image"]}
              assets={assets}
              disabled={mediaPending}
              onDelete={onDeleteAsset}
              onUpload={onUploadAsset}
              onReorder={onReorderAssets}
            />
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              The first image is shown on your About page.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Hero Name
              </span>
              <Input
                value={draft.hero_name}
                onChange={(event) => setField("hero_name", event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 transition outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Hero Image Alt
              </span>
              <Input
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
            <Input
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
            <Textarea
              value={draft.hero_bio}
              rows={6}
              onChange={(event) => setField("hero_bio", event.target.value)}
              className="resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 transition outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </label>
        </div>
      ) : (
        <div className="grid gap-4 p-5 md:grid-cols-2">
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
                  <Textarea
                    value={draft[fieldKey]}
                    rows={3}
                    onChange={(event) => setField(fieldKey, event.target.value)}
                    className="resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 transition outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                ) : (
                  <Input
                    value={draft[fieldKey]}
                    onChange={(event) => setField(fieldKey, event.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 transition outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                )}
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
}
