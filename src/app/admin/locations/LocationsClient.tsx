"use client";

import LocationForm from "@/components/admin/forms/LocationForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import StorageImage from "@/components/shared/StorageImage";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import {
  createLocation,
  deleteLocation,
  getAllLocations,
  getAllWorlds,
  type Location,
  updateLocation,
  type World,
} from "@/lib/actions/wiki";
import toastWithSound from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

interface LocationsClientProps {
  initialWorlds: World[];
  initialLocations: Location[];
}

export default function LocationsClient({
  initialWorlds,
  initialLocations,
}: LocationsClientProps) {
  const queryClient = useQueryClient();
  const [selectedWorldId, setSelectedWorldId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  // Confirm dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: worlds = [] } = useQuery({
    queryKey: ["worlds"],
    queryFn: getAllWorlds,
    initialData: initialWorlds,
  });

  const { data: allLocations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: getAllLocations,
    initialData: initialLocations,
  });

  // Filter locations by selected world (client-side)
  const locations = useMemo(() => {
    if (!selectedWorldId) return allLocations;
    return allLocations.filter((loc) => loc.world_id === selectedWorldId);
  }, [allLocations, selectedWorldId]);

  // Batch fetch all location images for optimal performance
  // Only fetch signed URLs for storage paths (non-HTTP URLs)
  const locationImagePaths = locations
    .map((l) => l.image_url)
    .filter((p): p is string => !!p && !p.startsWith("http"));
  const { signedUrls: locationImageUrls } =
    useBatchStorageUrls(locationImagePaths);

  const createMutation = useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      // Don't close form here - onComplete will handle it after uploads finish
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: (error) => {
      toastWithSound.error(`Failed to create location: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateLocation>[1];
    }) => updateLocation(id, data),
    onSuccess: () => {
      // Don't close form here - onComplete will handle it after uploads finish
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: (error) => {
      toastWithSound.error(`Failed to update location: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toastWithSound.success("Location deleted successfully!");
    },
    onError: (error) => {
      toastWithSound.error(`Failed to delete location: ${error.message}`);
    },
  });

  const handleCreate = async (data: Parameters<typeof createLocation>[0]) => {
    const newLocation = await createMutation.mutateAsync(data);
    return newLocation;
  };

  const handleUpdate = async (data: Parameters<typeof updateLocation>[1]) => {
    if (!editingLocation) return undefined;
    const updated = await updateMutation.mutateAsync({
      id: editingLocation.id,
      data,
    });
    return updated || undefined;
  };

  const handleComplete = () => {
    // Refresh to show uploaded images
    queryClient.invalidateQueries({ queryKey: ["locations"] });
    setShowForm(false);
    setEditingLocation(null);
    toastWithSound.success(
      editingLocation
        ? "Location updated successfully!"
        : "Location created successfully!",
    );
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
    setShowDeleteConfirm(true);
  };

  const selectedWorld = worlds.find((w) => w.id === selectedWorldId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Locations
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage locations within your worlds
          </p>
        </div>
        <button
          onClick={() => {
            setEditingLocation(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-linear-to-r from-amber-600 to-orange-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          + New Location
        </button>
      </div>

      {/* World Filter */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter by World
        </label>
        <select
          value={selectedWorldId}
          onChange={(e) => setSelectedWorldId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Locations</option>
          {worlds.map((world) => (
            <option key={world.id} value={world.id}>
              {world.name}
            </option>
          ))}
        </select>
      </div>

      {locations.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
            <svg
              className="h-8 w-8 text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {selectedWorldId
              ? `No locations in ${selectedWorld?.name}`
              : "No locations yet"}
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {selectedWorldId
              ? "Create your first location for this world"
              : "Select a world and create your first location"}
          </p>
          {selectedWorldId && (
            <button
              onClick={() => {
                setEditingLocation(null);
                setShowForm(true);
              }}
              className="rounded-lg bg-linear-to-r from-amber-600 to-orange-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Create Your First Location
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <div
              key={location.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Cover Image / Gradient */}
              <div className="relative h-48 overflow-hidden bg-linear-to-br from-amber-400 via-orange-400 to-red-400">
                {location.image_url ? (
                  <>
                    <StorageImage
                      src={location.image_url}
                      signedUrl={locationImageUrls.get(location.image_url)}
                      alt={location.name}
                      width={400}
                      height={192}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="mb-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                  {location.name}
                </h4>
                {location.summary && (
                  <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                    {location.summary}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingLocation(location);
                      setShowForm(true);
                    }}
                    className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="flex-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <LocationForm
          location={editingLocation || undefined}
          worldId={editingLocation?.world_id || selectedWorldId}
          availableWorlds={worlds}
          availableLocations={allLocations}
          onSubmit={editingLocation ? handleUpdate : handleCreate}
          onComplete={handleComplete}
          onCancel={() => {
            setShowForm(false);
            setEditingLocation(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Location"
        message="Are you sure you want to delete this location? This action cannot be undone."
        onConfirm={async () => {
          if (deleteConfirmId) {
            await deleteMutation.mutateAsync(deleteConfirmId);
            setShowDeleteConfirm(false);
            setDeleteConfirmId(null);
          }
        }}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteConfirmId(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
