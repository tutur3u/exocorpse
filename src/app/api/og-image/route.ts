import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const COVER_PANEL_WIDTH = 360;
const COVER_PANEL_HEIGHT = 500;
const COVER_PANEL_LEFT = 780;
const COVER_PANEL_TOP = 64;

function escapeSvgText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function trimCopy(value: string | null, fallback: string, maxLength: number) {
  const normalized = value?.replace(/\s+/g, " ").trim() || fallback;
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function wrapText(value: string, maxCharsPerLine: number, maxLines: number) {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
      if (lines.length === maxLines) {
        break;
      }
    }

    currentLine = word;
  }

  if (lines.length < maxLines && currentLine) {
    lines.push(currentLine);
  }

  if (lines.length > maxLines) {
    lines.length = maxLines;
  }

  if (lines.length === maxLines) {
    const lastLine = lines[maxLines - 1] ?? "";
    if (lastLine !== value) {
      lines[maxLines - 1] = lastLine.endsWith("…")
        ? lastLine
        : `${lastLine.replace(/[.,;:!?-]+$/u, "").trimEnd()}…`;
    }
  }

  return lines.map(escapeSvgText);
}

function createTextSvg({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const titleLines = wrapText(title, 20, 4);
  const descriptionLines = wrapText(description, 42, 3);
  const titleText = titleLines
    .map((line, index) => {
      const dy = index === 0 ? "0" : "1.08em";
      return `<tspan x="96" dy="${dy}">${line}</tspan>`;
    })
    .join("");
  const descriptionText = descriptionLines
    .map((line, index) => {
      const dy = index === 0 ? "0" : "1.42em";
      return `<tspan x="96" dy="${dy}">${line}</tspan>`;
    })
    .join("");

  return `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ef4444" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
        <linearGradient id="coverFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#05070d" stop-opacity="0.96" />
          <stop offset="68%" stop-color="#05070d" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#05070d" stop-opacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="760" height="${CARD_HEIGHT}" fill="url(#coverFade)" />
      <rect x="60" y="56" width="11" height="110" rx="5.5" fill="url(#accent)" />
      <rect x="${COVER_PANEL_LEFT - 14}" y="${COVER_PANEL_TOP - 14}" width="${COVER_PANEL_WIDTH + 28}" height="${COVER_PANEL_HEIGHT + 28}" rx="30" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2" />

      <text x="96" y="112" fill="#fafafa" font-size="58" font-family="Arial, sans-serif" font-weight="800">
        ${titleText}
      </text>

      <text x="96" y="394" fill="#d4d4d8" font-size="24" font-family="Arial, sans-serif" font-weight="500">
        ${descriptionText}
      </text>

      <text x="96" y="605" fill="#71717a" font-size="20" font-family="Arial, sans-serif">@EXOCORPSE</text>
    </svg>
  `;
}

export async function GET(request: NextRequest) {
  const title = trimCopy(
    request.nextUrl.searchParams.get("title"),
    "EXOCORPSE",
    140,
  );
  const description = trimCopy(
    request.nextUrl.searchParams.get("description"),
    "Explore the archive entry on EXOCORPSE.",
    150,
  );
  const coverUrl = request.nextUrl.searchParams.get("cover");

  try {
    const sharp = (await import("sharp")).default;

    const base = sharp({
      create: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        channels: 4,
        background: { r: 9, g: 9, b: 11, alpha: 1 },
      },
    });

    const composites: Parameters<typeof base.composite>[0] = [];

    if (coverUrl) {
      try {
        const coverResponse = await fetch(coverUrl);
        if (coverResponse.ok) {
          const coverBuffer = Buffer.from(await coverResponse.arrayBuffer());
          const coverBackdrop = await sharp(coverBuffer)
            .resize(CARD_WIDTH, CARD_HEIGHT, {
              fit: "cover",
              position: "center",
            })
            .modulate({
              brightness: 0.42,
              saturation: 0.92,
            })
            .blur(16)
            .jpeg({ quality: 40, mozjpeg: true })
            .toBuffer();
          const preparedCover = await sharp(coverBuffer)
            .resize(COVER_PANEL_WIDTH, COVER_PANEL_HEIGHT, {
              fit: "cover",
              position: "center",
            })
            .modulate({
              brightness: 0.96,
              saturation: 1.06,
            })
            .sharpen({
              sigma: 1.1,
              m1: 1.2,
              m2: 2,
            })
            .flatten({ background: "#05070d" })
            .jpeg({ quality: 56, mozjpeg: true })
            .toBuffer();

          const backdropShade = await sharp({
            create: {
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              channels: 4,
              background: { r: 3, g: 5, b: 10, alpha: 0.12 },
            },
          })
            .png()
            .toBuffer();
          const coverShade = await sharp({
            create: {
              width: COVER_PANEL_WIDTH,
              height: COVER_PANEL_HEIGHT,
              channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: 0.08 },
            },
          })
            .png()
            .toBuffer();

          composites.push({
            input: coverBackdrop,
            top: 0,
            left: 0,
          });
          composites.push({
            input: backdropShade,
            top: 0,
            left: 0,
          });
          composites.push({
            input: preparedCover,
            top: COVER_PANEL_TOP,
            left: COVER_PANEL_LEFT,
          });
          composites.push({
            input: coverShade,
            top: COVER_PANEL_TOP,
            left: COVER_PANEL_LEFT,
          });
        }
      } catch (error) {
        console.error("Failed to fetch cover for og image:", error);
      }
    }

    const accentGlow = await sharp({
      create: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: Buffer.from(
            `<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(180 140) rotate(25) scale(560 360)">
                  <stop offset="0%" stop-color="rgba(239,68,68,0.26)" />
                  <stop offset="100%" stop-color="rgba(239,68,68,0)" />
                </radialGradient>
              </defs>
              <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#glow)" />
            </svg>`,
          ),
        },
      ])
      .png()
      .toBuffer();

    const textOverlay = Buffer.from(
      createTextSvg({
        title,
        description,
      }),
    );

    composites.push({ input: accentGlow, top: 0, left: 0 });
    composites.push({ input: textOverlay, top: 0, left: 0 });

    const output = await base
      .composite(composites)
      .jpeg({
        quality: 54,
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
