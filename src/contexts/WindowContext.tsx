"use client";

import AboutMe from "@/components/apps/AboutMe";
import Blog from "@/components/apps/Blog";
import Commission from "@/components/apps/Commission";
import Portfolio from "@/components/apps/Portfolio";
import Wiki from "@/components/apps/Wiki";
import { TASKBAR_HEIGHT } from "@/constants";
import type { BlogSearchParams } from "@/lib/blog-search-params";
import type { CommissionSearchParams } from "@/lib/commission-search-params";
import type { PortfolioSearchParams } from "@/lib/portfolio-search-params";
import type { WikiSearchParams } from "@/lib/wiki-search-params";
import type { AppId, WindowConfig, WindowInstance } from "@/types/window";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface WindowContextType {
  windows: WindowInstance[];
  appConfigs: WindowConfig[];
  openWindow: (id: AppId) => void;
  closeWindow: (id: AppId) => void;
  minimizeWindow: (id: AppId) => void;
  maximizeWindow: (id: AppId) => void;
  restoreWindow: (id: AppId) => void;
  focusWindow: (id: AppId) => void;
  minimizeAllWindows: () => void;
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
  {
    id: "blog",
    title: "Blog",
    icon: "📝",
    component: Blog,
    defaultSize: { width: 700, height: 600 },
    defaultPosition: { x: 150, y: 100 },
  },
];

export function WindowProvider({
  children,
  wikiParams,
  blogParams,
  commissionParams,
  portfolioParams,
}: {
  children: React.ReactNode;
  wikiParams: WikiSearchParams;
  blogParams: BlogSearchParams;
  commissionParams: CommissionSearchParams;
  portfolioParams: PortfolioSearchParams;
}) {
  const hasWikiParams =
    wikiParams.story ||
    wikiParams.world ||
    wikiParams.character ||
    wikiParams.faction;

  const hasBlogParams =
    blogParams["blog-post"] ||
    blogParams["blog-page"] ||
    blogParams["blog-page-size"];

  const hasCommissionParams =
    commissionParams["commission-tab"] ||
    commissionParams["blacklist-page"] ||
    commissionParams["blacklist-page-size"];

  const hasPortfolioParams =
    portfolioParams["portfolio-tab"] || portfolioParams["portfolio-piece"];

  // Initialize windows with appropriate window if params are present
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1000);
  const initializedRef = useRef(false);

  // Initialize wiki, blog, or commission window on mount if params are present
  // Using useEffect with empty deps to ensure it only runs once on mount
  useEffect(() => {
    if (
      (hasWikiParams ||
        hasBlogParams ||
        hasCommissionParams ||
        hasPortfolioParams) &&
      !initializedRef.current
    ) {
      initializedRef.current = true;
      let appId: "wiki" | "blog" | "commission" | "portfolio" = "blog";

      if (hasWikiParams) {
        appId = "wiki";
      } else if (hasCommissionParams) {
        appId = "commission";
      } else if (hasPortfolioParams) {
        appId = "portfolio";
      }

      const config = APP_CONFIGS.find((c) => c.id === appId);
      if (config) {
        setWindows([
          {
            id: appId,
            state: "maximized",
            zIndex: 1000,
            position: { x: 0, y: 0 },
            size: {
              width: window.innerWidth,
              height: window.innerHeight - TASKBAR_HEIGHT,
            },
            previousState: {
              position: config.defaultPosition,
              size: config.defaultSize,
            },
          },
        ]);
        setNextZIndex(1001);
      }
    }
    // Empty dependency array - only run once on mount, never again
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              // Don't update position/size yet - let animation handle it
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
              // Don't update position/size yet - let animation handle it
              previousState: w.previousState, // Keep previousState for animation
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

  const minimizeAllWindows = useCallback(() => {
    setWindows((prev) =>
      prev.map((w) => ({
        ...w,
        state: "minimized" as const,
      })),
    );
  }, []);

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
        minimizeAllWindows,
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
