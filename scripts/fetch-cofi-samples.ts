import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type ApiSample = {
  id: string;
  originalImageUrl: string;
  thumbnailUrl: string;
  artistName: string;
  boothType: string;
  boothLocation: string;
  joiningDate: string;
};

type ApiResponse = {
  success: boolean;
  message: string | null;
  data: {
    content: ApiSample[];
    metadata: {
      page: number;
      size: number;
      totalElements: number;
      totalPages: number;
      first: boolean;
      last: boolean;
    };
  };
};

type DownloadedImage = {
  remoteUrl: string;
  localPath: string;
  filename: string;
  extension: string;
  contentType: string | null;
  bytes: number;
};

type DatasetSample = ApiSample & {
  index: number;
  artistSlug: string;
  image: {
    original: DownloadedImage;
    thumbnail: DownloadedImage;
  };
};

type Dataset = {
  fetchedAt: string;
  source: {
    endpoint: string;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
  stats: {
    totalSamples: number;
    uniqueSampleIds: number;
    uniqueArtists: number;
    uniqueBooths: number;
    boothTypeCounts: Record<string, number>;
    joiningDateCounts: Record<string, number>;
    artistsWithMultipleSamples: number;
    duplicateRecords: number;
    totalStoredAssets: number;
    uniqueOriginalImages: number;
    uniqueThumbnailImages: number;
  };
  samples: DatasetSample[];
};

const API_ENDPOINT =
  "https://portal.colorfiesta.vn/api/temporary-samples?page=%PAGE%&size=%SIZE%";
const PAGE_SIZE = 24;
const ROOT = process.cwd();
const THUMBNAIL_DIR = path.join(ROOT, "public/cofi/samples/thumbnails");
const ORIGINAL_DIR = path.join(ROOT, "public/cofi/samples/originals");
const PUBLIC_JSON_PATH = path.join(ROOT, "public/cofi/samples/samples.json");
const SOURCE_JSON_PATH = path.join(ROOT, "src/data/cofi/samples.json");

function getRequestHeaders() {
  const bearerToken = process.env.COFI_BEARER_TOKEN;

  if (!bearerToken) {
    throw new Error(
      "Missing COFI_BEARER_TOKEN. Export the bearer token before running this script.",
    );
  }

  const headers = new Headers({
    Accept: "application/json, text/plain, */*",
    Authorization: `Bearer ${bearerToken}`,
    Referer: "https://portal.colorfiesta.vn/samples",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
  });

  if (process.env.COFI_COOKIE) {
    headers.set("Cookie", process.env.COFI_COOKIE);
  }

  return headers;
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

function getFileExtension(url: string, contentType: string | null) {
  const pathname = new URL(url).pathname;
  const fromPath = path.extname(pathname).toLowerCase();

  if (fromPath) {
    return fromPath;
  }

  if (contentType?.includes("png")) {
    return ".png";
  }

  if (contentType?.includes("webp")) {
    return ".webp";
  }

  return ".jpg";
}

async function fetchPage(page: number, headers: Headers) {
  const url = API_ENDPOINT.replace("%PAGE%", String(page)).replace(
    "%SIZE%",
    String(PAGE_SIZE),
  );
  const response = await fetch(url, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Request failed for page ${page}: ${response.status}`);
  }

  return (await response.json()) as ApiResponse;
}

async function downloadImage(
  url: string,
  destinationDir: string,
  sampleId: string,
  variant: "original" | "thumbnail",
) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download ${variant} for ${sampleId}`);
  }

  const contentType = response.headers.get("content-type");
  const extension = getFileExtension(url, contentType);
  const filename = `${sampleId}-${variant}${extension}`;
  const buffer = Buffer.from(await response.arrayBuffer());
  const outputPath = path.join(destinationDir, filename);

  await writeFile(outputPath, buffer);

  return {
    remoteUrl: url,
    localPath: path.posix.join(
      "/cofi/samples",
      path.basename(destinationDir),
      filename,
    ),
    filename,
    extension,
    contentType,
    bytes: buffer.byteLength,
  } satisfies DownloadedImage;
}

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function consume() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () =>
      consume(),
    ),
  );

  return results;
}

