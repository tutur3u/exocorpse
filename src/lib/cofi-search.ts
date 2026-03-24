import "server-only";

import { google, type GoogleEmbeddingModelOptions } from "@ai-sdk/google";
import { embed } from "ai";
import {
  COFI_EMBEDDING_DIMENSIONS,
  COFI_EMBEDDING_MODEL,
  COFI_QUERY_TASK_TYPE,
  mapCofiRowToSample,
  toPgVector,
} from "@/lib/cofi";
import { getSupabaseAdminServer } from "@/lib/supabase/server";
import type { Tables } from "../../supabase/types";

type SearchArgs = {
  query: string;
  limit?: number;
  boothType?: string | null;
  joiningDate?: string | null;
};

type SearchRow = {
  id: string;
  source_sample_id: string;
  snapshot_index: number;
  artist_name: string;
  artist_slug: string;
  booth_type: string;
  booth_location: string;
  joining_date: string;
  original_image_url: string;
  thumbnail_url: string;
  original_local_path: string;
  thumbnail_local_path: string;
  original_filename: string;
  thumbnail_filename: string;
  original_extension: string;
  thumbnail_extension: string;
  original_content_type: string | null;
  thumbnail_content_type: string | null;
  original_bytes: number;
  thumbnail_bytes: number;
  combined_score: number;
  lexical_score: number;
  semantic_score: number;
};

type SearchTableRow = Tables<"cofi_samples">;

function rankFallbackRow(row: SearchTableRow, normalizedQuery: string) {
  const query = normalizedQuery.toLowerCase();
  let score = 0;

  if (row.artist_name.toLowerCase().includes(query)) {
    score += row.artist_name.toLowerCase().startsWith(query) ? 120 : 80;
  }

  if (row.artist_slug.toLowerCase().includes(query)) {
    score += row.artist_slug.toLowerCase().startsWith(query) ? 60 : 40;
  }

  if (row.booth_location.toLowerCase().includes(query)) {
    score += row.booth_location.toLowerCase().startsWith(query) ? 70 : 45;
  }

  if (row.booth_type.toLowerCase().includes(query)) {
    score += 20;
  }

  if (row.joining_date.toLowerCase().includes(query)) {
    score += 20;
  }

  return score;
}

async function searchCofiSamplesFallback({
  query,
  limit,
  boothType,
  joiningDate,
}: Required<SearchArgs>) {
  const supabase = await getSupabaseAdminServer();
  const normalizedQuery = query.trim().toLowerCase();

  const { data, error } = await supabase
    .from("cofi_samples")
    .select("*")
    .order("snapshot_index", { ascending: true })
    .limit(Math.max(limit, 600));

  if (error) {
    throw error;
  }

  const rows = ((data ?? []) as SearchTableRow[])
    .filter((row) => {
      if (boothType && row.booth_type !== boothType) {
        return false;
      }

      if (joiningDate && row.joining_date !== joiningDate) {
        return false;
      }

      const haystack = [
        row.artist_name,
        row.artist_slug,
        row.booth_location,
        row.booth_type,
        row.joining_date,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    })
    .map((row) => ({
      row,
      score: rankFallbackRow(row, normalizedQuery),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.row.snapshot_index - right.row.snapshot_index;
    })
    .slice(0, limit)
    .map((entry) => entry.row);

  return {
    mode: "fallback" as const,
    samples: rows.map((row) => mapCofiRowToSample(row as never)),
  };
}

async function createQueryEmbeddingText(query: string) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return null;
  }

  const model = google.embedding(COFI_EMBEDDING_MODEL);
  const { embedding } = await embed({
    model,
    value: query,
    providerOptions: {
      google: {
        taskType: COFI_QUERY_TASK_TYPE,
        outputDimensionality: COFI_EMBEDDING_DIMENSIONS,
      } satisfies GoogleEmbeddingModelOptions,
    },
  });

  return toPgVector(embedding);
}

export async function searchCofiSamplesHybrid({
  query,
  limit = 120,
  boothType,
  joiningDate,
}: SearchArgs) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return {
      mode: "none" as const,
      samples: [],
    };
  }

  const supabase = await getSupabaseAdminServer();

  try {
    const queryEmbeddingText = await createQueryEmbeddingText(normalizedQuery);

    const { data, error } = await supabase.rpc("search_cofi_samples_hybrid", {
      p_query: normalizedQuery,
      p_query_embedding_text: queryEmbeddingText,
      p_match_count: limit,
      p_booth_type: boothType ?? null,
      p_joining_date: joiningDate ?? null,
    });

    if (error) {
      throw error;
    }

    const samples = ((data ?? []) as SearchRow[]).map((row) =>
      mapCofiRowToSample(row as never),
    );

    if (samples.length > 0) {
      return {
        mode: queryEmbeddingText ? ("hybrid" as const) : ("fts" as const),
        samples,
      };
    }
  } catch (error) {
    console.error("COFI hybrid search failed, using fallback search.", error);
  }

  return searchCofiSamplesFallback({
    query: normalizedQuery,
    limit,
    boothType: boothType ?? null,
    joiningDate: joiningDate ?? null,
  });
}
