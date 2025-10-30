"use client";

import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import type { Addon, Service } from "@/lib/actions/commissions";
import { cleanFormData } from "@/lib/forms";
import type { KeyboardEvent } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

type AddonFormData = {
  name: string;
  description?: string;
  price_impact: number;
  percentage: boolean;
  is_exclusive: boolean;
  service_ids?: string[];
};

type AddonFormProps = {
  addon?: Addon;
  availableServices?: Service[];
  linkedServiceIds?: string[];
  onSubmit: (data: AddonFormData) => Promise<Addon | void>;
  onComplete: () => void;
  onCancel: () => void;
};

export default function AddonForm({
  addon,
  availableServices = [],
  linkedServiceIds = [],
  onSubmit,
  onComplete,
  onCancel,
}: AddonFormProps) {
  const form = useForm<AddonFormData>({
    defaultValues: {
      name: addon?.name || "",
      description: addon?.description || "",
      price_impact: addon?.price_impact || 0,
      percentage: addon?.percentage ?? false,
      is_exclusive: addon?.is_exclusive ?? false,
      service_ids: linkedServiceIds,
    },
  });

  const { register, handleSubmit: formHandleSubmit, watch } = form;
  const { handleExit, showConfirmDialog, confirmExit, cancelExit } =
    useFormDirtyState(form);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(
    new Set(linkedServiceIds),
  );

  const isExclusive = watch("is_exclusive");
  const maxServicesAllowed = isExclusive ? 1 : availableServices.length;

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Clean up empty strings to undefined
      const cleanData: AddonFormData = cleanFormData(data, ["description"], []);

      // Add selected service IDs
      cleanData.service_ids = Array.from(selectedServiceIds);

      // Submit the addon data
      await onSubmit(cleanData);

      // All done - close the form and refresh
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  });

  const handleServiceToggle = (serviceId: string) => {
    const newSelection = new Set(selectedServiceIds);

    if (isExclusive && newSelection.size >= 1 && !newSelection.has(serviceId)) {
      // For exclusive addons, can only have 1 service
      return;
    }

    if (newSelection.has(serviceId)) {
      newSelection.delete(serviceId);
    } else {
      newSelection.add(serviceId);
    }

    setSelectedServiceIds(newSelection);
  };

  const handleBackdropClick = () => {
    handleExit(onCancel);
  };

  const handleCancelClick = () => {
    handleExit(onCancel);
  };

  const handleBackdropKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleExit(onCancel);
    }
  };

  return (
    <>
      <div
        className="bg-opacity-50 animate-fadeIn fixed inset-0 z-50 flex items-center justify-center overflow-y-scroll bg-black p-4"
        role="button"
        tabIndex={0}
        aria-label="Close and discard changes"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
      >
        <div
          className="animate-slideUp flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden overflow-y-scroll rounded-lg bg-white dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="addon-form-title"
        >
          <div className="px-6 pt-6 pb-4">
            <h2 id="addon-form-title" className="text-2xl font-bold">
              {addon ? "Edit Add-on" : "Create New Add-on"}
            </h2>
            <button
              type="button"
              aria-label="Close dialog"
              onClick={handleCancelClick}
              className="absolute top-4 right-4 rounded p-2 text-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:hover:bg-gray-700"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                role="img"
                aria-labelledby="close-icon-title"
              >
                <title id="close-icon-title">Close Dialog</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="flex flex-1 flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  {...register("name", { required: true })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Extra Character, Complex Background"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  {...register("description")}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe this add-on..."
                />
              </div>

              {/* Price Impact */}
              <div>
                <label
                  htmlFor="price_impact"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Price Impact <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price_impact"
                  step="0.01"
                  min="0"
                  {...register("price_impact", {
                    required: true,
                    valueAsNumber: true,
                    min: 0,
                  })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Additional cost when this add-on is selected
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {/* Percentage Toggle */}
                <div className="rounded-md border border-gray-300 p-4 dark:border-gray-600">
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        type="checkbox"
                        id="percentage"
                        {...register("percentage")}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="percentage"
                        className="font-medium text-gray-700 dark:text-gray-300"
                      >
                        Display as Percentage
                      </label>
                      <p className="mt-1 text-gray-500 dark:text-gray-400">
                        When enabled, the price impact will be displayed as a
                        percentage (%) instead of EUR (€)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Is Exclusive */}
                <div className="rounded-md border border-gray-300 p-4 dark:border-gray-600">
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        type="checkbox"
                        id="is_exclusive"
                        {...register("is_exclusive")}
                        disabled={selectedServiceIds.size > 1}
                        className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 ${
                          selectedServiceIds.size > 1
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="is_exclusive"
                        className={`font-medium ${
                          selectedServiceIds.size > 1
                            ? "cursor-not-allowed text-gray-400 dark:text-gray-500"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        Exclusive Add-on
                      </label>
                      <p className="mt-1 text-gray-500 dark:text-gray-400">
                        {selectedServiceIds.size > 1 ? (
                          <>
                            Cannot mark as exclusive:{" "}
                            <strong>multiple services selected</strong>. Remove
                            services to enable this option.
                          </>
                        ) : isExclusive ? (
                          <>
                            This add-on can only be linked to{" "}
                            <strong>one service</strong>. Once linked, it cannot
                            be assigned to other services.
                          </>
                        ) : (
                          <>
                            This add-on can be shared across{" "}
                            <strong>multiple services</strong>.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Link to Services */}
              {availableServices.length > 0 && (
                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Link to Services
                    {isExclusive && selectedServiceIds.size > 0 && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Linked: {selectedServiceIds.size}/{maxServicesAllowed})
                      </span>
                    )}
                    {!isExclusive && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Linked: {selectedServiceIds.size})
                      </span>
                    )}
                  </label>
                  <div className="space-y-2 rounded-md border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700/50">
                    {availableServices.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No services available. Create a service first.
                      </p>
                    ) : (
                      availableServices.map((service) => {
                        const isSelected = selectedServiceIds.has(
                          service.service_id,
                        );
                        const isDisabled =
                          isExclusive &&
                          !isSelected &&
                          selectedServiceIds.size >= maxServicesAllowed;

                        return (
                          <label
                            key={service.service_id}
                            className={`flex cursor-pointer items-center gap-2 rounded p-2 transition-colors ${
                              isDisabled
                                ? "cursor-not-allowed bg-gray-100 opacity-50 dark:bg-gray-600"
                                : "hover:bg-white dark:hover:bg-gray-600"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={() =>
                                handleServiceToggle(service.service_id)
                              }
                              className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 ${
                                isDisabled ? "cursor-not-allowed" : ""
                              }`}
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {service.name}
                              </span>
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                €{service.base_price.toFixed(2)}
                              </span>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                  {isExclusive && selectedServiceIds.size > 0 && (
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ This exclusive add-on is linked to{" "}
                      {selectedServiceIds.size} service. It cannot be linked to
                      additional services.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-300 bg-gray-50 px-6 py-4 dark:border-gray-600 dark:bg-gray-900">
              <button
                type="button"
                onClick={handleCancelClick}
                disabled={loading}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {loading ? "Saving..." : addon ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmExitDialog
        isOpen={showConfirmDialog}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
    </>
  );
}
