"use client";

import { useState } from "react";

export default function Commission() {
  const [activeTab, setActiveTab] = useState<"info" | "pricing" | "tos">(
    "info",
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-gray-300 dark:border-gray-700">
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "info"
              ? "border-b-2 border-blue-500 bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-900"
          }`}
          onClick={() => setActiveTab("info")}
        >
          Info
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "pricing"
              ? "border-b-2 border-blue-500 bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-900"
          }`}
          onClick={() => setActiveTab("pricing")}
        >
          Pricing
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "tos"
              ? "border-b-2 border-blue-500 bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-900"
          }`}
          onClick={() => setActiveTab("tos")}
        >
          Terms of Service
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "info" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Commission Information</h2>
            <p>
              Welcome! I&apos;m currently accepting commissions for writing and
              art projects.
            </p>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">What I Offer:</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>Character illustrations</li>
                <li>World-building narratives</li>
                <li>Custom artwork</li>
                <li>Story writing</li>
              </ul>
            </div>
          </div>
        )}
        {activeTab === "pricing" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Pricing</h2>
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-2 font-semibold">Character Illustration</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Starting at $XX
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-2 font-semibold">Story Writing</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  $XX per 1000 words
                </p>
              </div>
            </div>
          </div>
        )}
        {activeTab === "tos" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Terms of Service</h2>
            <div className="space-y-2">
              <h3 className="font-semibold">Payment</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Payment details and terms...
              </p>
              <h3 className="font-semibold">Usage Rights</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Usage rights and licensing information...
              </p>
              <h3 className="font-semibold">Revisions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Revision policy details...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
