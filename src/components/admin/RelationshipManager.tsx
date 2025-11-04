"use client";

import { useStorageUrl } from "@/hooks/useStorageUrl";
import type { Character, RelationshipType } from "@/lib/actions/wiki";
import Image from "next/image";
import { useEffect, useState } from "react";

export interface CharacterRelationshipWithDetails {
  id: string;
  character_a_id: string;
  character_b_id: string;
  relationship_type_id: string;
  description: string | null;
  is_mutual: boolean | null;
  character_a: {
    id: string;
    name: string;
    profile_image: string | null;
  };
  character_b: {
    id: string;
    name: string;
    profile_image: string | null;
  };
  relationship_type: RelationshipType;
}

interface RelationshipManagerProps {
  characterId: string;
  characterName: string;
  relationships: CharacterRelationshipWithDetails[];
  availableCharacters: Character[];
  relationshipTypes: RelationshipType[];
  onAdd: (data: {
    relatedCharacterId: string;
    relationshipTypeId: string;
    description?: string;
    isMutual?: boolean;
  }) => Promise<void>;
  onUpdate: (
    relationshipId: string,
    data: {
      relationshipTypeId?: string;
      description?: string;
      isMutual?: boolean;
    },
  ) => Promise<void>;
  onDelete: (relationshipId: string) => Promise<void>;
  onClose: () => void;
}

interface RelationshipCardProps {
  relationship: CharacterRelationshipWithDetails;
  currentCharacterId: string;
  onEdit: () => void;
  onDelete: () => void;
}

