import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { CofiDataset } from "../src/data/cofi/types";
import { syncCofiSamplesAndEmbeddings } from "../src/lib/cofi-sync";
import type { Database } from "../supabase/types";

const ROOT = process.cwd();
const DATASET_PATH = path.join(ROOT, "src/data/cofi/samples.json");

function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in environment.",
    );
  }

  return createClient<Database>(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function loadDataset() {
  const raw = await readFile(DATASET_PATH, "utf8");
  return JSON.parse(raw) as CofiDataset;
}

async function main() {
  const dataset = await loadDataset();
  const result = await syncCofiSamplesAndEmbeddings(
    getSupabaseAdminClient(),
    dataset.samples,
  );

  console.log(`Synced ${result.syncedSamples} COFI samples to Supabase.`);
  if (result.skippedEmbeddings) {
    console.log(
      "Embeddings were skipped because GOOGLE_GENERATIVE_AI_API_KEY is not set.",
    );
  } else {
    console.log(`Updated ${result.embeddedSamples} embeddings.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