async function main() {
  await mkdir(THUMBNAIL_DIR, { recursive: true });
  await mkdir(ORIGINAL_DIR, { recursive: true });

  const headers = getRequestHeaders();
  const firstPage = await fetchPage(0, headers);
  const allSamples = [...firstPage.data.content];

  for (let page = 1; page < firstPage.data.metadata.totalPages; page += 1) {
    const response = await fetchPage(page, headers);
    allSamples.push(...response.data.content);
  }

  const downloadedSamples = await runWithConcurrency(
    allSamples,
    10,
    async (sample, index) => {
      const original = await downloadImage(
        sample.originalImageUrl,
        ORIGINAL_DIR,
        sample.id,
        "original",
      );
      const thumbnail = await downloadImage(
        sample.thumbnailUrl,
        THUMBNAIL_DIR,
        sample.id,
        "thumbnail",
      );

      return {
        ...sample,
        index,
        artistSlug: slugify(sample.artistName),
        image: {
          original,
          thumbnail,
        },
      } satisfies DatasetSample;
    },
  );

  const artistCounts = new Map<string, number>();
  const sampleIds = new Set<string>();
  const boothLocations = new Set<string>();
  const uniqueOriginalImages = new Set<string>();
  const uniqueThumbnailImages = new Set<string>();
  const boothTypeCounts: Record<string, number> = {};
  const joiningDateCounts: Record<string, number> = {};

  for (const sample of downloadedSamples) {
    artistCounts.set(
      sample.artistName,
      (artistCounts.get(sample.artistName) ?? 0) + 1,
    );
    sampleIds.add(sample.id);
    boothLocations.add(sample.boothLocation);
    uniqueOriginalImages.add(sample.image.original.localPath);
    uniqueThumbnailImages.add(sample.image.thumbnail.localPath);
    boothTypeCounts[sample.boothType] =
      (boothTypeCounts[sample.boothType] ?? 0) + 1;
    joiningDateCounts[sample.joiningDate] =
      (joiningDateCounts[sample.joiningDate] ?? 0) + 1;
  }

  const totalStoredAssets =
    uniqueOriginalImages.size + uniqueThumbnailImages.size;

  const dataset: Dataset = {
    fetchedAt: new Date().toISOString(),
    source: {
      endpoint: API_ENDPOINT.replace("%PAGE%", "0").replace(
        "%SIZE%",
        String(PAGE_SIZE),
      ),
      pageSize: PAGE_SIZE,
      totalPages: firstPage.data.metadata.totalPages,
      totalElements: firstPage.data.metadata.totalElements,
    },
    stats: {
      totalSamples: downloadedSamples.length,
      uniqueSampleIds: sampleIds.size,
      uniqueArtists: artistCounts.size,
      uniqueBooths: boothLocations.size,
      boothTypeCounts,
      joiningDateCounts,
      artistsWithMultipleSamples: [...artistCounts.values()].filter(
        (count) => count > 1,
      ).length,
      duplicateRecords: downloadedSamples.length - sampleIds.size,
      totalStoredAssets,
      uniqueOriginalImages: uniqueOriginalImages.size,
      uniqueThumbnailImages: uniqueThumbnailImages.size,
    },
    samples: downloadedSamples,
  };

  const payload = `${JSON.stringify(dataset, null, 2)}\n`;
  await writeFile(PUBLIC_JSON_PATH, payload, "utf8");
  await writeFile(SOURCE_JSON_PATH, payload, "utf8");

  console.log(
    `Saved ${downloadedSamples.length} samples and ${totalStoredAssets} unique local image files.`,
  );
  console.log(`JSON: ${SOURCE_JSON_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
