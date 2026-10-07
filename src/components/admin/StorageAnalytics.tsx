"use client";

import type { AdminDriveAnalytics } from "@/types/admin-integrations";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

async function getStorageAnalytics(): Promise<AdminDriveAnalytics> {
  const response = await fetch("/api/admin/drive?analytics=1", {
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error("Storage statistics could not load. Please try again.");
  const payload: { data: AdminDriveAnalytics } = await response.json();
  return payload.data;
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    sizes.length - 1,
    Math.max(0, Math.floor(Math.log(bytes) / Math.log(k))),
  );

  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}

export default function StorageAnalytics() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: analytics,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "drive", "analytics"],
    queryFn: getStorageAnalytics,
    enabled: isOpen,
  });

  const usagePercentageDisplay = analytics
    ? Math.max(0, Math.min(analytics.usagePercentage, 100))
    : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      {/* Accordion Header */}
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="storage-analytics-content"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-900"
      >
        <div className="flex items-center gap-3">
          <div className="h-1 w-12 rounded-full bg-linear-to-r from-cyan-500 to-blue-500"></div>
          <div className="text-left">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Storage Analytics
            </h3>
            {isOpen && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Workspace storage overview and usage statistics
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-600 transition-transform dark:text-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div
          id="storage-analytics-content"
          className="border-t border-gray-200 px-8 pt-6 pb-8 dark:border-gray-800"
        >
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400"></div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
              <p className="text-sm text-red-700 dark:text-red-200">
                {error.message}
              </p>
              <button
                type="button"
                className="mt-2 text-sm underline"
                onClick={() => void refetch()}
              >
                Try again
              </button>
            </div>
          )}

          {analytics && !loading && !error && (
            <>
              {analytics.truncated && (
                <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
                  Statistics cover the first{" "}
                  {analytics.scannedObjectLimit.toLocaleString()} files. Open
                  Drive for more details.
                </p>
              )}
              {/* Storage Gauge */}
              <div className="mb-8 space-y-4">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Storage Usage
                  </h4>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {usagePercentageDisplay.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                  <div
                    className="h-full bg-linear-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${usagePercentageDisplay}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{formatBytes(analytics.totalSize)} used</span>
                  <span>{formatBytes(analytics.storageLimit)} limit</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Size */}
                <div className="rounded-lg border border-gray-200 bg-linear-to-br from-blue-50 to-cyan-50 p-4 dark:border-gray-800 dark:from-blue-950/30 dark:to-cyan-950/30">
                  <p className="text-xs font-medium tracking-wider text-gray-600 uppercase dark:text-gray-400">
                    Total Size
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {formatBytes(analytics.totalSize)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    {(analytics.totalSize / 1024 / 1024 / 1024).toFixed(2)} GB
                  </p>
                </div>

                {/* File Count */}
                <div className="rounded-lg border border-gray-200 bg-linear-to-br from-purple-50 to-pink-50 p-4 dark:border-gray-800 dark:from-purple-950/30 dark:to-pink-950/30">
                  <p className="text-xs font-medium tracking-wider text-gray-600 uppercase dark:text-gray-400">
                    File Count
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.fileCount.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    files stored
                  </p>
                </div>

                {/* Storage Limit */}
                <div className="rounded-lg border border-gray-200 bg-linear-to-br from-green-50 to-emerald-50 p-4 dark:border-gray-800 dark:from-green-950/30 dark:to-emerald-950/30">
                  <p className="text-xs font-medium tracking-wider text-gray-600 uppercase dark:text-gray-400">
                    Storage Limit
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {formatBytes(analytics.storageLimit)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    {(analytics.storageLimit / 1024 / 1024 / 1024).toFixed(2)}{" "}
                    GB
                  </p>
                </div>

                {/* Available Space */}
                <div className="rounded-lg border border-gray-200 bg-linear-to-br from-amber-50 to-orange-50 p-4 dark:border-gray-800 dark:from-amber-950/30 dark:to-orange-950/30">
                  <p className="text-xs font-medium tracking-wider text-gray-600 uppercase dark:text-gray-400">
                    Available Space
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {formatBytes(
                      Math.max(0, analytics.storageLimit - analytics.totalSize),
                    )}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    {(
                      Math.max(
                        0,
                        analytics.storageLimit - analytics.totalSize,
                      ) /
                      1024 /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    GB
                  </p>
                </div>
              </div>

              {/* File Extremes */}
              {(analytics.largestFile || analytics.smallestFile) && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {analytics.largestFile && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                      <p className="text-xs font-medium tracking-wider text-gray-600 uppercase dark:text-gray-400">
                        Largest File
                      </p>
                      <p className="mt-2 truncate font-mono text-sm text-balance text-gray-900 dark:text-gray-100">
                        {analytics.largestFile.name}
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                        {formatBytes(analytics.largestFile.size)}
                      </p>
                    </div>
                  )}
                  {analytics.smallestFile && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                      <p className="text-xs font-medium tracking-wider text-gray-600 uppercase dark:text-gray-400">
                        Smallest File
                      </p>
                      <p className="mt-2 truncate font-mono text-sm text-balance text-gray-900 dark:text-gray-100">
                        {analytics.smallestFile.name}
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                        {formatBytes(analytics.smallestFile.size)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
