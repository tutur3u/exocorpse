import { batchGetCachedSignedUrls } from "@/lib/actions/storage";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");

  if (!path) {
    return new Response("Missing path", { status: 400 });
  }

  try {
    const signedUrls = await batchGetCachedSignedUrls([path]);
    const signedUrl = signedUrls.get(path);

    if (!signedUrl) {
      return new Response("Image not found", { status: 404 });
    }

    const upstreamResponse = await fetch(signedUrl, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!upstreamResponse.ok) {
      return new Response("Failed to fetch image", { status: 502 });
    }

    const buffer = Buffer.from(await upstreamResponse.arrayBuffer());
    const sharp = (await import("sharp")).default;
    const pngBuffer = await sharp(buffer).png().toBuffer();

    return new Response(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Failed to serve og image:", error);
    return new Response("Failed to generate og image", { status: 500 });
  }
}
