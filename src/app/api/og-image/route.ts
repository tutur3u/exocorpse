import { fetchStorageUrl } from "@/lib/storage-fetch";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");

  if (!path) {
    return new Response("Missing path", { status: 400 });
  }

  const signedUrl = await fetchStorageUrl(path);

  if (!signedUrl) {
    return new Response("Image not found", { status: 404 });
  }

  const upstreamResponse = await fetch(signedUrl, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!upstreamResponse.ok) {
    return new Response("Failed to fetch image", { status: 502 });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    upstreamResponse.headers.get("content-type") || "image/webp",
  );
  headers.set(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate=604800",
  );

  return new Response(upstreamResponse.body, {
    status: 200,
    headers,
  });
}
