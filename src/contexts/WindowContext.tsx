"use client";

import AboutMe from "@/components/apps/AboutMe";
import Commission from "@/components/apps/Commission";
import Portfolio from "@/components/apps/Portfolio";
import Wiki from "@/components/apps/Wiki";
import { TASKBAR_HEIGHT } from "@/constants";
import type { AppId, WindowConfig, WindowInstance } from "@/types/window";
import React, { createContext, useCallback, useContext, useState } from "react";

interface WindowContextType {
  windows: WindowInstance[];
  appConfigs: WindowConfig[];
  openWindow: (id: AppId) => void;
  closeWindow: (id: AppId) => void;
  minimizeWindow: (id: AppId) => void;
  maximizeWindow: (id: AppId) => void;
  restoreWindow: (id: AppId) => void;
  focusWindow: (id: AppId) => void;
  updateWindowPosition: (id: AppId, position: { x: number; y: number }) => void;
  updateWindowSize: (
    id: AppId,
    size: { width: number; height: number },
  ) => void;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export const APP_CONFIGS: WindowConfig[] = [
  {
    id: "about",
    title: "About Me",
    icon: "👤",
    component: AboutMe,
    defaultSize: { width: 600, height: 400 },
    defaultPosition: { x: 100, y: 100 },
  },
  {
    id: "portfolio",
    title: "Portfolio",
    icon: "📁",
    component: Portfolio,
    defaultSize: { width: 700, height: 500 },
    defaultPosition: { x: 150, y: 150 },
  },
  {
    id: "commission",
    title: "Commission",
    icon: "💼",
    component: Commission,
    defaultSize: { width: 650, height: 450 },
    defaultPosition: { x: 200, y: 200 },
  },
  {
    id: "wiki",
    title: "Wiki",
    icon: "📚",
    component: Wiki,
    defaultSize: { width: 600, height: 500 },
    defaultPosition: { x: 250, y: 150 },
  },
];

export function WindowProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1000);

  const openWindow = useCallback(
    (id: AppId) => {
      const existingWindow = windows.find((w) => w.id === id);

      if (existingWindow) {
        // If window exists but is minimized, restore it (set state to "normal" and bring to front)
        if (existingWindow.state === "minimized") {
          setWindows((prev) =>
            prev.map((w) =>
              w.id === id ? { ...w, state: "normal", zIndex: nextZIndex } : w,
            ),
          );
          setNextZIndex((prev) => prev + 1);
        } else {
          // Just focus it (bring to front)
          setWindows((prev) =>
            prev.map((w) => (w.id === id ? { ...w, zIndex: nextZIndex } : w)),
          );
          setNextZIndex((prev) => prev + 1);
        }
        return;
      }

      const config = APP_CONFIGS.find((c) => c.id === id);
      if (!config) return;

      const newWindow: WindowInstance = {
        id,
        state: "normal",
        zIndex: nextZIndex,
        position: config.defaultPosition,
        size: config.defaultSize,
      };

      setWindows((prev) => [...prev, newWindow]);
      setNextZIndex((prev) => prev + 1);
    },
    [windows, nextZIndex],
  );

  const closeWindow = useCallback((id: AppId) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: AppId) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              state: "minimized" as const,
            }
          : w,
      ),
    );
  }, []);

  const maximizeWindow = useCallback((id: AppId) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              state: "maximized" as const,
              previousState: {
                position: w.position,
                size: w.size,
              },
              position: { x: 0, y: 0 },
              size: {
                width: typeof window !== "undefined" ? window.innerWidth : 0,
                height:
                  typeof window !== "undefined"
                    ? window.innerHeight - TASKBAR_HEIGHT
                    : 0,
              }, // Account for taskbar
            }
          : w,
      ),
    );
  }, []);

  const restoreWindow = useCallback((id: AppId) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          if (w.state === "maximized" && w.previousState) {
            return {
              ...w,
              state: "normal" as const,
              position: w.previousState.position,
              size: w.previousState.size,
              previousState: undefined,
            };
          }
          return {
            ...w,
            state: "normal" as const,
          };
        }
        return w;
      }),
    );
  }, []);

  const focusWindow = useCallback(
    (id: AppId) => {
      setWindows((prev) => {
        const window = prev.find((w) => w.id === id);
        if (!window) return prev;

        // If already at top, don't change anything
        const maxZ = Math.max(...prev.map((w) => w.zIndex));
        if (window.zIndex === maxZ) return prev;

        return prev.map((w) =>
          w.id === id ? { ...w, zIndex: nextZIndex } : w,
        );
      });
      setNextZIndex((prev) => prev + 1);
    },
    [nextZIndex],
  );

  const updateWindowPosition = useCallback(
    (id: AppId, position: { x: number; y: number }) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, position } : w)),
      );
    },
    [],
  );

  const updateWindowSize = useCallback(
    (id: AppId, size: { width: number; height: number }) => {
      setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, size } : w)));
    },
    [],
  );

  return (
    <WindowContext.Provider
      value={{
        windows,
        appConfigs: APP_CONFIGS,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        restoreWindow,
        focusWindow,
        updateWindowPosition,
        updateWindowSize,
      }}
    >
      {children}
    </WindowContext.Provider>
  );
}

export function useWindows() {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error("useWindows must be used within WindowProvider");
  }
  return context;
}
