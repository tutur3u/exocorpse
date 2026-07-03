"use client";

import {
  AlertTriangle,
  CheckCircle2,
  DatabaseZap,
  Download,
  ExternalLink,
  GitCompareArrows,
  LoaderCircle,
  LogIn,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const MIGRATION_CONFIRMATION = "MIGRATE_EXOCORPSE_TO_TUTURUUU";

type AdminLink = {
  actionLabel: string;
  cmsHref: string;
  description: string;
  key: string;
  label: string;
};

type MigrationIssue = {
  code: string;
  detail?: string;
  message: string;
  severity: "error" | "warning";
};

type PublicAssetFile = {
  assetType: string | null;
  collectionSlug: string;
  entrySlug: string;
  entryStableSourceId: string | null;
  entryTitle: string | null;
  expectedFilePath: string;
  filename: string;
  mtimeMs?: number;
  publicPath: string;
  size?: number;
  sourceMetadata: {
    asset: Record<string, unknown>;
    entry: Record<string, unknown>;
    sourceId: string | number | null;
    sourceTable: string | null;
  };
  stableSourceId: string | null;
  storagePath: string | null;
};

type MigrationPreflight = {
  collectionCounts: Record<string, number>;
  issueCounts: {
    errors: number;
    total: number;
    warnings: number;
  };
  issues: MigrationIssue[];
  manifestDigest: string;
  publicAssets: {
    missing: PublicAssetFile[];
    present: PublicAssetFile[];
    totalBytes: number;
  };
  readyToApply: boolean;
  sourceCounts: Record<string, number>;
  totals: {
    assets: number;
    blocks: number;
    entries: number;
    publicAssets: number;
    schemaCollections: number;
  };
};

type SyncDiffResponse = {
  hasDestructiveOperations?: boolean;
  operations?: unknown[];
  preflight?: MigrationPreflight;
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
    preflight?: MigrationPreflight;
  } | null;
  return {
    message:
      typeof data?.error === "string" && data.error.trim()
        ? data.error
        : `Request failed with status ${response.status}`,
    preflight: data?.preflight,
  };
}

