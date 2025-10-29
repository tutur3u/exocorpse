"use client";

import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import ImageUploader from "@/components/shared/ImageUploader";
import StorageImage from "@/components/shared/StorageImage";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import type {
  Addon,
  Picture,
  Service,
  ServiceWithDetails,
  Style,
} from "@/lib/actions/commissions";
import { deleteFile } from "@/lib/actions/storage";
import { cleanFormData } from "@/lib/forms";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import PictureForm from "./PictureForm";
import StyleForm from "./StyleForm";
// Local payload types for handlers
type StylePayload = {
  service_id: string;
  name: string;
  slug: string;
  description?: string;
};

type PicturePayload = {
  service_id: string;
  style_id?: string | null;
  image_url: string;
  caption?: string;
  is_primary_example: boolean;
};

type ServiceFormData = {
  name: string;
  slug: string;
  description?: string;
  base_price: number;
  is_active: boolean;
  comm_link?: string;
  cover_image_url?: string;
};

type ServiceFormProps = {
  service?: ServiceWithDetails;
  availableAddons?: Addon[];
  onSubmit: (
    data: ServiceFormData,
    selectedAddonIds?: string[],
  ) => Promise<Service | void>;
  onComplete: () => void;
  onCancel: () => void;
  // Handlers for styles
  onCreateStyle?: (data: StylePayload) => Promise<Style | void>;
  onUpdateStyle?: (
    styleId: string,
    data: StylePayload,
  ) => Promise<Style | void>;
  onDeleteStyle?: (styleId: string) => Promise<void>;
  // Handlers for pictures
  onCreatePicture?: (data: PicturePayload) => Promise<Picture>;
  onUpdatePicture?: (
    pictureId: string,
    data: PicturePayload,
  ) => Promise<Picture>;
  onDeletePicture?: (pictureId: string) => Promise<void>;
  onPictureComplete?: () => Promise<void>;
  // Handlers for addons
  onLinkAddons?: (addonIds: string[]) => Promise<void>;
};

type ServiceFormTab = "details" | "styles" | "addons";

