"use client";

import { getStorageAnalytics } from "@/lib/actions/storage";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface StorageFile {
  name: string;
  size: number;
  createdAt: string;
}

interface AnalyticsData {
  totalSize: number;
  fileCount: number;
  storageLimit: number;
  usagePercentage: number;
  largestFile: StorageFile | null;
  smallestFile: StorageFile | null;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}

export default function StorageAnalytics() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: analytics,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["storageAnalytics"],
    queryFn: getStorageAnalytics,
    enabled: isOpen,
  });

  const usagePercentageDisplay = analytics
    ? Math.min(analytics.data.usagePercentage, 100)
    : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      {/* Accordion Header */}
      <button
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
        <div className="border-t border-gray-200 px-8 pt-6 pb-8 dark:border-gray-800">
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
            </div>
          )}

          {analytics && !loading && !error && (
            <>
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
                  <span>{formatBytes(analytics.data.totalSize)} used</span>
                  <span>{formatBytes(analytics.data.storageLimit)} limit</span>
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
                    {formatBytes(analytics.data.totalSize)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    {(analytics.data.totalSize / 1024 / 1024 / 1024).toFixed(2)}{" "}
                    GB
                  </p>
                </div>

                {/* File Count */}
                <div className="rounded-lg border border-gray-200 bg-linear-to-br from-purple-50 to-pink-50 p-4 dark:border-gray-800 dark:from-purple-950/30 dark:to-pink-950/30">
                  <p className="text-xs font-medium tracking-wider text-gray-600 uppercase dark:text-gray-400">
                    File Count
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.data.fileCount.toLocaleString()}
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
                    {formatBytes(analytics.data.storageLimit)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    {(analytics.data.storageLimit / 1024 / 1024 / 1024).toFixed(
                      2,
                    )}{" "}
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
                      analytics.data.storageLimit - analytics.data.totalSize,
                    )}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    {(
                      (analytics.data.storageLimit - analytics.data.totalSize) /
                      1024 /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    GB
                  </p>
                </div>
              </div>

              {/* File Extremes */}
              {(analytics.data.largestFile || analytics.data.smallestFile) && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {analytics.data.largestFile && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                      <p className="text-xs font-medium tracking-wider text-gray-600 uppercase dark:text-gray-400">
                        Largest File
                      </p>
                      <p className="mt-2 truncate font-mono text-sm text-balance text-gray-900 dark:text-gray-100">
                        {analytics.data.largestFile.name}
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                        {formatBytes(analytics.data.largestFile.size)}
                      </p>
                    </div>
                  )}
                  {analytics.data.smallestFile && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                      <p className="text-xs font-medium tracking-wider text-gray-600 uppercase dark:text-gray-400">
                        Smallest File
                      </p>
                      <p className="mt-2 truncate font-mono text-sm text-balance text-gray-900 dark:text-gray-100">
                        {analytics.data.smallestFile.name}
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                        {formatBytes(analytics.data.smallestFile.size)}
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
