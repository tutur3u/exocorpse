"use client";

import AboutMe from "@/components/apps/AboutMe";
import Blog from "@/components/apps/Blog";
import Commission from "@/components/apps/Commission";
import HeavenSpace from "@/components/apps/HeavenSpace";
import Portfolio from "@/components/apps/Portfolio";
import Wiki from "@/components/apps/Wiki";
import { TASKBAR_HEIGHT } from "@/constants";
import type { BlogSearchParams } from "@/lib/blog-search-params";
import type { CommissionSearchParams } from "@/lib/commission-search-params";
import { HEAVEN_SPACE_GAME_ID, gameQueryParser } from "@/lib/game-query";
import type { GameSearchParams } from "@/lib/game-search-params";
import type { PortfolioSearchParams } from "@/lib/portfolio-search-params";
import type { WikiSearchParams } from "@/lib/wiki-search-params";
import type { AppId, WindowConfig, WindowInstance } from "@/types/window";
import { useQueryState } from "nuqs";
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
    icon: "Butterflies", // Using the Butterflies icon for About Me
    component: AboutMe,
    defaultSize: { width: 600, height: 400 },
    defaultPosition: { x: 100, y: 100 },
  },
  {
    id: "portfolio",
    title: "Portfolio",
    icon: "Portfolio",
    component: Portfolio,
    defaultSize: { width: 700, height: 500 },
    defaultPosition: { x: 150, y: 150 },
  },
  {
    id: "commission",
    title: "Commission",
    icon: "Commission",
    component: Commission,
    defaultSize: { width: 650, height: 450 },
    defaultPosition: { x: 200, y: 200 },
  },
  {
    id: "wiki",
    title: "Wiki",
    icon: "World_Wiki",
    component: Wiki,
    defaultSize: { width: 600, height: 500 },
    defaultPosition: { x: 250, y: 150 },
  },
  {
    id: "blog",
    title: "Blog",
    icon: "Blog",
    component: Blog,
    defaultSize: { width: 700, height: 600 },
    defaultPosition: { x: 150, y: 100 },
  },
  {
    id: "heaven-space",
    title: "Heaven Space",
    icon: "/media/heaven-space/epilogue.png",
    component: HeavenSpace,
    defaultSize: { width: 960, height: 700 },
    defaultPosition: { x: 80, y: 60 },
  },
];

export function WindowProvider({
  children,
  wikiParams,
  blogParams,
  commissionParams,
  portfolioParams,
  gameParams,
}: {
  children: React.ReactNode;
  wikiParams?: WikiSearchParams;
  blogParams?: BlogSearchParams;
  commissionParams?: CommissionSearchParams;
  portfolioParams?: PortfolioSearchParams;
  gameParams?: GameSearchParams;
}) {
  const hasWikiParams =
    wikiParams &&
    (wikiParams.story ||
      wikiParams.world ||
      wikiParams.character ||
      wikiParams.faction);
  const hasBlogParams =
    blogParams &&
    (blogParams["blog-post"] ||
      blogParams["blog-page"] ||
      blogParams["blog-page-size"]);

  const hasCommissionParams =
    commissionParams &&
    (commissionParams["commission-tab"] ||
      commissionParams["blacklist-page"] ||
      commissionParams["blacklist-page-size"]);

  const hasPortfolioParams =
    portfolioParams &&
    (portfolioParams["portfolio-tab"] || portfolioParams["portfolio-piece"]);

  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1000);
  const [gameQuery, setGameQuery] = useQueryState(
    "game",
    gameQueryParser.withOptions({
      shallow: true,
      history: "push",
    }),
  );
  const desiredAppId = gameQuery
    ? "heaven-space"
    : hasWikiParams
      ? "wiki"
      : hasBlogParams
        ? "blog"
        : hasCommissionParams
          ? "commission"
          : hasPortfolioParams
            ? "portfolio"
            : null;

  useEffect(() => {
    if (!desiredAppId) {
      return;
    }

    const existing = windows.find((entry) => entry.id === desiredAppId);

    if (existing) {
      const highestZ = Math.max(...windows.map((entry) => entry.zIndex));

      if (existing.state === "minimized") {
        setWindows((prev) =>
          prev.map((entry) =>
            entry.id === desiredAppId
              ? {
                  ...entry,
                  state:
                    desiredAppId === "heaven-space" ? "maximized" : "normal",
                  zIndex: nextZIndex,
                }
              : entry,
          ),
        );
        setNextZIndex((prev) => prev + 1);
      } else if (existing.zIndex !== highestZ) {
        setWindows((prev) =>
          prev.map((entry) =>
            entry.id === desiredAppId
              ? { ...entry, zIndex: nextZIndex }
              : entry,
          ),
        );
        setNextZIndex((prev) => prev + 1);
      }

      return;
    }

    const config = APP_CONFIGS.find((entry) => entry.id === desiredAppId);

    if (!config) {
      return;
    }

    setWindows((prev) => [
      ...prev,
      {
        id: desiredAppId,
        state: "maximized",
        zIndex: nextZIndex,
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
    setNextZIndex((prev) => prev + 1);
  }, [desiredAppId, nextZIndex, windows]);

  const openWindow = useCallback(
    (id: AppId) => {
      if (id === HEAVEN_SPACE_GAME_ID) {
        void setGameQuery(HEAVEN_SPACE_GAME_ID);
      }

      const existingWindow = windows.find((w) => w.id === id);

      if (existingWindow) {
        // If window exists but is minimized, restore it (set state to "normal" and bring to front)
        if (existingWindow.state === "minimized") {
          setWindows((prev) =>
            prev.map((w) =>
              w.id === id
                ? {
                    ...w,
                    state: id === "heaven-space" ? "maximized" : "normal",
                    zIndex: nextZIndex,
                  }
                : w,
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
        state: id === "heaven-space" ? "maximized" : "normal",
        zIndex: nextZIndex,
        position:
          id === "heaven-space" ? { x: 0, y: 0 } : config.defaultPosition,
        size:
          id === "heaven-space"
            ? {
                width: window.innerWidth,
                height: window.innerHeight - TASKBAR_HEIGHT,
              }
            : config.defaultSize,
        previousState:
          id === "heaven-space"
            ? {
                position: config.defaultPosition,
                size: config.defaultSize,
              }
            : undefined,
      };

      setWindows((prev) => [...prev, newWindow]);
      setNextZIndex((prev) => prev + 1);
    },
    [nextZIndex, setGameQuery, windows],
  );

  const closeWindow = useCallback(
    (id: AppId) => {
      if (id === HEAVEN_SPACE_GAME_ID) {
        void setGameQuery(null);
      }

      setWindows((prev) => prev.filter((w) => w.id !== id));
    },
    [setGameQuery],
  );

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
