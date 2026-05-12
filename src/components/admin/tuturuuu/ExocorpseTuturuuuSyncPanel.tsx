"use client";

import {
  AlertTriangle,
  DatabaseZap,
  ExternalLink,
  GitCompareArrows,
  LoaderCircle,
  LogIn,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type AdminLink = {
  actionLabel: string;
  cmsHref: string;
  description: string;
  key: string;
  label: string;
};

type SyncDiffResponse = {
  hasDestructiveOperations?: boolean;
  operations?: unknown[];
  summary?: {
    archive?: number;
    create?: number;
    delete?: number;
    noop?: number;
    update?: number;
  };
};

async function readAdminError(response: Response) {
  const data = (await response.json().catch(() => null)) as {
    error?: unknown;
  } | null;
  return typeof data?.error === "string" && data.error.trim()
    ? data.error
    : `Request failed with status ${response.status}`;
}

async function postAdminJson<T>(url: string, body?: unknown) {
  const response = await fetch(url, {
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await readAdminError(response));
  }

  return (await response.json()) as T;
}

export function ExocorpseTuturuuuSyncPanel({
  adminLinks,
  configError,
  connectedEmail,
  connectHref,
}: {
  adminLinks: AdminLink[];
  configError?: string | null;
  connectedEmail?: string | null;
  connectHref: string;
}) {
  const [diff, setDiff] = useState<SyncDiffResponse | null>(null);
  const [error, setError] = useState<string | null>(configError ?? null);
  const [pendingAction, setPendingAction] = useState<"apply" | "diff" | null>(
    null,
  );
  const [publicAssetSync, setPublicAssetSync] = useState<{
    skipped?: unknown[];
    uploaded?: unknown[];
  } | null>(null);
  const summary = diff?.summary;
  const totalOperations =
    (summary?.archive ?? 0) +
    (summary?.create ?? 0) +
    (summary?.delete ?? 0) +
    (summary?.update ?? 0);
  const isConnected = Boolean(connectedEmail);

  const runDiff = async () => {
    setPendingAction("diff");
    setError(null);
    setPublicAssetSync(null);
    try {
      setDiff(
        await postAdminJson<SyncDiffResponse>("/api/admin/tuturuuu/sync/diff"),
      );
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Sync request failed.",
      );
    } finally {
      setPendingAction(null);
    }
  };

  const runApply = async (force: boolean) => {
    setPendingAction("apply");
    setError(null);
    try {
      const result = await postAdminJson<{
        diff?: SyncDiffResponse;
        publicAssetSync?: {
          skipped?: unknown[];
          uploaded?: unknown[];
        };
      }>("/api/admin/tuturuuu/sync/apply", { force });
      setPublicAssetSync(result.publicAssetSync ?? null);
      setDiff(
        result.diff ??
          (await postAdminJson<SyncDiffResponse>(
            "/api/admin/tuturuuu/sync/diff",
          )),
      );
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Sync request failed.",
      );
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <DatabaseZap className="h-5 w-5 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tuturuuu CMS migration
            </h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-400">
            Push Exocorpse&apos;s current Supabase tables into Tuturuuu
            external-project content so the centralized platform can become the
            canonical database and content management surface.
          </p>
          <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-500">
            {isConnected
              ? `Connected as ${connectedEmail}`
              : "Connect a Tuturuuu platform admin before diffing or applying the migration."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-gray-800 dark:text-gray-200 dark:hover:border-blue-700"
            href={connectHref}
          >
            <LogIn className="h-4 w-4" />
            {isConnected ? "Switch account" : "Connect Tuturuuu"}
          </Link>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:text-gray-200 dark:hover:border-blue-700"
            disabled={
              pendingAction !== null || !isConnected || Boolean(configError)
            }
            onClick={runDiff}
            type="button"
          >
            {pendingAction === "diff" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <GitCompareArrows className="h-4 w-4" />
            )}
            Check sync
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              pendingAction !== null || !isConnected || Boolean(configError)
            }
            onClick={() => void runApply(false)}
            type="button"
          >
            {pendingAction === "apply" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            Push migration
          </button>
        </div>
      </div>

      {adminLinks.length > 0 ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {adminLinks.map((link) => (
            <a
              className="group rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-blue-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
              href={link.cmsHref}
              key={link.key}
              rel="noreferrer"
              target="_blank"
            >
              <span className="flex items-center justify-between gap-3 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                {link.label}
                <ExternalLink className="h-3.5 w-3.5 opacity-60 transition group-hover:opacity-100" />
              </span>
              <strong className="mt-2 block text-sm text-gray-900 dark:text-white">
                {link.actionLabel}
              </strong>
              <span className="mt-1 block text-xs leading-5 text-gray-600 dark:text-gray-400">
                {link.description}
              </span>
            </a>
          ))}
        </div>
      ) : null}

      {diff ? (
        <div className="mt-5 grid gap-2 text-sm sm:grid-cols-4">
          {[
            ["Create", summary?.create ?? 0],
            ["Update", summary?.update ?? 0],
            ["Archive", summary?.archive ?? 0],
            ["Delete", summary?.delete ?? 0],
          ].map(([label, value]) => (
            <div
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900"
              key={label}
            >
              <span className="text-gray-500 dark:text-gray-400">{label}</span>
              <span className="float-right font-bold text-gray-900 dark:text-white">
                {value}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {diff?.hasDestructiveOperations ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200">
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Destructive operations require explicit force.
          </span>
          <button
            className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-700 dark:border-red-800 dark:text-red-100"
            disabled={pendingAction !== null}
            onClick={() => void runApply(true)}
            type="button"
          >
            Force apply
          </button>
        </div>
      ) : null}

      {diff && !diff.hasDestructiveOperations ? (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {totalOperations === 0
            ? "Centralized CMS is already in sync."
            : `${totalOperations} content changes ready.`}
        </p>
      ) : null}

      {publicAssetSync ? (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Uploaded {publicAssetSync.uploaded?.length ?? 0} public assets
          {publicAssetSync.skipped?.length
            ? `, skipped ${publicAssetSync.skipped.length}`
            : ""}
          .
        </p>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </div>
      ) : null}
    </section>
  );
}
