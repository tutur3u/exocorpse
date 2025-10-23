"use client";

export default function TermsOfServiceTab() {
  return (
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
  );
}
