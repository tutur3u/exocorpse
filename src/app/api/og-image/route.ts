import { isTuturuuuCmsAssetUrl } from "@/lib/storage-image";
import { readBoundedBody, BodyTooLargeError } from "@/lib/bounded-body";
import { NextRequest } from "next/server";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const CMS_STORAGE_ORIGIN = "https://nzamlzqfdwaaxdefwraj.supabase.co";
export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src");

  if (!src) {
    return new Response("Missing src", { status: 400 });
  }

  try {
    if (
      !isTuturuuuCmsAssetUrl(src) ||
      new URL(src).username ||
      new URL(src).password ||
      new URL(src).port
    ) {
      return new Response("Only managed CMS asset URLs are supported", {
        status: 400,
      });
    }

    const fetchOptions = {
      redirect: "manual",
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    } satisfies RequestInit;
    let imageResponse = await fetch(src, fetchOptions);

    if ([301, 302, 303, 307, 308].includes(imageResponse.status)) {
      const location = imageResponse.headers.get("location");
      await imageResponse.body?.cancel();
      if (!location || !URL.canParse(location)) {
        return new Response("Invalid image redirect", { status: 502 });
      }
      const target = new URL(location);
      if (
        target.origin !== CMS_STORAGE_ORIGIN ||
        target.username ||
        target.password ||
        !target.pathname.startsWith("/storage/v1/object/sign/")
      ) {
        return new Response("Invalid image redirect", { status: 502 });
      }
      imageResponse = await fetch(target.href, fetchOptions);
    }

    if (!imageResponse.ok) {
      return new Response("Failed to fetch image", { status: 502 });
    }

    const imageBuffer = Buffer.from(
      await readBoundedBody(imageResponse, 5 * 1024 * 1024),
    );
    const sharp = (await import("sharp")).default;
    const output = await sharp(imageBuffer, { limitInputPixels: 25_000_000 })
      .timeout({ seconds: 5 })
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
    if (error instanceof BodyTooLargeError) {
      return new Response("Image too large", { status: 413 });
    }
    console.error("Failed to generate og image");
    return new Response("Failed to generate og image", { status: 500 });
  }
}