function RelationshipCard({
  relationship,
  currentCharacterId,
  onEdit,
  onDelete,
}: RelationshipCardProps) {
  // Determine which character is the "other" character
  const isCharacterA = relationship.character_a_id === currentCharacterId;
  const otherCharacter = isCharacterA
    ? relationship.character_b
    : relationship.character_a;

  const { signedUrl: profileUrl } = useStorageUrl(otherCharacter.profile_image);

  // Determine relationship label
  const relationshipLabel = isCharacterA
    ? relationship.relationship_type.name
    : relationship.relationship_type.reverse_name ||
      relationship.relationship_type.name;

  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start gap-3">
        {/* Profile Image */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          {profileUrl ? (
            <Image
              src={profileUrl}
              alt={otherCharacter.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Relationship Info */}
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-medium text-gray-900 dark:text-gray-100">
            {otherCharacter.name}
          </h4>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
              style={{
                backgroundColor: relationship.relationship_type.color
                  ? `${relationship.relationship_type.color}20`
                  : "#e5e7eb",
                color: relationship.relationship_type.color || "#374151",
              }}
            >
              {relationshipLabel}
            </span>
            {relationship.is_mutual && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                (mutual)
              </span>
            )}
          </div>
          {relationship.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {relationship.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            className="rounded p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            title="Edit relationship"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            title="Delete relationship"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RelationshipManager({
  characterId,
  characterName,
  relationships,
  availableCharacters,
  relationshipTypes,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}: RelationshipManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingRelationship, setEditingRelationship] =
    useState<CharacterRelationshipWithDetails | null>(null);

  // Form state
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [isMutual, setIsMutual] = useState(true);
  const [loading, setLoading] = useState(false);

  // Reset form when showing/hiding or switching between add/edit
  useEffect(() => {
    if (showForm && editingRelationship) {
      // Editing mode
      const isCharacterA = editingRelationship.character_a_id === characterId;
      const otherCharacterId = isCharacterA
        ? editingRelationship.character_b_id
        : editingRelationship.character_a_id;

      setSelectedCharacterId(otherCharacterId);
      setSelectedTypeId(editingRelationship.relationship_type_id);
      setDescription(editingRelationship.description || "");
      setIsMutual(editingRelationship.is_mutual ?? true);
    } else if (showForm) {
      // Adding mode
      setSelectedCharacterId("");
      setSelectedTypeId("");
      setDescription("");
      setIsMutual(true);
    }
  }, [showForm, editingRelationship, characterId]);

  // Check if a relationship already exists with the selected character and type
  // This enforces the database constraint: UNIQUE(character_a_id, character_b_id, relationship_type_id)
  const isDuplicateRelationship = () => {
    if (!selectedCharacterId || !selectedTypeId) return false;
    if (editingRelationship) return false; // Skip check when editing

    return relationships.some((rel) => {
      // Check if this exact combination already exists
      const matchesAsCharacterA =
        rel.character_a_id === characterId &&
        rel.character_b_id === selectedCharacterId &&
        rel.relationship_type_id === selectedTypeId;

      const matchesAsCharacterB =
        rel.character_b_id === characterId &&
        rel.character_a_id === selectedCharacterId &&
        rel.relationship_type_id === selectedTypeId;

      return matchesAsCharacterA || matchesAsCharacterB;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCharacterId || !selectedTypeId) return;

    // Double-check for duplicates (button should already be disabled, but this is a safety check)
    if (isDuplicateRelationship()) {
      return;
    }

    setLoading(true);
    try {
      if (editingRelationship) {
        await onUpdate(editingRelationship.id, {
          relationshipTypeId: selectedTypeId,
          description: description || undefined,
          isMutual,
        });
      } else {
        await onAdd({
          relatedCharacterId: selectedCharacterId,
          relationshipTypeId: selectedTypeId,
          description: description || undefined,
          isMutual,
        });
      }
      setShowForm(false);
      setEditingRelationship(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (relationship: CharacterRelationshipWithDetails) => {
    setEditingRelationship(relationship);
    setShowForm(true);
  };

  const handleDelete = async (relationshipId: string) => {
    if (!confirm("Are you sure you want to delete this relationship?")) {
      return;
    }
    await onDelete(relationshipId);
  };

  const handleBackdropClick = () => {
    onClose();
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="button"
      tabIndex={0}
      aria-label="Close relationship manager"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
    >
      <div
        className="animate-slideUp flex h-full max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="relationship-manager-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2
            id="relationship-manager-title"
            className="text-2xl font-bold text-gray-900 dark:text-gray-100"
          >
            Manage Relationships - {characterName}
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Add and manage character relationships
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Add Button */}
          {!showForm && (
            <button
              type="button"
              onClick={() => {
                setEditingRelationship(null);
                setShowForm(true);
              }}
              className="mb-4 w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-purple-400 hover:text-purple-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-purple-500 dark:hover:text-purple-400"
            >
              + Add Relationship
            </button>
          )}

          {/* Add/Edit Form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-900/30 dark:bg-purple-900/10"
            >
              <h3 className="mb-3 font-medium text-gray-900 dark:text-gray-100">
                {editingRelationship
                  ? "Edit Relationship"
                  : "Add New Relationship"}
              </h3>

              <div className="space-y-3">
                {/* Character Selection */}
                <div>
                  <label
                    htmlFor="character-select"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Character *
                  </label>
                  <select
                    id="character-select"
                    value={selectedCharacterId}
                    onChange={(e) => setSelectedCharacterId(e.target.value)}
                    disabled={!!editingRelationship}
                    required
                    className="w-full rounded border border-gray-300 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <option value="">Select a character...</option>
                    {availableCharacters.map((char) => (
                      <option key={char.id} value={char.id}>
                        {char.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Relationship Type */}
                <div>
                  <label
                    htmlFor="type-select"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Relationship Type *
                  </label>
                  <select
                    id="type-select"
                    value={selectedTypeId}
                    onChange={(e) => setSelectedTypeId(e.target.value)}
                    required
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <option value="">Select a type...</option>
                    {relationshipTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                        {type.category ? ` (${type.category})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description-input"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Description
                  </label>
                  <textarea
                    id="description-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Optional notes about this relationship..."
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>

                {/* Is Mutual */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="mutual-checkbox"
                    checked={isMutual}
                    onChange={(e) => setIsMutual(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label
                    htmlFor="mutual-checkbox"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Mutual relationship (shows for both characters)
                  </label>
                </div>

                {/* Duplicate Relationship Warning */}
                {isDuplicateRelationship() && (
                  <div className="rounded-lg border border-red-300 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                    <div className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                          Duplicate Relationship
                        </h4>
                        <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                          This relationship already exists between these
                          characters with this type.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !selectedCharacterId ||
                      !selectedTypeId ||
                      isDuplicateRelationship()
                    }
                    className="flex-1 rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Saving..."
                      : editingRelationship
                        ? "Update"
                        : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingRelationship(null);
                    }}
                    disabled={loading}
                    className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Relationships List */}
          <div className="space-y-3">
            {relationships.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 py-12 text-center dark:border-gray-600">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No relationships yet
                </p>
              </div>
            ) : (
              relationships.map((relationship) => (
                <RelationshipCard
                  key={relationship.id}
                  relationship={relationship}
                  currentCharacterId={characterId}
                  onEdit={() => handleEdit(relationship)}
                  onDelete={() => handleDelete(relationship.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
