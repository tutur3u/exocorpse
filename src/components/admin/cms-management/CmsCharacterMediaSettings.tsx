"use client";

import { characterCrop } from "@/lib/character-media";
import type { CmsEntryDraft } from "@/components/admin/cms-management/editor-types";
import { isJsonRecord } from "@/components/admin/cms-management/editor-utils";
import type { ExocorpseCmsAsset } from "@/types/exocorpse-cms";
import { Checkbox } from "@tuturuuu/ui/checkbox";
import { Input } from "@tuturuuu/ui/input";
import { Slider } from "@tuturuuu/ui/slider";
import Image from "next/image";

const customKeys = new Set([
  "profileImagePositionX",
  "profileImagePositionY",
  "profileImageZoom",
  "bannerImagePositionX",
  "bannerImagePositionY",
  "bannerImageZoom",
  "sensitiveContent",
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
  const profile = isJsonRecord(draft.profile_data) ? draft.profile_data : {};
  const setProfile = (key: string, value: string | number | boolean) =>
    onChange({ ...draft, profile_data: { ...profile, [key]: value } });

  if (collectionSlug === "characters") {
    const images = assets
      .filter((asset) => asset.asset_type === "image")
      .sort((left, right) => left.sort_order - right.sort_order);
    return (
      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div>
          <h3 className="font-semibold text-gray-950 dark:text-white">
            Image crop
          </h3>
          <p className="text-sm text-gray-500">
            Drag the controls until the face and banner focal point sit
            correctly.
          </p>
        </div>
        <div className="grid gap-4 @2xl:grid-cols-2">
          {(["profile", "banner"] as const).map((kind, index) => {
            const crop = characterCrop(profile, kind);
            const prefix = kind === "profile" ? "profileImage" : "bannerImage";
            const asset = images[index];
            return (
              <div
                className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                key={kind}
              >
                <p className="font-medium capitalize">{kind} crop</p>
                <div
                  className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${kind === "profile" ? "mx-auto aspect-square w-40 rounded-full" : "aspect-[3/1] w-full rounded-lg"}`}
                >
                  {asset?.preview_url ? (
                    <Image
                      alt={asset.alt_text || `${kind} preview`}
                      className="object-cover"
                      fill
                      src={asset.preview_url}
                      style={{
                        objectPosition: `${crop.x}% ${crop.y}%`,
                        transform: `scale(${crop.zoom})`,
                      }}
                      unoptimized
                    />
                  ) : (
                    <div className="grid h-full place-items-center px-4 text-center text-xs text-gray-500">
                      Upload the {kind} image to preview its crop.
                    </div>
                  )}
                </div>
                {(["PositionX", "PositionY"] as const).map((axis) => {
                  const key = `${prefix}${axis}`;
                  const value = axis === "PositionX" ? crop.x : crop.y;
                  return (
                    <label className="block space-y-2 text-sm" key={axis}>
                      <span>
                        {axis === "PositionX" ? "Horizontal" : "Vertical"}:{" "}
                        {value}%
                      </span>
                      <Slider
                        max={100}
                        min={0}
                        onValueChange={([next]) => setProfile(key, next ?? 50)}
                        step={1}
                        value={[value]}
                      />
                    </label>
                  );
                })}
                <label className="block space-y-2 text-sm">
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
        <label className="block space-y-2 text-sm">
          <span>Spoiler warning</span>
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
