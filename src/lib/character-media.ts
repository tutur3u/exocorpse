import type { ExocorpseJson } from "@/types/exocorpse-content";

type JsonRecord = Record<string, ExocorpseJson | undefined>;

function finiteNumber(value: ExocorpseJson | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function characterCrop(profile: JsonRecord, kind: "profile" | "banner") {
  const prefix = kind === "profile" ? "profileImage" : "bannerImage";
  return {
    x: finiteNumber(profile[`${prefix}PositionX`], 50),
    y: finiteNumber(profile[`${prefix}PositionY`], 50),
    zoom: finiteNumber(profile[`${prefix}Zoom`], 1),
  };
}

export function characterCropStyle(
  profile: JsonRecord,
  kind: "profile" | "banner",
) {
  const crop = characterCrop(profile, kind);
  return {
    objectPosition: `${crop.x}% ${crop.y}%`,
    transform: `scale(${crop.zoom})`,
  };
}

export function isSensitiveMedia(profile: JsonRecord) {
  return profile.sensitiveContent === true;
}

export function isReferenceSheet(profile: JsonRecord) {
  return profile.referenceSheet === true;
}
