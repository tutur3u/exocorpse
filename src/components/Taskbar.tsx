"use client";

import { useWindows } from "@/contexts/WindowContext";
import type { AppId } from "@/types/window";

export default function Taskbar() {
  const { appConfigs, windows, openWindow, restoreWindow, focusWindow } =
    useWindows();

  const handleTaskbarClick = (id: AppId) => {
    const window = windows.find((w) => w.id === id);

    if (!window) {
      // Window is not open, so open it
      openWindow(id);
    } else if (window.state === "minimized") {
      // Window is minimized, restore it
      restoreWindow(id);
    } else {
      // Window is open and visible, focus it
      focusWindow(id);
    }
  };

  const isWindowOpen = (id: AppId) => {
    return windows.some((w) => w.id === id);
  };

  const isWindowMinimized = (id: AppId) => {
    const window = windows.find((w) => w.id === id);
    return window?.state === "minimized";
  };

  return (
    <div className="fixed right-0 bottom-0 left-0 z-[10000] flex h-12 items-center gap-1 border-t border-gray-300 bg-gray-200 px-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      {appConfigs.map((app) => {
        const isOpen = isWindowOpen(app.id);
        const isMinimized = isWindowMinimized(app.id);

        return (
          <button
            key={app.id}
            onClick={() => handleTaskbarClick(app.id)}
            className={`flex h-10 items-center gap-2 rounded px-3 transition-colors ${
              isOpen
                ? "bg-white dark:bg-gray-700"
                : "hover:bg-gray-300 dark:hover:bg-gray-700"
            } ${isMinimized ? "opacity-60" : ""}`}
            title={app.title}
          >
            <span className="text-xl">{app.icon}</span>
            <span className="text-sm font-medium">{app.title}</span>
          </button>
        );
      })}
    </div>
  );
}
