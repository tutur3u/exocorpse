"use client";

export default function PricingTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pricing</h2>
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h3 className="mb-2 font-semibold">Character Illustration</h3>
          <p className="text-gray-600 dark:text-gray-400">Starting at $XX</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h3 className="mb-2 font-semibold">Story Writing</h3>
          <p className="text-gray-600 dark:text-gray-400">$XX per 1000 words</p>
        </div>
      </div>
    </div>
  );
}