async function getAdminJson<T>(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
    method: "GET",
  });

  if (!response.ok) {
    const error = await readAdminError(response);
    throw Object.assign(new Error(error.message), {
      preflight: error.preflight,
    });
  }

  return (await response.json()) as T;
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
    const error = await readAdminError(response);
    throw Object.assign(new Error(error.message), {
      preflight: error.preflight,
    });
  }

  return (await response.json()) as T;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getErrorPreflight(error: unknown) {
  return error instanceof Error &&
    "preflight" in error &&
    typeof error.preflight === "object"
    ? (error.preflight as MigrationPreflight | undefined)
    : undefined;
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
  const [confirmation, setConfirmation] = useState("");
  const [diff, setDiff] = useState<SyncDiffResponse | null>(null);
  const [error, setError] = useState<string | null>(configError ?? null);
  const [pendingAction, setPendingAction] = useState<
    "apply" | "diff" | "preflight" | null
  >(null);
  const [preflight, setPreflight] = useState<MigrationPreflight | null>(null);
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
  const canRunPreflight = pendingAction === null && !configError;
  const missingPublicAssets = preflight?.publicAssets.missing.length ?? 0;
  const canRunDiff =
    pendingAction === null &&
    isConnected &&
    Boolean(preflight?.readyToApply) &&
    !configError;
  const canApply =
    canRunDiff &&
    Boolean(diff) &&
    confirmation.trim() === MIGRATION_CONFIRMATION &&
    preflight?.manifestDigest === diff?.preflight?.manifestDigest;

  const capturePreflightFromError = (nextError: unknown) => {
    const failedPreflight = getErrorPreflight(nextError);
    if (failedPreflight) {
      setPreflight(failedPreflight);
    }
    setError(
      nextError instanceof Error ? nextError.message : "Sync request failed.",
    );
  };

  const runPreflight = async () => {
    setPendingAction("preflight");
    setDiff(null);
    setError(null);
    setPublicAssetSync(null);
    try {
      const result = await getAdminJson<{ preflight: MigrationPreflight }>(
        "/api/admin/tuturuuu/migration/preflight",
      );
      setPreflight(result.preflight);
    } catch (nextError) {
      capturePreflightFromError(nextError);
    } finally {
      setPendingAction(null);
    }
  };

  const runDiff = async () => {
    setPendingAction("diff");
    setDiff(null);
    setError(null);
    setPublicAssetSync(null);
    try {
      const result = await postAdminJson<SyncDiffResponse>(
        "/api/admin/tuturuuu/sync/diff",
      );
      setPreflight(result.preflight ?? preflight);
      setDiff(result);
    } catch (nextError) {
      capturePreflightFromError(nextError);
    } finally {
      setPendingAction(null);
    }
  };

  const runApply = async (force: boolean) => {
    if (!preflight) {
      setError("Run preflight before applying the migration.");
      return;
    }

    setPendingAction("apply");
    setError(null);
    try {
      const result = await postAdminJson<
        SyncDiffResponse & {
          diff?: SyncDiffResponse;
          publicAssetSync?: {
            skipped?: unknown[];
            uploaded?: unknown[];
          };
        }
      >("/api/admin/tuturuuu/sync/apply", {
        confirmation: confirmation.trim(),
        force,
        manifestDigest: preflight.manifestDigest,
      });
      setPublicAssetSync(result.publicAssetSync ?? null);
      setPreflight(result.preflight ?? preflight);
      setDiff(
        result.diff
          ? {
              ...result.diff,
              preflight: result.preflight ?? preflight,
            }
          : result,
      );
    } catch (nextError) {
      capturePreflightFromError(nextError);
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
            Stage Exocorpse&apos;s Supabase content into a validated Tuturuuu
            manifest, export the exact snapshot for review, then apply only when
            the reviewed digest still matches.
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
            disabled={!canRunPreflight}
            onClick={runPreflight}
            type="button"
          >
            {pendingAction === "preflight" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            Run preflight
          </button>
          <a
            className={`inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold transition-colors dark:border-gray-800 ${
              preflight
                ? "text-gray-700 hover:border-blue-300 hover:text-blue-700 dark:text-gray-200 dark:hover:border-blue-700"
                : "pointer-events-none text-gray-400 opacity-50 dark:text-gray-600"
            }`}
            download
            href="/api/admin/tuturuuu/migration/export"
          >
            <Download className="h-4 w-4" />
            Export snapshot
          </a>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:text-gray-200 dark:hover:border-blue-700"
            disabled={!canRunDiff}
            onClick={runDiff}
            type="button"
          >
            {pendingAction === "diff" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <GitCompareArrows className="h-4 w-4" />
            )}
            Check diff
          </button>
        </div>
      </div>

      {preflight ? (
        <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              {preflight.readyToApply ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {preflight.readyToApply
                  ? "Preflight passed"
                  : "Preflight blocked apply"}
              </h3>
            </div>
            <code className="max-w-full overflow-hidden rounded bg-white px-2 py-1 text-xs text-ellipsis text-gray-600 dark:bg-gray-950 dark:text-gray-300">
              {preflight.manifestDigest}
            </code>
          </div>

          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-6">
            {[
              ["Entries", preflight.totals.entries],
              ["Collections", preflight.totals.schemaCollections],
              ["Assets", preflight.totals.assets],
              ["Public files", preflight.totals.publicAssets],
              ["Missing files", missingPublicAssets],
              ["Upload size", formatBytes(preflight.publicAssets.totalBytes)],
            ].map(([label, value]) => (
              <div
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-950"
                key={label}
              >
                <span className="text-gray-500 dark:text-gray-400">
                  {label}
                </span>
                <span className="float-right font-bold text-gray-900 dark:text-white">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {missingPublicAssets > 0 ? (
            <div className="mt-4 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200">
              <div>
                <strong className="block">
                  {missingPublicAssets} local public asset
                  {missingPublicAssets === 1 ? "" : "s"} missing
                </strong>
                <span className="mt-1 block text-xs text-red-600 dark:text-red-300">
                  Apply remains blocked until every expected file exists.
                </span>
              </div>
              <a
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:border-red-400 hover:text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-100 dark:hover:border-red-700"
                download
                href="/api/admin/tuturuuu/migration/missing-assets?format=csv"
              >
                <Download className="h-3.5 w-3.5" />
                Download missing asset report
              </a>
            </div>
          ) : null}

          {preflight.issues.length > 0 ? (
            <div className="mt-4 space-y-2">
              {preflight.issues.slice(0, 8).map((issue) => (
                <div
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    issue.severity === "error"
                      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
                      : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
                  }`}
                  key={`${issue.code}:${issue.detail ?? issue.message}`}
                >
                  <strong className="mr-2 uppercase">{issue.severity}</strong>
                  {issue.message}
                </div>
              ))}
              {preflight.issues.length > 8 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Export the snapshot to review the remaining{" "}
                  {preflight.issues.length - 8} issue(s).
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

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

      {diff ? (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white">
            Type {MIGRATION_CONFIRMATION} to unlock apply
          </label>
          <input
            className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-900 transition outline-none focus:border-blue-400 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
            onChange={(event) => setConfirmation(event.target.value)}
            value={confirmation}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canApply}
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
            {diff.hasDestructiveOperations ? (
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:text-red-200"
                disabled={!canApply}
                onClick={() => void runApply(true)}
                type="button"
              >
                <AlertTriangle className="h-4 w-4" />
                Force apply destructive changes
              </button>
            ) : null}
          </div>
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
