import ListDetail, { type ListDetailItem } from "@/components/ListDetail";
import { type World } from "@/lib/actions/wiki";

type WorldsViewProps = {
  worlds: World[];
  onWorldSelect: (world: World) => void;
};

export default function WorldsView({ worlds, onWorldSelect }: WorldsViewProps) {
  const worldItems: Array<ListDetailItem<string, World>> = worlds.map(
    (world) => ({
      id: world.id,
      title: world.name,
      subtitle: world.summary || undefined,
      data: world,
    }),
  );

  return (
    <div className="h-[calc(100%-3rem)] overflow-hidden">
      <ListDetail
        items={worldItems}
        fullscreen
        indexLayout="grid"
        renderItemCard={(item) => (
          <div
            onClick={() => onWorldSelect(item.data)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Decorative Header */}
            <div className="relative h-24 overflow-hidden bg-gradient-to-br from-indigo-400 via-cyan-400 to-teal-400">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-4">
              <h4 className="mb-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-400">
                {item.title}
              </h4>
              {item.subtitle && (
                <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                  {item.subtitle}
                </p>
              )}
            </div>

            {/* Hover Overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        )}
        renderDetail={(item) => (
          <div className="space-y-6">
            {/* Description */}
            {item.data.description && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Description
                </h4>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {item.data.description}
                </p>
              </div>
            )}

            {/* Action */}
            <div className="flex gap-2">
              <button
                onClick={() => onWorldSelect(item.data)}
                className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                View Content
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
}
