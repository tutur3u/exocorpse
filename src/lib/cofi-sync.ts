import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
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
import type { Database } from "../../supabase/types";

const ROOT = process.cwd();
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

async function sha256File(filePath: string) {
  const buffer = await readFile(filePath);
  return createHash("sha256").update(buffer).digest("hex");
}

function buildContentHash(sample: CofiSample, thumbnailHash: string) {
  return createHash("sha256")
    .update(buildCofiSearchText(sample))
    .update("\n")
    .update(thumbnailHash)
    .digest("hex");
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
    (existingRows ?? []).map((row: { sample_id: string; content_hash: string }) => [
      row.sample_id,
      row.content_hash,
    ]),
  );

  const pending: Array<{
    sample: CofiSample;
    searchText: string;
    contentHash: string;
    mimeType: string;
    base64Data: string;
  }> = [];

  for (const sample of samples) {
    const thumbnailAbsolutePath = path.join(
      ROOT,
      "public",
      sample.image.thumbnail.localPath.replace(/^\//, ""),
    );
    const thumbnailBuffer = await readFile(thumbnailAbsolutePath);
    const thumbnailHash = await sha256File(thumbnailAbsolutePath);
    const contentHash = buildContentHash(sample, thumbnailHash);
    const sampleId = getCofiSampleRecordId(sample);

    if (existingHashes.get(sampleId) === contentHash) {
      continue;
    }

    pending.push({
      sample,
      searchText: buildCofiSearchText(sample),
      contentHash,
      mimeType: sample.image.thumbnail.contentType ?? "image/jpeg",
      base64Data: thumbnailBuffer.toString("base64"),
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
          content: chunk.map((entry) => [
            {
              inlineData: {
                mimeType: entry.mimeType,
                data: entry.base64Data,
              },
            },
          ]),
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

    const { error } = await supabase.from("cofi_sample_embeddings").upsert(payload, {
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

export async function getCofiAdminSummary(supabase: CofiSupabaseClient) {
  const [{ count: sampleCount, error: sampleError }, { count: embeddingCount, error: embeddingError }] =
    await Promise.all([
      supabase
        .from("cofi_samples")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("cofi_sample_embeddings")
        .select("*", { count: "exact", head: true }),
    ]);

  if (sampleError && sampleError.code !== "42P01") {
    throw sampleError;
  }

  if (embeddingError && embeddingError.code !== "42P01") {
    throw embeddingError;
  }

  return {
    sampleCount: sampleCount ?? 0,
    embeddingCount: embeddingCount ?? 0,
    hasGoogleApiKey: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    hasAdminPassword: Boolean(process.env.COFI_ADMIN_SYNC_PASSWORD),
  };
}
