import { getCachedSignedUrl } from "@/lib/actions/storage";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_TRANSFORM = {
  width: OG_WIDTH,
  height: OG_HEIGHT,
  resize: "cover" as const,
  quality: 72,
};

function isAbsoluteUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src");

  if (!src) {
    return new Response("Missing src", { status: 400 });
  }

  try {
    const resolvedUrl = isAbsoluteUrl(src)
      ? src
      : await getCachedSignedUrl(src, {
          transform: OG_TRANSFORM,
        });

    if (!resolvedUrl) {
      return new Response("Image not found", { status: 404 });
    }

    const imageResponse = await fetch(resolvedUrl, {
      next: {
        revalidate: 86400,
      },
    });

    if (!imageResponse.ok) {
      return new Response("Failed to fetch image", { status: 502 });
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const sharp = (await import("sharp")).default;
    const output = await sharp(imageBuffer)
      .resize(OG_WIDTH, OG_HEIGHT, {
        fit: "cover",
        position: "center",
      })
      .jpeg({
        quality: 72,
        mozjpeg: true,
        progressive: true,
      })
      .toBuffer();

    return new Response(new Uint8Array(output), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Failed to generate og image:", error);
    return new Response("Failed to generate og image", { status: 500 });
  }
}
