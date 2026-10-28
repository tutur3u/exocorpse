import { verifyAuth } from "@/lib/auth/utils";
import { adminErrorResponse, adminId } from "@/lib/admin-input";
import { getExocorpseCmsAssetPreviewResponse } from "@/lib/tuturuuu-cms-repository";

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "CDN-Cache-Control": "private, no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

const ALLOWED_QUERY_PARAMETERS = [
  "format",
  "height",
  "quality",
  "resize",
  "v",
  "width",
] as const;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ assetId: string }> },
) {
  try {
    await verifyAuth();
    const { assetId } = await params;
    adminId(assetId);
    const requestUrl = new URL(request.url);
    const searchParams = new URLSearchParams();

    for (const key of ALLOWED_QUERY_PARAMETERS) {
      for (const value of requestUrl.searchParams.getAll(key)) {
        searchParams.append(key, value);
      }
    }

    const response = await getExocorpseCmsAssetPreviewResponse(
      assetId,
      searchParams,
    );
    const location = response.headers.get("location");

    if (response.status >= 300 && response.status < 400 && location) {
      return new Response(null, {
        headers: {
          ...PRIVATE_NO_STORE_HEADERS,
          Location: location,
        },
        status: 307,
      });
    }

    return Response.json(
      { error: "CMS asset preview is unavailable." },
      { headers: PRIVATE_NO_STORE_HEADERS, status: response.status },
    );
  } catch (error) {
    return adminErrorResponse(error);
  }
}
