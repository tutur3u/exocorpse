"use client";
import type { ExocorpseCmsEntry } from "@/types/exocorpse-cms";
import { isJsonRecord } from "./editor-utils";

export default function CmsRelationshipTypesGallery({
  entries,
  onCreate,
  onSelect,
  onDelete,
}: {
  entries: ExocorpseCmsEntry[];
  onCreate: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relationship Types</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage the types of relationships between characters
          </p>
        </div>
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          onClick={onCreate}
          type="button"
        >
          + Add Relationship Type
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            <tr>
              {["Name", "Description", "Mutual", "Reverse Name", "Actions"].map(
                (label) => (
                  <th className="px-6 py-3 font-medium" key={label}>
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {entries.length ? (
              entries.map((entry) => {
                const profile = isJsonRecord(entry.profile_data)
                  ? entry.profile_data
                  : {};
                return (
                  <tr
                    className="border-t border-gray-200 dark:border-gray-700"
                    key={entry.id}
                  >
                    <td className="px-6 py-4 font-medium">{entry.title}</td>
                    <td className="px-6 py-4">{entry.summary ?? "—"}</td>
                    <td className="px-6 py-4">
                      {profile.isMutual ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-4">
                      {typeof profile.reverseName === "string"
                        ? profile.reverseName
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          className="text-blue-600 hover:underline dark:text-blue-400"
                          onClick={() => onSelect(entry.id)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:underline dark:text-red-400"
                          onClick={() => onDelete(entry.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  className="px-6 py-12 text-center text-gray-500"
                  colSpan={5}
                >
                  No relationship types yet. Create one to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
