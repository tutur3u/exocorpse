"use client";

import { useState } from "react";

export interface ListDetailItem<TId extends string | number, TData> {
  id: TId;
  title: string;
  subtitle?: string;
  data: TData;
}

interface ListDetailProps<TId extends string | number, TData> {
  items: Array<ListDetailItem<TId, TData>>;
  renderDetail: (item: ListDetailItem<TId, TData>) => React.ReactNode;
  emptyDetail?: React.ReactNode;
  initialSelectedId?: TId | null;
  className?: string;
  fullscreen?: boolean;
  indexLayout?: "sidebar" | "grid";
  renderItemCard?: (item: ListDetailItem<TId, TData>) => React.ReactNode;
}

export default function ListDetail<TId extends string | number, TData>({
  items,
  renderDetail,
  emptyDetail,
  initialSelectedId = null,
  className,
  fullscreen = false,
  indexLayout = "sidebar",
  renderItemCard,
}: ListDetailProps<TId, TData>) {
  const [selectedId, setSelectedId] = useState<TId | null>(initialSelectedId);
  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  if (fullscreen && selectedItem) {
    return (
      <div className={`flex h-full flex-col ${className ?? ""}`}>
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <button
            onClick={() => setSelectedId(null)}
            className="rounded bg-gray-100 px-3 py-1.5 text-sm font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            Back
          </button>
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">
              {selectedItem.title}
            </div>
            {selectedItem.subtitle ? (
              <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                {selectedItem.subtitle}
              </div>
            ) : null}
          </div>
        </div>
        <div className="min-w-0 flex-1 overflow-auto p-6">
          {renderDetail(selectedItem)}
        </div>
      </div>
    );
  }

  if (indexLayout === "grid") {
    return (
      <div className={`flex h-full flex-col ${className ?? ""}`}>
        <div className="min-w-0 flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <button
                key={String(item.id)}
                onClick={() => setSelectedId(item.id)}
                className="group rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                {renderItemCard ? (
                  renderItemCard(item)
                ) : (
                  <>
                    <div className="mb-1 text-base font-semibold group-hover:text-blue-600">
                      {item.title}
                    </div>
                    {item.subtitle ? (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.subtitle}
                      </div>
                    ) : null}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
        {fullscreen ? null : <div className="hidden" aria-hidden />}
      </div>
    );
  }

  return (
    <div className={`flex h-full overflow-hidden ${className ?? ""}`}>
      <div className="w-64 shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {items.map((item) => {
            const isActive = item.id === selectedId;
            return (
              <li key={String(item.id)}>
                <button
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="font-medium">{item.title}</div>
                  {item.subtitle ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.subtitle}
                    </div>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="min-w-0 flex-1 overflow-auto p-6">
        {selectedItem
          ? renderDetail(selectedItem)
          : (emptyDetail ?? (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Select an item to view details.
              </div>
            ))}
      </div>
    </div>
  );
}
