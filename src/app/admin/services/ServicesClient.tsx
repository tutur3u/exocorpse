"use client";

import ServiceForm from "@/components/admin/forms/ServiceForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  createPicture,
  createService,
  createStyle,
  deletePicture,
  deleteService,
  deleteStyle,
  getAllAddons,
  getAllServices,
  getExclusiveAddonServices,
  getServiceById,
  linkAddonToService,
  unlinkAddonFromService,
  updatePicture,
  updateService,
  updateStyle,
  type Addon,
  type Service,
} from "@/lib/actions/commissions";
import toastWithSound from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

type ServicesClientProps = {
  initialServices: Service[];
  initialAddons: Addon[];
};

export default function ServicesClient({
  initialServices,
  initialAddons,
}: ServicesClientProps) {
  const queryClient = useQueryClient();

  // Modal state
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );

  // Services state
  const [showDeleteServiceConfirm, setShowDeleteServiceConfirm] =
    useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);

  // Style delete state
  const [showDeleteStyleConfirm, setShowDeleteStyleConfirm] = useState(false);
  const [pendingDeleteStyleId, setPendingDeleteStyleId] = useState<
    string | null
  >(null);

  // Picture delete state
  const [showDeletePictureConfirm, setShowDeletePictureConfirm] =
    useState(false);
  const [pendingDeletePictureId, setPendingDeletePictureId] = useState<
    string | null
  >(null);

  // Query services
  const { data: services = initialServices } = useQuery({
    queryKey: ["admin-services"],
    queryFn: getAllServices,
    initialData: initialServices,
  });

  // Query addons
  const { data: addons = initialAddons } = useQuery({
    queryKey: ["admin-addons"],
    queryFn: getAllAddons,
    initialData: initialAddons,
  });

  // Query exclusive addon services mapping
  const { data: exclusiveAddonServices = {} } = useQuery({
    queryKey: ["exclusive-addon-services"],
    queryFn: getExclusiveAddonServices,
  });

  // Fetch detailed service data when editing
  const { data: selectedServiceData } = useQuery({
    queryKey: ["admin-service-detail", selectedServiceId],
    queryFn: () =>
      selectedServiceId ? getServiceById(selectedServiceId) : null,
    enabled: !!selectedServiceId && showServiceForm,
  });

  // SERVICE MUTATIONS
  const createServiceMutation = useMutation({
    mutationFn: createService,
    onSuccess: (result) => {
      toastWithSound.success("Service created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      // Switch to editing the newly created service
      setSelectedServiceId(result.service_id);
    },
    onError: () => {
      toastWithSound.error("Failed to create service");
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof updateService>[1];
    }) => updateService(id, updates),
    onSuccess: () => {
      toastWithSound.success("Service updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["admin-service-detail"] });
    },
    onError: () => {
      toastWithSound.error("Failed to update service");
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      toastWithSound.success("Service deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["exclusive-addon-services"] });
      setShowDeleteServiceConfirm(false);
      setDeleteServiceId(null);
      if (selectedServiceId === deleteServiceId) {
        setShowServiceForm(false);
        setSelectedServiceId(null);
      }
    },
    onError: () => {
      toastWithSound.error("Failed to delete service");
    },
  });

  // STYLE MUTATIONS
  const createStyleMutation = useMutation({
    mutationFn: createStyle,
    onSuccess: () => {
      toastWithSound.success("Style created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-service-detail"] });
    },
    onError: () => {
      toastWithSound.error("Failed to create style");
    },
  });

  const updateStyleMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof updateStyle>[1];
    }) => updateStyle(id, updates),
    onSuccess: () => {
      toastWithSound.success("Style updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-service-detail"] });
    },
    onError: () => {
      toastWithSound.error("Failed to update style");
    },
  });

  const deleteStyleMutation = useMutation({
    mutationFn: deleteStyle,
    onSuccess: () => {
      toastWithSound.success("Style deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-service-detail"] });
    },
    onError: () => {
      toastWithSound.error("Failed to delete style");
    },
  });

  // PICTURE MUTATIONS
  const createPictureMutation = useMutation({
    mutationFn: createPicture,
    onSuccess: async () => {
      toastWithSound.success("Picture uploaded successfully");
      // Refetch immediately to ensure fresh data
      await queryClient.refetchQueries({ queryKey: ["admin-service-detail"] });
    },
    onError: () => {
      toastWithSound.error("Failed to upload picture");
    },
  });

  const updatePictureMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof updatePicture>[1];
    }) => updatePicture(id, updates),
    onSuccess: async () => {
      toastWithSound.success("Picture updated successfully");
      // Refetch immediately to ensure fresh data
      await queryClient.refetchQueries({ queryKey: ["admin-service-detail"] });
    },
    onError: () => {
      toastWithSound.error("Failed to update picture");
    },
  });

  const deletePictureMutation = useMutation({
    mutationFn: deletePicture,
    onSuccess: () => {
      toastWithSound.success("Picture deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-service-detail"] });
      queryClient.invalidateQueries({ queryKey: ["storageAnalytics"] });
    },
    onError: () => {
      toastWithSound.error("Failed to delete picture");
    },
  });

  // ADDON LINKING
  const linkAddonMutation = useMutation({
    mutationFn: ({
      serviceId,
      addonId,
    }: {
      serviceId: string;
      addonId: string;
    }) => linkAddonToService(serviceId, addonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-service-detail"] });
      queryClient.invalidateQueries({ queryKey: ["exclusive-addon-services"] });
    },
    onError: (error: Error) => {
      toastWithSound.error(error.message || "Failed to link add-on");
    },
  });

  const unlinkAddonMutation = useMutation({
    mutationFn: ({
      serviceId,
      addonId,
    }: {
      serviceId: string;
      addonId: string;
    }) => unlinkAddonFromService(serviceId, addonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-service-detail"] });
      queryClient.invalidateQueries({ queryKey: ["exclusive-addon-services"] });
    },
    onError: () => {
      toastWithSound.error("Failed to unlink add-on");
    },
  });

  // HANDLERS
  const handleCreateService = useCallback(
    async (
      data: Parameters<typeof createService>[0],
      selectedAddonIds?: string[],
    ) => {
      const result = await createServiceMutation.mutateAsync(data);

      // If addons were selected, link them to the newly created service
      if (result && selectedAddonIds && selectedAddonIds.length > 0) {
        try {
          await Promise.all(
            selectedAddonIds.map((addonId) =>
              linkAddonMutation.mutateAsync({
                serviceId: result.service_id,
                addonId,
              }),
            ),
          );
        } catch (error) {
          console.error("Failed to link some addons to the new service");
        }
      }

      return result;
    },
    [createServiceMutation, linkAddonMutation],
  );

  const handleUpdateService = useCallback(
    async (
      data: Partial<
        Omit<
          Service,
          "service_id" | "created_at" | "slug" // slug is immutable here
        >
      >,
    ) => {
      if (!selectedServiceId) return;
      return updateServiceMutation.mutateAsync({
        id: selectedServiceId,
        updates: data,
      });
    },
    [selectedServiceId, updateServiceMutation],
  );

  const handleDeleteService = useCallback(() => {
    if (deleteServiceId) {
      deleteServiceMutation.mutate(deleteServiceId);
    }
  }, [deleteServiceId, deleteServiceMutation]);

  const handleCreateStyle = useCallback(
    async (data: Parameters<typeof createStyle>[0]) => {
      return createStyleMutation.mutateAsync(data);
    },
    [createStyleMutation],
  );

  const handleUpdateStyle = useCallback(
    async (styleId: string, data: Parameters<typeof updateStyle>[1]) => {
      return updateStyleMutation.mutateAsync({
        id: styleId,
        updates: data,
      });
    },
    [updateStyleMutation],
  );

  const handleDeleteStyle = useCallback(async (styleId: string) => {
    setPendingDeleteStyleId(styleId);
    setShowDeleteStyleConfirm(true);
  }, []);

  const handleConfirmDeleteStyle = useCallback(() => {
    if (pendingDeleteStyleId) {
      deleteStyleMutation.mutate(pendingDeleteStyleId);
      setShowDeleteStyleConfirm(false);
      setPendingDeleteStyleId(null);
    }
  }, [pendingDeleteStyleId, deleteStyleMutation]);

  const handleCancelDeleteStyle = useCallback(() => {
    setShowDeleteStyleConfirm(false);
    setPendingDeleteStyleId(null);
  }, []);

  const handleCreatePicture = useCallback(
    async (data: Parameters<typeof createPicture>[0]) => {
      return createPictureMutation.mutateAsync(data);
    },
    [createPictureMutation],
  );

  const handleUpdatePicture = useCallback(
    async (pictureId: string, data: Parameters<typeof updatePicture>[1]) => {
      return updatePictureMutation.mutateAsync({
        id: pictureId,
        updates: data,
      });
    },
    [updatePictureMutation],
  );

  const handlePictureFormComplete = useCallback(async () => {
    // Ensure service data is refetched after picture operations complete
    await queryClient.refetchQueries({
      queryKey: ["admin-service-detail", selectedServiceId],
    });
  }, [queryClient, selectedServiceId]);

  const handleDeletePicture = useCallback(async (pictureId: string) => {
    setPendingDeletePictureId(pictureId);
    setShowDeletePictureConfirm(true);
  }, []);

  const handleConfirmDeletePicture = useCallback(() => {
    if (pendingDeletePictureId) {
      deletePictureMutation.mutate(pendingDeletePictureId);
      setShowDeletePictureConfirm(false);
      setPendingDeletePictureId(null);
    }
  }, [pendingDeletePictureId, deletePictureMutation]);

  const handleCancelDeletePicture = useCallback(() => {
    setShowDeletePictureConfirm(false);
    setPendingDeletePictureId(null);
  }, []);

  const currentServiceAddons =
    selectedServiceData?.service_addons?.map((sa) => sa.addon_id) || [];

  // Get available addons, excluding exclusive addons linked to other services
  const availableAddons = useMemo(() => {
    return addons.filter((addon) => {
      if (addon.is_exclusive && exclusiveAddonServices[addon.addon_id]) {
        return exclusiveAddonServices[addon.addon_id] === selectedServiceId;
      }
      return true;
    });
  }, [addons, exclusiveAddonServices, selectedServiceId]);

  const handleLinkAddons = useCallback(
    async (selectedAddonIds: string[]) => {
      if (!selectedServiceId) return;

      const currentAddons = new Set(currentServiceAddons);
      const newSelectedAddons = new Set(selectedAddonIds);
      const toLink = selectedAddonIds.filter((id) => !currentAddons.has(id));
      const toUnlink = currentServiceAddons.filter(
        (id) => !newSelectedAddons.has(id),
      );

      try {
        await Promise.all([
          ...toLink.map((addonId) =>
            linkAddonMutation.mutateAsync({
              serviceId: selectedServiceId,
              addonId,
            }),
          ),
          ...toUnlink.map((addonId) =>
            unlinkAddonMutation.mutateAsync({
              serviceId: selectedServiceId,
              addonId,
            }),
          ),
        ]);

        toastWithSound.success("Add-ons updated successfully");
      } catch (error) {
        // Errors handled by mutations
      }
    },
    [
      selectedServiceId,
      currentServiceAddons,
      linkAddonMutation,
      unlinkAddonMutation,
    ],
  );

  const handleOpenForm = (service?: Service) => {
    setSelectedServiceId(service?.service_id || null);
    setShowServiceForm(true);
  };

  const handleCloseForm = () => {
    setShowServiceForm(false);
    setSelectedServiceId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Commission Services
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your commission services, styles, and example pictures
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenForm()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Create Service
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.length === 0 ? (
          <div className="col-span-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
            <p className="text-gray-500 dark:text-gray-400">
              No services yet. Create your first commission service!
            </p>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.service_id}
              className="group rounded-lg border border-gray-300 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-gray-600 dark:bg-gray-800"
            >
              {/* Service Header */}
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {service.name}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      service.is_active
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {service.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  ${service.base_price.toFixed(2)}
                </p>
                {service.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {service.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenForm(service)}
                    className="flex-1 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteServiceId(service.service_id);
                      setShowDeleteServiceConfirm(true);
                    }}
                    className="flex-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Service Form */}
      {showServiceForm && (
        <ServiceForm
          service={selectedServiceData || undefined}
          availableAddons={availableAddons}
          onSubmit={
            selectedServiceId ? handleUpdateService : handleCreateService
          }
          onComplete={handleCloseForm}
          onCancel={handleCloseForm}
          onCreateStyle={handleCreateStyle}
          onUpdateStyle={handleUpdateStyle}
          onDeleteStyle={handleDeleteStyle}
          onCreatePicture={handleCreatePicture}
          onUpdatePicture={handleUpdatePicture}
          onDeletePicture={handleDeletePicture}
          onPictureComplete={handlePictureFormComplete}
          onLinkAddons={handleLinkAddons}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteServiceConfirm}
        title="Delete Service"
        message="Are you sure you want to delete this service? This will also delete all associated styles and pictures."
        onConfirm={handleDeleteService}
        onCancel={() => {
          setShowDeleteServiceConfirm(false);
          setDeleteServiceId(null);
        }}
        confirmText="Delete"
        isDangerous
      />

      {/* Style Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteStyleConfirm}
        title="Delete Style"
        message="Are you sure you want to delete this style? This will also delete all associated pictures."
        onConfirm={handleConfirmDeleteStyle}
        onCancel={handleCancelDeleteStyle}
        confirmText="Delete"
        isDangerous
      />

      {/* Picture Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeletePictureConfirm}
        title="Delete Picture"
        message="Are you sure you want to delete this picture?"
        onConfirm={handleConfirmDeletePicture}
        onCancel={handleCancelDeletePicture}
        confirmText="Delete"
        isDangerous
      />
    </div>
  );
}
