import type { ExocorpseCmsAsset } from "@/types/exocorpse-cms";

function assetRevision(updatedAt: string) {
  return updatedAt.replace(/\D/g, "") || "0";
}

export function withAdminCmsAssetPreview(asset: ExocorpseCmsAsset) {
  const searchParams = new URLSearchParams({
    v: assetRevision(asset.updated_at),
  });

  if (asset.asset_type === "image") {
    searchParams.set("width", "1600");
    searchParams.set("height", "1600");
    searchParams.set("resize", "cover");
    searchParams.set("quality", "82");
  }

  return {
    ...asset,
    preview_url: `/api/admin/cms/assets/${encodeURIComponent(asset.id)}?${searchParams.toString()}`,
  } satisfies ExocorpseCmsAsset;
}