export default function ServiceForm({
  service,
  availableAddons = [],
  onSubmit,
  onComplete,
  onCancel,
  onCreateStyle,
  onUpdateStyle,
  onDeleteStyle,
  onCreatePicture,
  onUpdatePicture,
  onDeletePicture,
  onPictureComplete,
  onLinkAddons,
}: ServiceFormProps) {
  const [activeTab, setActiveTab] = useState<ServiceFormTab>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Styles state
  const [showStyleForm, setShowStyleForm] = useState(false);
  const [editingStyle, setEditingStyle] = useState<Style | null>(null);

  // Pictures state
  const [showPictureForm, setShowPictureForm] = useState(false);
  const [editingPicture, setEditingPicture] = useState<Picture | null>(null);
  const [pictureStyleId, setPictureStyleId] = useState<string | null>(null);

  // Addon state
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

  const form = useForm<ServiceFormData>({
    defaultValues: {
      name: service?.name || "",
      slug: service?.slug || "",
      description: service?.description || "",
      base_price: service?.base_price || 0,
      is_active: service?.is_active ?? true,
      comm_link: service?.comm_link || "",
      cover_image_url: service?.cover_image_url || "",
    },
  });

  const {
    register,
    handleSubmit: formHandleSubmit,
    setValue,
    watch,
    reset,
  } = form;
  const { handleExit, showConfirmDialog, confirmExit, cancelExit } =
    useFormDirtyState(form);

  const isActive = watch("is_active");

  // Reset form when service changes
  useEffect(() => {
    reset({
      name: service?.name || "",
      slug: service?.slug || "",
      description: service?.description || "",
      base_price: service?.base_price || 0,
      is_active: service?.is_active ?? true,
      comm_link: service?.comm_link || "",
      cover_image_url: service?.cover_image_url || "",
    });
  }, [service, reset]);

  // Initialize selected addons when service changes
  useEffect(() => {
    if (service?.service_addons) {
      setSelectedAddons(
        new Set(service.service_addons.map((sa) => sa.addon_id)),
      );
    }
  }, [service?.service_addons]);

  // Collect all picture URLs for batch fetching
  const allPictureUrls = useMemo(() => {
    if (!service) return [];

    const urls: string[] = [];

    // Service-level pictures only (exclude style pictures)
    service.pictures
      ?.filter((p) => !p.style_id)
      .forEach((picture) => {
        if (picture.image_url && !picture.image_url.startsWith("pending:")) {
          urls.push(picture.image_url);
        }
      });

    // Style-specific pictures
    service.styles?.forEach((style) => {
      style.pictures?.forEach((picture) => {
        if (picture.image_url && !picture.image_url.startsWith("pending:")) {
          urls.push(picture.image_url);
        }
      });
    });

    return urls;
  }, [service]);

  // Batch fetch all signed URLs
  const { signedUrls } = useBatchStorageUrls(allPictureUrls, !!service);

  // Cover selection modal state
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  // All selectable cover candidates (service-level + style pictures)
  const coverCandidates: { id: string; url: string; caption?: string }[] =
    useMemo(() => {
      if (!service) return [];
      const items: { id: string; url: string; caption?: string }[] = [];

      // Service-level pictures only to avoid duplicating style images
      service.pictures
        ?.filter((p) => !!p.image_url && !p.style_id)
        .forEach((p) =>
          items.push({
            id: p.picture_id,
            url: p.image_url,
            caption: p.caption ?? undefined,
          }),
        );

      // Style pictures
      service.styles?.forEach((s) => {
        s.pictures?.forEach((p) => {
          if (p.image_url)
            items.push({
              id: p.picture_id,
              url: p.image_url,
              caption: p.caption ?? undefined,
            });
        });
      });

      // Deduplicate by picture id just in case
      const seen = new Set<string>();
      return items.filter((it) => {
        if (seen.has(it.id)) return false;
        seen.add(it.id);
        return true;
      });
    }, [service]);

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Clean up empty strings to undefined
      const cleanData: ServiceFormData = cleanFormData(
        data,
        ["description", "comm_link", "cover_image_url"],
        [],
      );

      // Submit the service data with selected addons
      await onSubmit(cleanData, Array.from(selectedAddons));

      // All done - close the form and refresh
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  });

  const handleNameChange = (value: string) => {
    setValue("name", value, { shouldDirty: true });
    if (!service) {
      const slugValue = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("slug", slugValue, { shouldDirty: true });
    }
  };

  const handleBackdropClick = () => {
    handleExit(onCancel);
  };

  const handleCancelClick = () => {
    handleExit(onCancel);
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleExit(onCancel);
    }
  };

  const handleSaveAddons = async () => {
    if (onLinkAddons) {
      try {
        await onLinkAddons(Array.from(selectedAddons));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save add-ons");
      }
    }
  };

  // Get non-exclusive addons only for new services
  const nonExclusiveAddons = availableAddons.filter(
    (addon) => !addon.is_exclusive,
  );

  // For existing services, show all available addons
  const addonsToShow = service ? availableAddons : nonExclusiveAddons;

  return (
    <>
      <div
        className="bg-opacity-50 animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
        role="button"
        tabIndex={0}
        aria-label="Close and discard changes"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
      >
        <div
          className="animate-slideUp flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-form-title"
        >
          <div className="shrink-0 px-6 pt-6 pb-4">
            <h2 id="service-form-title" className="text-2xl font-bold">
              {service ? "Edit Service" : "Create New Service"}
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-gray-300 px-6 dark:border-gray-600">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "details"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Details
            </button>
            {service && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("styles")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === "styles"
                      ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  Styles & Pictures
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("addons")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === "addons"
                      ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  Add-ons
                </button>
              </>
            )}
          </div>

          <form
            onSubmit={handleFormSubmit}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Error Display */}
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}

              {/* Details Tab */}
              {activeTab === "details" && (
                <div className="space-y-4">
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
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Full Body Illustration"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label
                      htmlFor="slug"
                      className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="slug"
                      {...register("slug", { required: true })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="full-body-illustration"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      URL-friendly identifier (auto-generated from name for new
                      services)
                    </p>
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
                      rows={4}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Describe this service..."
                    />
                  </div>

                  {/* Cover Image (existing services only) */}
                  {service && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cover Image
                      </label>
                      <div className="space-y-2 rounded-md border border-gray-200 p-3 dark:border-gray-700">
                        <ImageUploader
                          label="Cover Image"
                          value={watch("cover_image_url") || ""}
                          onChange={(value) =>
                            setValue("cover_image_url", value, {
                              shouldDirty: true,
                            })
                          }
                          uploadPath={
                            service
                              ? `services/${service.service_id}/cover`
                              : undefined
                          }
                          enableUpload={!!service}
                          onBeforeChange={async (oldValue, _newValue) => {
                            // Delete old file if it was a storage path (not http/data/pending)
                            if (
                              oldValue &&
                              !oldValue.startsWith("http") &&
                              !oldValue.startsWith("data:") &&
                              !oldValue.startsWith("pending:")
                            ) {
                              try {
                                await deleteFile(oldValue);
                              } catch {}
                            }
                          }}
                          helpText="Upload a new image or choose from existing examples."
                        />
                        <div>
                          <button
                            type="button"
                            onClick={() => setShowCoverPicker(true)}
                            className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                          >
                            Choose existing
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Base Price */}
                  <div>
                    <label
                      htmlFor="base_price"
                      className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Base Price (USD) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="base_price"
                      step="0.01"
                      min="0"
                      {...register("base_price", {
                        required: true,
                        valueAsNumber: true,
                        min: 0,
                      })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Starting price for this service
                    </p>
                  </div>

                  {/* Commission Link */}
                  <div>
                    <label
                      htmlFor="comm_link"
                      className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Commission Form Link
                    </label>
                    <input
                      type="url"
                      id="comm_link"
                      {...register("comm_link")}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="https://forms.gle/..."
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Link to commission form or inquiry page
                    </p>
                  </div>

                  {/* Is Active */}
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        {...register("is_active")}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="is_active"
                        className="font-medium text-gray-700 dark:text-gray-300"
                      >
                        Active
                      </label>
                      <p className="text-gray-500 dark:text-gray-400">
                        {isActive
                          ? "This service is available for commission"
                          : "This service is hidden from public view"}
                      </p>
                    </div>
                  </div>

                  {/* Pre-link Add-ons Section (only for new services) */}
                  {!service && nonExclusiveAddons.length > 0 && (
                    <div>
                      <p className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Pre-link Add-ons
                      </p>
                      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                        Select non-exclusive add-ons to link to this service
                        now. You can modify these later.
                      </p>
                      <div className="space-y-2 rounded-md border border-gray-200 p-3 dark:border-gray-700">
                        {nonExclusiveAddons.map((addon) => (
                          <label
                            key={addon.addon_id}
                            className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <input
                              type="checkbox"
                              checked={selectedAddons.has(addon.addon_id)}
                              onChange={(e) => {
                                const newSelected = new Set(selectedAddons);
                                if (e.target.checked) {
                                  newSelected.add(addon.addon_id);
                                } else {
                                  newSelected.delete(addon.addon_id);
                                }
                                setSelectedAddons(newSelected);
                              }}
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {addon.name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                +${addon.price_impact.toFixed(2)}
                              </p>
                              {addon.description && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  {addon.description}
                                </p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Styles & Pictures Tab */}
              {activeTab === "styles" && service && (
                <div className="space-y-6">
                  {/* Service-Level Pictures Section */}
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Service Examples
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setPictureStyleId(null);
                          setEditingPicture(null);
                          setShowPictureForm(true);
                        }}
                        className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        + Upload Picture
                      </button>
                    </div>
                    <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                      General examples for this service (not tied to a specific
                      style)
                    </p>
                    {!service.pictures ||
                    service.pictures.filter((p) => !p.style_id).length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No service-level pictures yet
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {service.pictures
                          ?.filter((p) => !p.style_id)
                          .map((picture) => (
                            <div
                              key={picture.picture_id}
                              className="group relative aspect-square overflow-hidden rounded-md border border-gray-200 dark:border-gray-700"
                            >
                              <StorageImage
                                src={picture.image_url}
                                signedUrl={signedUrls.get(picture.image_url)}
                                alt={picture.caption || "Service example"}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 33vw, 20vw"
                              />
                              {picture.is_primary_example && (
                                <div className="absolute top-1 left-1 z-10 rounded bg-yellow-400 px-1 py-0.5 text-xs font-medium text-yellow-900">
                                  Primary
                                </div>
                              )}
                              <div className="bg-opacity-50 group-hover:bg-opacity-60 absolute inset-0 z-10 flex items-center justify-center gap-2 transition-all hover:bg-black">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPicture(picture);
                                    setPictureStyleId(null);
                                    setShowPictureForm(true);
                                  }}
                                  className="rounded bg-blue-500 px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onDeletePicture) {
                                      onDeletePicture(picture.picture_id);
                                    }
                                  }}
                                  className="rounded bg-red-600 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Styles Section */}
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Styles
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStyle(null);
                          setShowStyleForm(true);
                        }}
                        className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        + Add Style
                      </button>
                    </div>

                    {service.styles?.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No styles added yet
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {service.styles?.map((style) => (
                          <div
                            key={style.style_id}
                            className="rounded-md border border-gray-200 p-4 dark:border-gray-700"
                          >
                            <div className="mb-3 flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {style.name}
                                </h4>
                                {style.description && (
                                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {style.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingStyle(style);
                                    setShowStyleForm(true);
                                  }}
                                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onDeleteStyle) {
                                      onDeleteStyle(style.style_id);
                                    }
                                  }}
                                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            {/* Pictures */}
                            <div className="mt-4">
                              <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  Example Pictures
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPictureStyleId(style.style_id);
                                    setEditingPicture(null);
                                    setShowPictureForm(true);
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                  + Upload
                                </button>
                              </div>
                              {style.pictures?.length === 0 ? (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  No pictures yet
                                </p>
                              ) : (
                                <div className="grid grid-cols-3 gap-2">
                                  {style.pictures?.map((picture) => (
                                    <div
                                      key={picture.picture_id}
                                      className="group relative aspect-square overflow-hidden rounded-md border border-gray-200 dark:border-gray-700"
                                    >
                                      <StorageImage
                                        src={picture.image_url}
                                        signedUrl={signedUrls.get(
                                          picture.image_url,
                                        )}
                                        alt={picture.caption || "Example"}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 33vw, 20vw"
                                      />
                                      {picture.is_primary_example && (
                                        <div className="absolute top-1 left-1 z-10 rounded bg-yellow-400 px-1 py-0.5 text-xs font-medium text-yellow-900">
                                          Primary
                                        </div>
                                      )}
                                      <div className="bg-opacity-0 group-hover:bg-opacity-60 absolute inset-0 z-10 flex items-center justify-center gap-2 transition-all hover:bg-black">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingPicture(picture);
                                            setPictureStyleId(style.style_id);
                                            setShowPictureForm(true);
                                          }}
                                          className="rounded bg-white px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (onDeletePicture) {
                                              onDeletePicture(
                                                picture.picture_id,
                                              );
                                            }
                                          }}
                                          className="rounded bg-red-600 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add-ons Tab */}
              {activeTab === "addons" && service && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select which add-ons are available for this service.
                  </p>
                  <div className="space-y-2 rounded-md border border-gray-200 p-3 dark:border-gray-700">
                    {addonsToShow.map((addon) => (
                      <label
                        key={addon.addon_id}
                        className="flex items-start gap-3 rounded-md border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAddons.has(addon.addon_id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedAddons);
                            if (e.target.checked) {
                              newSelected.add(addon.addon_id);
                            } else {
                              newSelected.delete(addon.addon_id);
                            }
                            setSelectedAddons(newSelected);
                          }}
                          className="mt-1 h-4 w-4"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {addon.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            +${addon.price_impact.toFixed(2)}
                          </p>
                          {addon.description && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {addon.description}
                            </p>
                          )}
                          {addon.is_exclusive && (
                            <span className="mt-1 inline-block text-xs text-yellow-600 dark:text-yellow-400">
                              (Exclusive)
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 justify-end gap-3 border-t border-gray-300 bg-gray-50 px-6 py-4 dark:border-gray-600 dark:bg-gray-900">
              <button
                type="button"
                onClick={handleCancelClick}
                disabled={loading}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              {activeTab === "details" && (
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {loading ? "Saving..." : service ? "Update" : "Create"}
                </button>
              )}
              {activeTab === "addons" && service && (
                <button
                  type="button"
                  onClick={handleSaveAddons}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Save Add-ons
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Style Form */}
      {showStyleForm && service && (
        <StyleForm
          serviceId={service.service_id}
          style={editingStyle || undefined}
          onSubmit={
            editingStyle && onUpdateStyle
              ? (data) => onUpdateStyle(editingStyle.style_id, data)
              : onCreateStyle || (() => Promise.resolve())
          }
          onComplete={() => {
            setShowStyleForm(false);
            setEditingStyle(null);
          }}
          onCancel={() => {
            setShowStyleForm(false);
            setEditingStyle(null);
          }}
        />
      )}

      {/* Picture Form */}
      {showPictureForm && service && onCreatePicture && (
        <PictureForm
          serviceId={service.service_id}
          styleId={pictureStyleId}
          picture={editingPicture || undefined}
          onSubmit={
            editingPicture && onUpdatePicture
              ? (data) => onUpdatePicture(editingPicture.picture_id, data)
              : onCreatePicture
          }
          onComplete={async () => {
            // Refetch service data to get updated pictures
            if (onPictureComplete) {
              await onPictureComplete();
            }
            setShowPictureForm(false);
            setEditingPicture(null);
            setPictureStyleId(null);
          }}
          onCancel={() => {
            setShowPictureForm(false);
            setEditingPicture(null);
            setPictureStyleId(null);
          }}
        />
      )}

      {/* Cover Picker Modal */}
      {showCoverPicker && service && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowCoverPicker(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Choose existing image</h3>
              <button
                type="button"
                className="rounded px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowCoverPicker(false)}
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-4">
              {coverCandidates.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No images available yet. Upload examples first.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {coverCandidates.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="group relative aspect-square overflow-hidden rounded-md border border-gray-200 text-left hover:ring-2 hover:ring-blue-500 dark:border-gray-700"
                      onClick={() => {
                        setValue("cover_image_url", item.url, {
                          shouldDirty: true,
                        });
                        setShowCoverPicker(false);
                      }}
                    >
                      <StorageImage
                        src={item.url}
                        signedUrl={signedUrls.get(item.url)}
                        alt={item.caption || "Example"}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 hidden items-center justify-center bg-black/40 text-white group-hover:flex">
                        <span className="rounded bg-white/80 px-2 py-1 text-xs font-medium text-gray-900">
                          Select
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmExitDialog
        isOpen={showConfirmDialog}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
    </>
  );
}
