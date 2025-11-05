import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import type { Character, Faction } from "@/lib/actions/wiki";
import { useState } from "react";
import { useForm } from "react-hook-form";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

export type FactionMembership = {
  id: string;
  character_id: string;
  faction_id: string;
  role: string | null;
  rank: string | null;
  join_date: string | null;
  leave_date: string | null;
  is_current: boolean | null;
  notes: string | null;
  factions?: Faction;
  characters?: Character;
};

interface FactionFormData {
  selectedId: string;
  role: string;
  rank: string;
  joinDate: string;
  leaveDate: string;
  notes: string;
}

export interface MembershipUpdate {
  role?: string;
  rank?: string;
  join_date?: string;
  leave_date?: string;
  notes?: string;
}

export interface FactionManagerProps {
  type: "character" | "faction";
  entityId: string;
  entityName: string;
  availableEntities: (Character | Faction)[];
  memberships: FactionMembership[];
  onAdd: (targetId: string, updates: MembershipUpdate) => Promise<void>;
  onEdit: (membershipId: string, updates: MembershipUpdate) => Promise<void>;
  onRemove: (membershipId: string) => Promise<void>;
  onClose: () => void;
}

export default function FactionManager({
  type,
  entityName,
  availableEntities,
  memberships,
  onAdd,
  onEdit,
  onRemove,
  onClose,
}: FactionManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<FactionFormData>({
    defaultValues: {
      selectedId: "",
      role: "",
      rank: "",
      joinDate: "",
      leaveDate: "",
      notes: "",
    },
  });

  const { register, handleSubmit: formHandleSubmit, watch, reset } = form;
  const { handleExit, showConfirmDialog, confirmExit, cancelExit } =
    useFormDirtyState(form);

  const selectedId = watch("selectedId");

  const memberIds = new Set(
    memberships.map((m) =>
      type === "character" ? m.faction_id : m.character_id,
    ),
  );

  const availableToAdd = availableEntities.filter((e) => !memberIds.has(e.id));

  const handleFormSubmit = formHandleSubmit(async (data) => {
    // Only require selectedId when adding a new membership (not when editing)
    if (!editingId && !data.selectedId) return;

    setLoading(true);
    try {
      if (editingId) {
        // Update existing membership with all fields
        // Always send fields as-is to preserve empty string updates (which become null)
        await onEdit(editingId, {
          role: data.role,
          rank: data.rank,
          join_date: data.joinDate,
          leave_date: data.leaveDate,
          notes: data.notes,
        });
      } else {
        // Add new membership
        await onAdd(data.selectedId, {
          role: data.role,
          rank: data.rank,
          join_date: data.joinDate,
          leave_date: data.leaveDate,
          notes: data.notes,
        });
      }
      setShowForm(false);
      setEditingId(null);
      reset();
    } finally {
      setLoading(false);
    }
  });

  const handleDelete = async (membershipId: string) => {
    setLoading(true);
    try {
      await onRemove(membershipId);
      setDeleteConfirmId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMembership = () => {
    setEditingId(null);
    reset({
      selectedId: "",
      role: "",
      rank: "",
      joinDate: "",
      leaveDate: "",
      notes: "",
    });
    setShowForm(true);
  };

  const handleEditMembership = (membership: FactionMembership) => {
    setEditingId(membership.id);
    reset({
      selectedId: "",
      role: membership.role || "",
      rank: membership.rank || "",
      joinDate: membership.join_date || "",
      leaveDate: membership.leave_date || "",
      notes: membership.notes || "",
    });
    setShowForm(true);
  };

  const handleFormCancel = () => {
    handleExit(() => {
      setShowForm(false);
      setEditingId(null);
      reset();
    });
  };

  const handleBackdropClick = () => {
    handleExit(onClose);
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleExit(onClose);
    }
  };

  return (
    <>
      <div
        className="bg-opacity-50 animate-fadeIn fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black p-4"
        role="button"
        tabIndex={0}
        aria-label="Close faction manager"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
      >
        <div
          className="animate-slideUp flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800"
          role="dialog"
          aria-modal="true"
          aria-labelledby="faction-manager-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="shrink-0 px-6 pt-6 pb-4">
            <h2
              id="faction-manager-title"
              className="text-2xl font-bold text-gray-900 dark:text-gray-100"
            >
              {type === "character"
                ? `Manage Factions for ${entityName}`
                : `Manage Members of ${entityName}`}
            </h2>
          </div>

          {/* Content Area */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Add Button */}
              {!showForm && availableToAdd.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddMembership}
                  className="mb-4 w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
                >
                  + Add {type === "character" ? "Faction" : "Member"}
                </button>
              )}

              {/* Add/Edit Form */}
              {showForm && (
                <form
                  onSubmit={handleFormSubmit}
                  className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10"
                >
                  <h3 className="mb-3 font-medium text-gray-900 dark:text-gray-100">
                    {editingId ? "Edit Membership" : "Add"}{" "}
                    {type === "character" ? "Faction" : "Member"}
                  </h3>

                  <div className="space-y-3">
                    {/* Entity Selection - only show when adding */}
                    {!editingId && (
                      <div>
                        <label
                          htmlFor="entity-select"
                          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          {type === "character"
                            ? "Select Faction"
                            : "Select Character"}{" "}
                          *
                        </label>
                        <select
                          id="entity-select"
                          {...register("selectedId", {
                            required: `Please select a ${type === "character" ? "faction" : "character"}`,
                          })}
                          className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        >
                          <option value="">-- Select --</option>
                          {availableToAdd.map((entity) => (
                            <option key={entity.id} value={entity.id}>
                              {entity.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Role */}
                    <div>
                      <label
                        htmlFor="role-input"
                        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Role
                      </label>
                      <input
                        type="text"
                        id="role-input"
                        {...register("role")}
                        placeholder="e.g., Agent, Commander, Member"
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>

                    {/* Rank */}
                    <div>
                      <label
                        htmlFor="rank-input"
                        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Rank
                      </label>
                      <input
                        type="text"
                        id="rank-input"
                        {...register("rank")}
                        placeholder="e.g., Lieutenant, Captain, General"
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>

                    {/* Join Date */}
                    <div>
                      <label
                        htmlFor="join-date-input"
                        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Join Date
                      </label>
                      <input
                        type="text"
                        id="join-date-input"
                        {...register("joinDate")}
                        placeholder="e.g., Year 5, Spring 2024"
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>

                    {/* Leave Date */}
                    <div>
                      <label
                        htmlFor="leave-date-input"
                        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Leave Date
                      </label>
                      <input
                        type="text"
                        id="leave-date-input"
                        {...register("leaveDate")}
                        placeholder="e.g., Year 10, Winter 2030"
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label
                        htmlFor="notes-input"
                        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Notes
                      </label>
                      <textarea
                        id="notes-input"
                        {...register("notes")}
                        placeholder="Additional information about the membership..."
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        rows={3}
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={loading || (!editingId && !selectedId)}
                        className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        {loading
                          ? editingId
                            ? "Saving..."
                            : "Adding..."
                          : editingId
                            ? "Update"
                            : "Add"}
                      </button>
                      <button
                        type="button"
                        onClick={handleFormCancel}
                        disabled={loading}
                        className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Current Memberships */}
              <div>
                <h3 className="mb-3 font-medium text-gray-900 dark:text-gray-100">
                  Current {type === "character" ? "Factions" : "Members"}
                </h3>

                {memberships.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 py-8 text-center dark:border-gray-600">
                    <svg
                      className="mx-auto h-8 w-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      No {type === "character" ? "factions" : "members"} yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {memberships.map((membership) => {
                      const entity =
                        type === "character"
                          ? membership.factions
                          : membership.characters;
                      if (!entity) return null;

                      return (
                        <div
                          key={membership.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {entity.name}
                            </div>
                            <div className="mt-2 space-y-2">
                              <div className="flex flex-wrap gap-2">
                                {membership.role && (
                                  <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                                    Role: {membership.role}
                                  </span>
                                )}
                                {membership.rank && (
                                  <span className="inline-block rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                                    {membership.rank}
                                  </span>
                                )}
                                {membership.is_current !== null && (
                                  <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                    {membership.is_current
                                      ? "Current"
                                      : "Former"}
                                  </span>
                                )}
                              </div>
                              {(membership.join_date ||
                                membership.leave_date) && (
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {membership.join_date && (
                                    <span>Joined: {membership.join_date}</span>
                                  )}
                                  {membership.join_date &&
                                    membership.leave_date && <span> • </span>}
                                  {membership.leave_date && (
                                    <span>Left: {membership.leave_date}</span>
                                  )}
                                </div>
                              )}
                              {membership.notes && (
                                <div className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                                  <span className="font-medium">Notes:</span>{" "}
                                  {membership.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-2 flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditMembership(membership)}
                              className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(membership.id)}
                              className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 justify-end gap-2 border-t border-gray-300 px-6 py-4 dark:border-gray-600">
              <button
                type="button"
                onClick={() => handleExit(onClose)}
                className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmExitDialog
        isOpen={showConfirmDialog}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />

      <ConfirmDeleteDialog
        isOpen={!!deleteConfirmId}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
        loading={loading}
      />
    </>
  );
}
