import "server-only";

import type { CofiDataset, CofiSample } from "@/data/cofi/types";
import { mapCofiRowToSample } from "@/lib/cofi";
import { getSupabaseAdminServer } from "@/lib/supabase/server";
import type { Tables } from "../../supabase/types";

const PAGE_SIZE = 1000;

function createEmptyDataset(): CofiDataset {
  return {
    fetchedAt: new Date(0).toISOString(),
    source: {
      endpoint: "database",
      pageSize: PAGE_SIZE,
      totalPages: 0,
      totalElements: 0,
    },
    stats: {
      totalSamples: 0,
      uniqueSampleIds: 0,
      uniqueArtists: 0,
      uniqueBooths: 0,
      boothTypeCounts: {},
      joiningDateCounts: {},
      artistsWithMultipleSamples: 0,
      duplicateRecords: 0,
      totalStoredAssets: 0,
      uniqueOriginalImages: 0,
      uniqueThumbnailImages: 0,
    },
    samples: [],
  };
}

function buildCofiDataset(rows: Tables<"cofi_samples">[]): CofiDataset {
  if (rows.length === 0) {
    return createEmptyDataset();
  }

  const samples = rows.map((row) => mapCofiRowToSample(row));
  const uniqueSampleIds = new Set(samples.map((sample) => sample.id));
  const uniqueArtists = new Set(samples.map((sample) => sample.artistName));
  const uniqueBooths = new Set(samples.map((sample) => sample.boothLocation));
  const uniqueOriginalImages = new Set(
    samples.map((sample) => sample.image.original.localPath),
  );
  const uniqueThumbnailImages = new Set(
    samples.map((sample) => sample.image.thumbnail.localPath),
  );
  const artistSampleCounts = new Map<string, number>();
  const boothTypeCounts: Record<string, number> = {};
  const joiningDateCounts: Record<string, number> = {};

  for (const sample of samples) {
    artistSampleCounts.set(
      sample.artistName,
      (artistSampleCounts.get(sample.artistName) ?? 0) + 1,
    );
    boothTypeCounts[sample.boothType] =
      (boothTypeCounts[sample.boothType] ?? 0) + 1;
    joiningDateCounts[sample.joiningDate] =
      (joiningDateCounts[sample.joiningDate] ?? 0) + 1;
  }

  const latestUpdatedAt = rows.reduce((latest, row) => {
    return row.updated_at > latest ? row.updated_at : latest;
  }, rows[0].updated_at);

  return {
    fetchedAt: latestUpdatedAt,
    source: {
      endpoint: "database",
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(samples.length / PAGE_SIZE),
      totalElements: samples.length,
    },
    stats: {
      totalSamples: samples.length,
      uniqueSampleIds: uniqueSampleIds.size,
      uniqueArtists: uniqueArtists.size,
      uniqueBooths: uniqueBooths.size,
      boothTypeCounts,
      joiningDateCounts,
      artistsWithMultipleSamples: [...artistSampleCounts.values()].filter(
        (count) => count > 1,
      ).length,
      duplicateRecords: samples.length - uniqueSampleIds.size,
      totalStoredAssets: uniqueOriginalImages.size + uniqueThumbnailImages.size,
      uniqueOriginalImages: uniqueOriginalImages.size,
      uniqueThumbnailImages: uniqueThumbnailImages.size,
    },
    samples,
  };
}

export async function getCofiSamplesFromDb(): Promise<CofiSample[]> {
  const supabase = await getSupabaseAdminServer();
  const rows: Tables<"cofi_samples">[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("cofi_samples")
      .select("*")
      .order("snapshot_index", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      if (error.code === "42P01") {
        return [];
      }

      throw error;
    }

    const chunk = (data ?? []) as Tables<"cofi_samples">[];
    rows.push(...chunk);

    if (chunk.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return rows.map((row) => mapCofiRowToSample(row));
}

export async function getCofiDatasetFromDb(): Promise<CofiDataset> {
  const supabase = await getSupabaseAdminServer();
  const rows: Tables<"cofi_samples">[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("cofi_samples")
      .select("*")
      .order("snapshot_index", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      if (error.code === "42P01") {
        return createEmptyDataset();
      }

      throw error;
    }

    const chunk = (data ?? []) as Tables<"cofi_samples">[];
    rows.push(...chunk);

    if (chunk.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return buildCofiDataset(rows);
}
