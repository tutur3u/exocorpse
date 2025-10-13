"use client";

import { TASKBAR_HEIGHT } from "@/constants";
import { useWindows } from "@/contexts/WindowContext";
import type { AppId } from "@/types/window";
import { useEffect, useRef } from "react";
import { Rnd } from "react-rnd";

interface WindowProps {
  id: AppId;
  title: string;
  children: React.ReactNode;
}

export default function Window({ id, title, children }: WindowProps) {
  const {
    windows,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useWindows();

  const window = windows.find((w) => w.id === id);
  const rndRef = useRef<Rnd>(null);

  useEffect(() => {
    if (window?.state === "maximized" && rndRef.current) {
      rndRef.current.updateSize({
        width: globalThis.window.innerWidth,
        height: globalThis.window.innerHeight - TASKBAR_HEIGHT,
      });
      rndRef.current.updatePosition({ x: 0, y: 0 });
    }
  }, [window?.state]);

  if (!window || window.state === "minimized") {
    return null;
  }

  const isMaximized = window.state === "maximized";

  return (
    <Rnd
      ref={rndRef}
      position={window.position}
      size={window.size}
      onDragStart={() => focusWindow(id)}
      onDragStop={(e, d) => {
        updateWindowPosition(id, { x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        updateWindowSize(id, {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
        updateWindowPosition(id, position);
      }}
      minWidth={300}
      minHeight={200}
      bounds="parent"
      dragHandleClassName="window-drag-handle"
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      style={{
        zIndex: window.zIndex,
      }}
      className="window-container pointer-events-auto"
    >
      <div
        className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        onMouseDown={() => focusWindow(id)}
      >
        {/* Title Bar */}
        <div className="window-drag-handle flex cursor-move items-center justify-between border-b border-gray-300 bg-gray-100 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => minimizeWindow(id)}
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Minimize"
            >
              <svg
                width="12"
                height="2"
                viewBox="0 0 12 2"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="12" height="2" fill="currentColor" />
              </svg>
            </button>
            <button
              onClick={() => {
                if (isMaximized) {
                  restoreWindow(id);
                } else {
                  maximizeWindow(id);
                }
              }}
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1"
                  y="1"
                  width="10"
                  height="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </button>
            <button
              onClick={() => closeWindow(id)}
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-red-500 hover:text-white"
              title="Close"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L11 11M1 11L11 1"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Window Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </Rnd>
  );
}
