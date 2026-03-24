"use client";

import type { CofiDataset } from "@/data/cofi/types";
import toastWithSound from "@/lib/toast";
import { useState } from "react";

type Props = {
  dataset: CofiDataset;
};

export default function CofiAdminClient({ dataset }: Props) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<{
    syncedSamples: number;
    embeddedSamples: number;
    skippedEmbeddings: boolean;
  } | null>(null);

  const runSync = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/cofi/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        error?: string;
        syncedSamples?: number;
        embeddedSamples?: number;
        skippedEmbeddings?: boolean;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to sync COFI data");
      }

      const result = {
        syncedSamples: payload.syncedSamples ?? 0,
        embeddedSamples: payload.embeddedSamples ?? 0,
        skippedEmbeddings: payload.skippedEmbeddings ?? false,
      };

      setLastResult(result);

      if (result.skippedEmbeddings) {
        toastWithSound.success(
          `Synced ${result.syncedSamples} samples. Embeddings were skipped because GOOGLE_GENERATIVE_AI_API_KEY is missing.`,
        );
      } else {
        toastWithSound.success(
          `Synced ${result.syncedSamples} samples and updated ${result.embeddedSamples} embeddings.`,
        );
      }
    } catch (error) {
      toastWithSound.error(
        error instanceof Error ? error.message : "Failed to sync COFI data",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600 dark:text-amber-400">
          COFI Search
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
          Gemini Embedding Sync
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-400">
          Refresh the COFI April 2026 records already stored in Supabase and
          regenerate the semantic search embeddings used by the public browser.
          This action is protected by both admin authentication and a dedicated
          sync password.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm text-gray-500 dark:text-gray-400">Archive samples</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {dataset.stats.totalSamples}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm text-gray-500 dark:text-gray-400">What this does</p>
          <p className="mt-2 text-sm leading-7 text-gray-900 dark:text-white">
            Regenerates Gemini embeddings for the COFI records already stored in
            the database.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Run COFI sample sync
            </h2>
            <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-400">
              This will read the current COFI sample archive from the database and,
              when the Google key is configured, generate or refresh document
              embeddings for those records using
              `gemini-embedding-2-preview`.
            </p>

            <label className="mt-6 grid gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Sync password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter COFI sync password"
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </label>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={runSync}
                disabled={
                  isSubmitting ||
                  !password.trim()
                }
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300 dark:disabled:bg-blue-900"
              >
                {isSubmitting ? "Syncing..." : "Sync Samples and Embeddings"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
              Latest Run
            </h3>
            {lastResult ? (
              <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>Synced samples: {lastResult.syncedSamples}</p>
                <p>Updated embeddings: {lastResult.embeddedSamples}</p>
                <p>
                  Embeddings skipped: {lastResult.skippedEmbeddings ? "yes" : "no"}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
                No sync has been triggered in this session yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
