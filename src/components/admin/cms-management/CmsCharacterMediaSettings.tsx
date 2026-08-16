"use client";

import { isJsonRecord } from "@/components/admin/cms-management/editor-utils";
import type { CmsEntryDraft } from "@/components/admin/cms-management/editor-types";
import { characterCrop } from "@/lib/character-media";
import type { ExocorpseCmsAsset } from "@/types/exocorpse-cms";
import { Button } from "@tuturuuu/ui/button";
import { Checkbox } from "@tuturuuu/ui/checkbox";
import { Input } from "@tuturuuu/ui/input";
import { Slider } from "@tuturuuu/ui/slider";
import { Check, Pencil } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const customKeys = new Set([
  "profileImagePositionX",
  "profileImagePositionY",
  "profileImageZoom",
  "bannerImagePositionX",
  "bannerImagePositionY",
  "bannerImageZoom",
  "sensitiveContent",
  "sensitiveType",
  "sensitiveLabel",
  "referenceSheet",
]);

export function isCharacterMediaField(key: string) {
  return customKeys.has(key);
}

export default function CmsCharacterMediaSettings({
  assets,
  collectionSlug,
  draft,
  onChange,
}: {
  assets: ExocorpseCmsAsset[];
  collectionSlug: string;
  draft: CmsEntryDraft;
  onChange: (draft: CmsEntryDraft) => void;
}) {
  const [editingCrop, setEditingCrop] = useState(false);
  const profile = isJsonRecord(draft.profile_data) ? draft.profile_data : {};
  const setProfile = (key: string, value: string | number | boolean) =>
    onChange({ ...draft, profile_data: { ...profile, [key]: value } });

  if (collectionSlug === "characters") {
    const images = assets
      .filter((asset) => asset.asset_type === "image")
      .sort((left, right) => left.sort_order - right.sort_order);
    return (
      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-gray-950 dark:text-white">
              Profile and banner preview
            </h4>
            <p className="text-sm text-gray-500">
              Check how both images will appear on the character page.
            </p>
          </div>
          <Button
            onClick={() => setEditingCrop((current) => !current)}
            size="sm"
            type="button"
            variant="outline"
          >
            {editingCrop ? (
              <Check className="h-4 w-4" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
            {editingCrop ? "Done" : "Edit crop"}
          </Button>
        </div>
        <div className="grid gap-4 @2xl:grid-cols-[14rem_minmax(0,1fr)]">
          {(["profile", "banner"] as const).map((kind, index) => {
            const crop = characterCrop(profile, kind);
            const prefix = kind === "profile" ? "profileImage" : "bannerImage";
            const asset = images[index];
            const imageUrl = asset?.preview_url ?? asset?.asset_url;
            return (
              <div
                className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                key={kind}
              >
                <p className="text-sm font-semibold capitalize">{kind} image</p>
                <div
                  className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${kind === "profile" ? "mx-auto aspect-square w-28 rounded-full" : "aspect-[4/1] w-full rounded-lg"}`}
                >
                  {imageUrl ? (
                    <Image
                      alt={asset.alt_text || `${kind} preview`}
                      className="object-cover"
                      fill
                      src={imageUrl}
                      style={{
                        objectPosition: `${crop.x}% ${crop.y}%`,
                        transform: `scale(${crop.zoom})`,
                      }}
                      unoptimized
                    />
                  ) : (
                    <div className="grid h-full place-items-center px-4 text-center text-xs text-gray-500">
                      Upload the {kind} image to preview it.
                    </div>
                  )}
                </div>
                {editingCrop ? (
                  <div className="space-y-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                    {(["PositionX", "PositionY"] as const).map((axis) => {
                      const key = `${prefix}${axis}`;
                      const value = axis === "PositionX" ? crop.x : crop.y;
                      return (
                        <label className="block space-y-1.5 text-xs" key={axis}>
                          <span>
                            {axis === "PositionX" ? "Horizontal" : "Vertical"}:{" "}
                            {value}%
                          </span>
                          <Slider
                            max={100}
                            min={0}
                            onValueChange={([next]) =>
                              setProfile(key, next ?? 50)
                            }
                            step={1}
                            value={[value]}
                          />
                        </label>
                      );
                    })}
                    <label className="block space-y-1.5 text-xs">
                      <span>Zoom: {crop.zoom.toFixed(2)}x</span>
                      <Slider
                        max={2}
                        min={1}
                        onValueChange={([next]) =>
                          setProfile(`${prefix}Zoom`, next ?? 1)
                        }
                        step={0.05}
                        value={[crop.zoom]}
                      />
                    </label>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (!["character-gallery", "character-outfits"].includes(collectionSlug))
    return null;
  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div>
        <h3 className="font-semibold text-gray-950 dark:text-white">
          Image viewing
        </h3>
        <p className="text-sm text-gray-500">
          Control sensitive-content cover and reference-sheet downloads.
        </p>
      </div>
      <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
        <Checkbox
          checked={profile.sensitiveContent === true}
          onCheckedChange={(checked) =>
            setProfile("sensitiveContent", checked === true)
          }
        />
        <span>
          <span className="block font-medium">Sensitive content spoiler</span>
          <span className="text-sm text-gray-500">
            Visitors must reveal the image before viewing it.
          </span>
        </span>
      </label>
      {profile.sensitiveContent === true ? (
        <div className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <div>
            <p className="text-sm font-medium">Content warning</p>
            <p className="text-xs text-gray-500">
              Choose the cover visitors see before revealing the image.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["nsfw", "Adult / NSFW"],
                ["gore", "Gore / violence"],
                ["nudity", "Nudity"],
                ["suggestive", "Suggestive"],
                ["violence", "Violence"],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                onClick={() => {
                  onChange({
                    ...draft,
                    profile_data: {
                      ...profile,
                      sensitiveType: value,
                      sensitiveLabel:
                        profile.sensitiveLabel ||
                        (value === "nsfw"
                          ? "Adult content — click to reveal"
                          : value === "gore"
                            ? "Graphic content — click to reveal"
                            : `${label} — click to reveal`),
                    },
                  });
                }}
                type="button"
                variant={
                  profile.sensitiveType === value ? "default" : "outline"
                }
              >
                {label}
              </Button>
            ))}
          </div>
          <label className="block space-y-2 text-sm">
            <span>Custom warning (optional)</span>
            <Input
              onChange={(event) =>
                setProfile("sensitiveLabel", event.target.value)
              }
              placeholder="Sensitive image — click to reveal"
              value={
                typeof profile.sensitiveLabel === "string"
                  ? profile.sensitiveLabel
                  : ""
              }
            />
          </label>
        </div>
      ) : null}
      <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
        <Checkbox
          checked={profile.referenceSheet === true}
          onCheckedChange={(checked) =>
            setProfile("referenceSheet", checked === true)
          }
        />
        <span>
          <span className="block font-medium">Character reference sheet</span>
          <span className="text-sm text-gray-500">
            Adds a download button to this image only.
          </span>
        </span>
      </label>
    </section>
  );
}
