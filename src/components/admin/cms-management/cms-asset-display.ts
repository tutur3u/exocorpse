import type { ExocorpseCmsAsset } from "@/types/exocorpse-cms";

export type CmsMediaTab = "linked" | "inline";

export function isInlineCmsAsset(asset: ExocorpseCmsAsset) {
  return asset.asset_type === "inline-image";
}

export function isVisualCmsAsset(asset: ExocorpseCmsAsset) {
  return asset.asset_type === "image" || isInlineCmsAsset(asset);
}

export function cmsAssetTypeLabel(asset: ExocorpseCmsAsset) {
  if (isInlineCmsAsset(asset)) return "Inline image";
  if (asset.asset_type === "image") return "Linked image";
  return asset.asset_type
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function partitionCmsAssets(assets: ExocorpseCmsAsset[]) {
  return {
    inline: assets.filter(isInlineCmsAsset),
    linked: assets.filter((asset) => !isInlineCmsAsset(asset)),
  };
}
