"use client";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  addBlacklistedUser,
  getBlacklistedUsersPaginated,
  removeBlacklistedUser,
  updateBlacklistedUser,
  type BlacklistedUser,
} from "@/lib/actions/blacklist";
import toastWithSound from "@/lib/toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import BlacklistForm from "./BlacklistForm";

const PAGE_SIZE = 10;

type BlacklistClientProps = {
  initialUsers: BlacklistedUser[];
  initialTotal: number;
};

export default function BlacklistClient({
  initialUsers,
  initialTotal,
}: BlacklistClientProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<BlacklistedUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch blacklisted users with react-query
  const { data, isLoading } = useQuery({
    queryKey: ["blacklistedUsers", page],
    queryFn: () => getBlacklistedUsersPaginated(page, PAGE_SIZE),
    // Use initial data for first page
    initialData:
      page === 1
        ? {
            data: initialUsers,
            total: initialTotal,
            page: 1,
            pageSize: PAGE_SIZE,
          }
        : undefined,
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
  });

  const users = data?.data || [];
  const total = data?.total || 0;

  const handleAddUser = useCallback(
    async (formData: { username: string; reasoning?: string }) => {
      try {
        await addBlacklistedUser(formData);
        toastWithSound.success(`Added "${formData.username}" to blacklist`);
        setShowForm(false);
        setPage(1);
        // Invalidate and refetch the first page
        await queryClient.invalidateQueries({ queryKey: ["blacklistedUsers"] });
      } catch (error) {
        console.error("Error adding user:", error);
        toastWithSound.error("Failed to add user to blacklist");
      }
    },
    [queryClient],
  );

  const handleUpdateUser = useCallback(
    async (id: string, formData: { username: string; reasoning?: string }) => {
      try {
        await updateBlacklistedUser(id, formData);
        toastWithSound.success("Blacklist entry updated");
        setEditingUser(null);
        setShowForm(false);
        // Invalidate current page data
        await queryClient.invalidateQueries({
          queryKey: ["blacklistedUsers", page],
        });
      } catch (error) {
        console.error("Error updating user:", error);
        toastWithSound.error("Failed to update blacklist entry");
      }
    },
    [queryClient, page],
  );

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
    setShowDeleteConfirm(true);
  };

  const handleRemoveUser = useCallback(
    async (id: string) => {
      try {
        await removeBlacklistedUser(id);
        toastWithSound.success("User removed from blacklist");
        // Invalidate all pages
        await queryClient.invalidateQueries({ queryKey: ["blacklistedUsers"] });
      } catch (error) {
        console.error("Error removing user:", error);
        toastWithSound.error("Failed to remove user from blacklist");
      }
    },
    [queryClient],
  );

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Blacklist Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage blacklisted users and their reasons
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
        >
          + Add to Blacklist
        </button>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Username
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Added
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No blacklisted users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.reasoning || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.timestamp
                      ? new Date(user.timestamp).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setShowForm(true);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user.id)}
                        className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(page * PAGE_SIZE, total)} of {total}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
            >
              Previous
            </button>
            <span className="flex items-center px-2 text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <BlacklistForm
          user={editingUser}
          onSubmit={async (data: { username: string; reasoning?: string }) =>
            editingUser
              ? await handleUpdateUser(editingUser.id, data)
              : await handleAddUser(data)
          }
          onCancel={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Remove from Blacklist"
        message="Are you sure you want to remove this user from the blacklist? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={async () => {
          try {
            if (deleteConfirmId) {
              await handleRemoveUser(deleteConfirmId);
            }
          } finally {
            setShowDeleteConfirm(false);
            setDeleteConfirmId(null);
          }
        }}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteConfirmId(null);
        }}
      />
    </div>
  );
}
