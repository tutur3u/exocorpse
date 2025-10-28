"use client";

import AddonForm from "@/components/admin/forms/AddonForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  createAddon,
  deleteAddon,
  getAllAddons,
  updateAddon,
  type Addon,
} from "@/lib/actions/commissions";
import toastWithSound from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

type AddonsClientProps = {
  initialAddons: Addon[];
};

export default function AddonsClient({ initialAddons }: AddonsClientProps) {
  const queryClient = useQueryClient();

  const [showAddonForm, setShowAddonForm] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteAddonId, setDeleteAddonId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "exclusive" | "shared">(
    "all",
  );

  // Query addons
  const { data: addons = initialAddons } = useQuery({
    queryKey: ["admin-addons"],
    queryFn: getAllAddons,
    initialData: initialAddons,
  });

  // MUTATIONS
  const createAddonMutation = useMutation({
    mutationFn: createAddon,
    onSuccess: () => {
      toastWithSound.success("Add-on created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-addons"] });
      setShowAddonForm(false);
    },
    onError: () => {
      toastWithSound.error("Failed to create add-on");
    },
  });

  const updateAddonMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof updateAddon>[1];
    }) => updateAddon(id, updates),
    onSuccess: () => {
      toastWithSound.success("Add-on updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-addons"] });
      setShowAddonForm(false);
      setEditingAddon(null);
    },
    onError: () => {
      toastWithSound.error("Failed to update add-on");
    },
  });

  const deleteAddonMutation = useMutation({
    mutationFn: deleteAddon,
    onSuccess: () => {
      toastWithSound.success("Add-on deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-addons"] });
      setShowDeleteConfirm(false);
      setDeleteAddonId(null);
    },
    onError: (error: Error) => {
      toastWithSound.error(error.message || "Failed to delete add-on");
    },
  });

  // HANDLERS
  const handleCreateAddon = useCallback(
    async (data: Parameters<typeof createAddon>[0]) => {
      return createAddonMutation.mutateAsync(data);
    },
    [createAddonMutation],
  );

  const handleUpdateAddon = useCallback(
    async (data: Parameters<typeof createAddon>[0]) => {
      if (!editingAddon) return;
      return updateAddonMutation.mutateAsync({
        id: editingAddon.addon_id,
        updates: data,
      });
    },
    [editingAddon, updateAddonMutation],
  );

  const handleDeleteAddon = useCallback(() => {
    if (deleteAddonId) {
      deleteAddonMutation.mutate(deleteAddonId);
    }
  }, [deleteAddonId, deleteAddonMutation]);

  // Filter addons
  const filteredAddons = addons.filter((addon) => {
    const matchesSearch =
      addon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addon.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" ||
      (filterType === "exclusive" && addon.is_exclusive) ||
      (filterType === "shared" && !addon.is_exclusive);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Commission Add-ons
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage add-ons that can be linked to commission services
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAddon(null);
            setShowAddonForm(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Create Add-on
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <input
          type="text"
          placeholder="Search add-ons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as typeof filterType)}
          className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        >
          <option value="all">All Add-ons</option>
          <option value="exclusive">Exclusive Only</option>
          <option value="shared">Shared Only</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-300 p-4 dark:border-gray-600 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Add-ons
          </p>
          <p className="mt-1 text-2xl font-bold">{addons.length}</p>
        </div>
        <div className="rounded-lg border border-gray-300 p-4 dark:border-gray-600 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Exclusive Add-ons
          </p>
          <p className="mt-1 text-2xl font-bold">
            {addons.filter((a) => a.is_exclusive).length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-300 p-4 dark:border-gray-600 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Shared Add-ons
          </p>
          <p className="mt-1 text-2xl font-bold">
            {addons.filter((a) => !a.is_exclusive).length}
          </p>
        </div>
      </div>

      {/* Addons Grid */}
      {filteredAddons.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterType !== "all"
              ? "No add-ons match your filters"
              : "No add-ons yet. Create your first add-on!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAddons.map((addon) => (
            <div
              key={addon.addon_id}
              className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {addon.name}
                  </h3>
                  <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">
                    +${addon.price_impact.toFixed(2)}
                  </p>
                </div>
                {addon.is_exclusive && (
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Exclusive
                  </span>
                )}
              </div>

              {addon.description && (
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  {addon.description}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingAddon(addon);
                    setShowAddonForm(true);
                  }}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setDeleteAddonId(addon.addon_id);
                    setShowDeleteConfirm(true);
                  }}
                  className="flex-1 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Addon Form */}
      {showAddonForm && (
        <AddonForm
          addon={editingAddon || undefined}
          onSubmit={editingAddon ? handleUpdateAddon : handleCreateAddon}
          onComplete={() => {
            setShowAddonForm(false);
            setEditingAddon(null);
          }}
          onCancel={() => {
            setShowAddonForm(false);
            setEditingAddon(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Add-on"
        message="Are you sure you want to delete this add-on? If it's linked to any services, those links will be removed."
        onConfirm={handleDeleteAddon}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteAddonId(null);
        }}
        confirmText="Delete"
        isDangerous
      />
    </div>
  );
}
