import { NextRequest } from "next/server";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src");

  if (!src) {
    return new Response("Missing src", { status: 400 });
  }

  try {
    if (!/^https?:\/\//i.test(src)) {
      return new Response("Only managed CMS asset URLs are supported", {
        status: 400,
      });
    }

    const imageResponse = await fetch(src, {
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
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Vercel-CDN-Cache-Control":
          "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Failed to generate og image:", error);
    return new Response("Failed to generate og image", { status: 500 });
  }
}
