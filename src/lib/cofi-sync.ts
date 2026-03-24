import { createHash } from "node:crypto";
import { google, type GoogleEmbeddingModelOptions } from "@ai-sdk/google";
import { embedMany } from "ai";
import type { CofiSample } from "@/data/cofi/types";
import {
  buildCofiSearchText,
  COFI_DOCUMENT_TASK_TYPE,
  COFI_EMBEDDING_DIMENSIONS,
  COFI_EMBEDDING_MODEL,
  getCofiSampleRecordId,
  toPgVector,
} from "@/lib/cofi";

const UPSERT_BATCH_SIZE = 100;
const EMBEDDING_BATCH_SIZE = 24;

type CofiSupabaseClient = {
  from: (...args: any[]) => any;
};

type SyncProgress = {
  syncedSamples: number;
  embeddedSamples: number;
  skippedEmbeddings: boolean;
};

function buildContentHash(sample: CofiSample) {
  return createHash("sha256").update(buildCofiSearchText(sample)).digest("hex");
}

async function upsertSamples(
  supabase: CofiSupabaseClient,
  samples: CofiSample[],
) {
  for (let index = 0; index < samples.length; index += UPSERT_BATCH_SIZE) {
    const chunk = samples.slice(index, index + UPSERT_BATCH_SIZE);
    const payload = chunk.map((sample) => ({
      id: getCofiSampleRecordId(sample),
      source_sample_id: sample.id,
      snapshot_index: sample.index,
      artist_name: sample.artistName,
      artist_slug: sample.artistSlug,
      booth_type: sample.boothType,
      booth_location: sample.boothLocation,
      joining_date: sample.joiningDate,
      original_image_url: sample.originalImageUrl,
      thumbnail_url: sample.thumbnailUrl,
      original_local_path: sample.image.original.localPath,
      thumbnail_local_path: sample.image.thumbnail.localPath,
      original_filename: sample.image.original.filename,
      thumbnail_filename: sample.image.thumbnail.filename,
      original_extension: sample.image.original.extension,
      thumbnail_extension: sample.image.thumbnail.extension,
      original_content_type: sample.image.original.contentType,
      thumbnail_content_type: sample.image.thumbnail.contentType,
      original_bytes: sample.image.original.bytes,
      thumbnail_bytes: sample.image.thumbnail.bytes,
      search_text: buildCofiSearchText(sample),
    }));

    const { error } = await supabase.from("cofi_samples").upsert(payload, {
      onConflict: "id",
    });

    if (error) {
      throw error;
    }
  }
}

async function syncEmbeddings(
  supabase: CofiSupabaseClient,
  samples: CofiSample[],
) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return {
      embeddedSamples: 0,
      skippedEmbeddings: true,
    };
  }

  const sampleIds = samples.map((sample) => getCofiSampleRecordId(sample));
  const { data: existingRows, error: existingError } = await supabase
    .from("cofi_sample_embeddings")
    .select("sample_id, content_hash")
    .in("sample_id", sampleIds);

  if (existingError) {
    throw existingError;
  }

  const existingHashes = new Map(
    (existingRows ?? []).map(
      (row: { sample_id: string; content_hash: string }) => [
        row.sample_id,
        row.content_hash,
      ],
    ),
  );

  const pending: Array<{
    sample: CofiSample;
    searchText: string;
    contentHash: string;
  }> = [];

  for (const sample of samples) {
    const contentHash = buildContentHash(sample);
    const sampleId = getCofiSampleRecordId(sample);

    if (existingHashes.get(sampleId) === contentHash) {
      continue;
    }

    pending.push({
      sample,
      searchText: buildCofiSearchText(sample),
      contentHash,
    });
  }

  if (pending.length === 0) {
    return {
      embeddedSamples: 0,
      skippedEmbeddings: false,
    };
  }

  const model = google.embedding(COFI_EMBEDDING_MODEL);
  let embeddedSamples = 0;

  for (let index = 0; index < pending.length; index += EMBEDDING_BATCH_SIZE) {
    const chunk = pending.slice(index, index + EMBEDDING_BATCH_SIZE);
    const { embeddings } = await embedMany({
      model,
      values: chunk.map((entry) => entry.searchText),
      providerOptions: {
        google: {
          taskType: COFI_DOCUMENT_TASK_TYPE,
          outputDimensionality: COFI_EMBEDDING_DIMENSIONS,
        } satisfies GoogleEmbeddingModelOptions,
      },
    });

    const payload = embeddings.map((embedding, embeddingIndex) => ({
      sample_id: getCofiSampleRecordId(chunk[embeddingIndex].sample),
      model: COFI_EMBEDDING_MODEL,
      task_type: COFI_DOCUMENT_TASK_TYPE,
      dimensions: embedding.length,
      content_hash: chunk[embeddingIndex].contentHash,
      embedding: toPgVector(embedding),
    }));

    const { error } = await supabase
      .from("cofi_sample_embeddings")
      .upsert(payload, {
        onConflict: "sample_id",
      });

    if (error) {
      throw error;
    }

    embeddedSamples += chunk.length;
  }

  return {
    embeddedSamples,
    skippedEmbeddings: false,
  };
}

export async function syncCofiSamplesAndEmbeddings(
  supabase: CofiSupabaseClient,
  samples: CofiSample[],
): Promise<SyncProgress> {
  await upsertSamples(supabase, samples);
  const embeddingResult = await syncEmbeddings(supabase, samples);

  return {
    syncedSamples: samples.length,
    ...embeddingResult,
  };
}

export async function refreshCofiEmbeddings(
  supabase: CofiSupabaseClient,
  samples: CofiSample[],
): Promise<SyncProgress> {
  const embeddingResult = await syncEmbeddings(supabase, samples);

  return {
    syncedSamples: samples.length,
    ...embeddingResult,
  };
}
