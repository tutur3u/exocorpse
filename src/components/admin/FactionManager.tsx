import type { Character, Faction } from "@/lib/actions/wiki";
import { useState } from "react";

export type FactionMembership = {
  id: string;
  character_id: string;
  faction_id: string;
  role: string | null;
  rank: string | null;
  is_current: boolean | null;
  factions?: Faction;
  characters?: Character;
};

type FactionManagerProps = {
  type: "character" | "faction";
  entityId: string;
  entityName: string;
  availableEntities: (Character | Faction)[];
  memberships: FactionMembership[];
  onAdd: (targetId: string, role?: string) => Promise<void>;
  onRemove: (membershipId: string) => Promise<void>;
  onClose: () => void;
};

export default function FactionManager({
  type,
  entityName,
  availableEntities,
  memberships,
  onAdd,
  onRemove,
  onClose,
}: FactionManagerProps) {
  const [selectedId, setSelectedId] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const memberIds = new Set(
    memberships.map((m) =>
      type === "character" ? m.faction_id : m.character_id,
    ),
  );

  const availableToAdd = availableEntities.filter((e) => !memberIds.has(e.id));

  const handleAdd = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      await onAdd(selectedId, role || undefined);
      setSelectedId("");
      setRole("");
    } catch (err) {
      console.error("Error adding:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-opacity-50 animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={onClose}
    >
      <div
        className="animate-slideUp max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-2xl font-bold">
          {type === "character"
            ? `Manage Factions for ${entityName}`
            : `Manage Members of ${entityName}`}
        </h2>

        {/* Current Memberships */}
        <div className="mb-6">
          <h3 className="mb-2 text-lg font-semibold">
            Current {type === "character" ? "Factions" : "Members"}
          </h3>
          {memberships.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No {type === "character" ? "factions" : "members"} yet.
            </p>
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
                    className="flex items-center justify-between rounded border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <div>
                      <div className="font-medium">{entity.name}</div>
                      {membership.role && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Role: {membership.role}
                        </div>
                      )}
                      {membership.rank && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Rank: {membership.rank}
                        </div>
                      )}
                      {membership.is_current !== null && (
                        <div className="text-xs text-gray-500">
                          {membership.is_current ? "Current" : "Former"}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onRemove(membership.id)}
                      className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add New */}
        {availableToAdd.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">
              Add {type === "character" ? "Faction" : "Member"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {type === "character" ? "Select Faction" : "Select Character"}
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
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

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Role (optional)
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Agent, Commander, Member"
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={!selectedId || loading}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
