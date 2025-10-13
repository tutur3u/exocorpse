"use client";

import { useState } from "react";

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState<"writing" | "art">("writing");

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-gray-300 dark:border-gray-700">
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "writing"
              ? "border-b-2 border-blue-500 bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-900"
          }`}
          onClick={() => setActiveTab("writing")}
        >
          Writing
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "art"
              ? "border-b-2 border-blue-500 bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-900"
          }`}
          onClick={() => setActiveTab("art")}
        >
          Art
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "writing" ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Writing Portfolio</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Stories, narratives, and world-building content will be displayed
              here.
            </p>
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-2 font-semibold">Sample Story Title</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Content will be fetched from database...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Art Portfolio</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Artwork and visual designs will be displayed here.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex h-full items-center justify-center text-gray-400">
                  Artwork 1
                </div>
              </div>
              <div className="aspect-square rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex h-full items-center justify-center text-gray-400">
                  Artwork 2
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
