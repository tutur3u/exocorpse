import type { CofiSample } from "@/data/cofi/types";
import type { Tables } from "../../supabase/types";

export const COFI_EMBEDDING_MODEL = "gemini-embedding-2-preview";
export const COFI_EMBEDDING_DIMENSIONS = 1536;
export const COFI_DOCUMENT_TASK_TYPE = "RETRIEVAL_DOCUMENT";
export const COFI_QUERY_TASK_TYPE = "RETRIEVAL_QUERY";
export const COFI_SEMANTIC_SEARCH_MIN_QUERY_LENGTH = 2;

export function getCofiSampleRecordId(
  sample: Pick<CofiSample, "id" | "index">,
) {
  return `${sample.id}:${sample.index}`;
}

export function formatCofiBoothType(value: string) {
  return value === "PREMIUM" ? "Premium booth" : "Standard booth";
}

export function formatCofiJoiningDate(value: string) {
  if (value === "BOTH_DAYS") {
    return "Both days";
  }

  if (value === "DAY_1") {
    return "Day 1";
  }

  if (value === "DAY_2") {
    return "Day 2";
  }

  return value;
}

export function buildCofiSearchText(sample: CofiSample) {
  return [
    `Artist ${sample.artistName}`,
    `Artist slug ${sample.artistSlug}`,
    `Booth ${sample.boothLocation}`,
    `Booth type ${formatCofiBoothType(sample.boothType)}`,
    `Attendance ${formatCofiJoiningDate(sample.joiningDate)}`,
    `Search terms ${sample.boothType} ${sample.joiningDate} ${sample.boothLocation} ${sample.artistName}`,
  ].join("\n");
}

export function toPgVector(embedding: number[]) {
  return `[${embedding.join(",")}]`;
}

export function mapCofiRowToSample(row: Tables<"cofi_samples">): CofiSample {
  return {
    id: row.source_sample_id,
    index: row.snapshot_index,
    artistName: row.artist_name,
    artistSlug: row.artist_slug,
    boothType: row.booth_type,
    boothLocation: row.booth_location,
    joiningDate: row.joining_date,
    originalImageUrl: row.original_image_url,
    thumbnailUrl: row.thumbnail_url,
    image: {
      original: {
        remoteUrl: row.original_image_url,
        localPath: row.original_local_path,
        filename: row.original_filename,
        extension: row.original_extension,
        contentType: row.original_content_type,
        bytes: row.original_bytes,
      },
      thumbnail: {
        remoteUrl: row.thumbnail_url,
        localPath: row.thumbnail_local_path,
        filename: row.thumbnail_filename,
        extension: row.thumbnail_extension,
        contentType: row.thumbnail_content_type,
        bytes: row.thumbnail_bytes,
      },
    },
  };
}
