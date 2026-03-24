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
  const supabase = await getSupabaseAdminServer();
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return {
      mode: "none" as const,
      samples: [],
    };
  }

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

  return {
    mode: queryEmbeddingText ? ("hybrid" as const) : ("fts" as const),
    samples: ((data ?? []) as SearchRow[]).map((row) =>
      mapCofiRowToSample(row as never),
    ),
  };
}
