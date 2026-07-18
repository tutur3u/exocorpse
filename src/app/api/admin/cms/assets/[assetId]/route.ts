import { getExocorpseCmsAssetPreviewResponse } from "@/lib/tuturuuu-cms-repository";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store",
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
  const { assetId } = await params;
  const requestUrl = new URL(request.url);
  const searchParams = new URLSearchParams();

  for (const key of ALLOWED_QUERY_PARAMETERS) {
    for (const value of requestUrl.searchParams.getAll(key)) {
      searchParams.append(key, value);
    }
  }

  try {
    const response = await getExocorpseCmsAssetPreviewResponse(
      assetId,
      searchParams,
    );
    const location = response.headers.get("location");

    if (response.status >= 300 && response.status < 400 && location) {
      return new Response(null, {
        headers: { ...PRIVATE_HEADERS, Location: location },
        status: 307,
      });
    }

    return Response.json(
      { error: "CMS asset preview is unavailable." },
      { headers: PRIVATE_HEADERS, status: response.status },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "CMS asset preview is unavailable.",
      },
      { headers: PRIVATE_HEADERS, status: 401 },
    );
  }
}
