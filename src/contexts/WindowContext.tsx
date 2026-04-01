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
import type {
  AppId,
  RestorableWindowState,
  WindowConfig,
  WindowInstance,
} from "@/types/window";
import { useQueryState } from "nuqs";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

const WINDOW_LAYOUT_STORAGE_KEY = "exocorpse.desktop.windows.v1";
const MIN_WINDOW_WIDTH = 300;
const MIN_WINDOW_HEIGHT = 200;

type PersistedWindowLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  state: RestorableWindowState;
};

type PersistedWindowLayouts = Partial<Record<AppId, PersistedWindowLayout>>;

function getDefaultState(config: WindowConfig): RestorableWindowState {
  return config.defaultState ?? "normal";
}

function getViewportBounds() {
  return {
    width: globalThis.window.innerWidth,
    height: Math.max(globalThis.window.innerHeight - TASKBAR_HEIGHT, 0),
  };
}

function clampWindowLayout(layout: PersistedWindowLayout) {
  const viewport = getViewportBounds();
  const width = Math.min(
    Math.max(layout.width, MIN_WINDOW_WIDTH),
    viewport.width || MIN_WINDOW_WIDTH,
  );
  const height = Math.min(
    Math.max(layout.height, MIN_WINDOW_HEIGHT),
    viewport.height || MIN_WINDOW_HEIGHT,
  );

  return {
    x: Math.min(Math.max(0, layout.x), Math.max(viewport.width - width, 0)),
    y: Math.min(Math.max(0, layout.y), Math.max(viewport.height - height, 0)),
    width,
    height,
    state: layout.state,
  };
}

function isValidPersistedLayout(
  value: unknown,
): value is PersistedWindowLayout {
  if (!value || typeof value !== "object") {
    return false;
  }

  const layout = value as Record<string, unknown>;
  return (
    typeof layout.x === "number" &&
    typeof layout.y === "number" &&
    typeof layout.width === "number" &&
    typeof layout.height === "number" &&
    (layout.state === "normal" || layout.state === "maximized")
  );
}

function sanitizePersistedLayouts(value: unknown): PersistedWindowLayouts {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(([key, layout]) => {
      return (
        APP_CONFIGS.some((config) => config.id === key) &&
        isValidPersistedLayout(layout)
      );
    }),
  ) as PersistedWindowLayouts;
}

function getStoredLayout(
  config: WindowConfig,
  layouts: PersistedWindowLayouts,
): PersistedWindowLayout {
  const stored = layouts[config.id];
  if (stored) {
    return clampWindowLayout(stored);
  }

  return clampWindowLayout({
    x: config.defaultPosition.x,
    y: config.defaultPosition.y,
    width: config.defaultSize.width,
    height: config.defaultSize.height,
    state: getDefaultState(config),
  });
}

function createWindowInstance(
  config: WindowConfig,
  zIndex: number,
  layouts: PersistedWindowLayouts,
): WindowInstance {
  const storedLayout = getStoredLayout(config, layouts);

  if (storedLayout.state === "maximized") {
    const viewport = getViewportBounds();
    return {
      id: config.id,
      state: "maximized",
      zIndex,
      position: { x: 0, y: 0 },
      size: {
        width: viewport.width,
        height: viewport.height,
      },
      previousState: {
        position: { x: storedLayout.x, y: storedLayout.y },
        size: { width: storedLayout.width, height: storedLayout.height },
      },
      lastNonMinimizedState: "maximized",
    };
  }

  return {
    id: config.id,
    state: "normal",
    zIndex,
    position: { x: storedLayout.x, y: storedLayout.y },
    size: { width: storedLayout.width, height: storedLayout.height },
    lastNonMinimizedState: "normal",
  };
}

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
    defaultState: "maximized",
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
    defaultState: "maximized",
    defaultSize: { width: 700, height: 600 },
    defaultPosition: { x: 150, y: 100 },
  },
  {
    id: "heaven-space",
    title: "Heaven Space",
    icon: "/media/heaven-space/epilogue.png",
    component: HeavenSpace,
    defaultState: "maximized",
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
  const [persistedLayouts, setPersistedLayouts] =
    useState<PersistedWindowLayouts>({});
  const [hasHydratedLayouts, setHasHydratedLayouts] = useState(false);
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
    try {
      const rawLayouts = globalThis.window.localStorage.getItem(
        WINDOW_LAYOUT_STORAGE_KEY,
      );

      if (!rawLayouts) {
        setHasHydratedLayouts(true);
        return;
      }

      const parsedLayouts = JSON.parse(rawLayouts) as unknown;
      setPersistedLayouts(sanitizePersistedLayouts(parsedLayouts));
    } catch {
      setPersistedLayouts({});
    } finally {
      setHasHydratedLayouts(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedLayouts) {
      return;
    }

    globalThis.window.localStorage.setItem(
      WINDOW_LAYOUT_STORAGE_KEY,
      JSON.stringify(persistedLayouts),
    );
  }, [hasHydratedLayouts, persistedLayouts]);

  useEffect(() => {
    if (!hasHydratedLayouts) {
      return;
    }

    setPersistedLayouts((previousLayouts) => {
      let hasChanges = false;
      const nextLayouts = { ...previousLayouts };

      for (const windowInstance of windows) {
        if (windowInstance.state === "minimized") {
          continue;
        }

        const config = APP_CONFIGS.find(
          (entry) => entry.id === windowInstance.id,
        );
        if (!config) {
          continue;
        }

        const layout =
          windowInstance.state === "maximized"
            ? {
                x:
                  windowInstance.previousState?.position.x ??
                  config.defaultPosition.x,
                y:
                  windowInstance.previousState?.position.y ??
                  config.defaultPosition.y,
                width:
                  windowInstance.previousState?.size.width ??
                  config.defaultSize.width,
                height:
                  windowInstance.previousState?.size.height ??
                  config.defaultSize.height,
                state: "maximized" as const,
              }
            : {
                x: windowInstance.position.x,
                y: windowInstance.position.y,
                width: windowInstance.size.width,
                height: windowInstance.size.height,
                state: "normal" as const,
              };

        const clampedLayout = clampWindowLayout(layout);
        const currentLayout = previousLayouts[windowInstance.id];
        if (
          !currentLayout ||
          currentLayout.x !== clampedLayout.x ||
          currentLayout.y !== clampedLayout.y ||
          currentLayout.width !== clampedLayout.width ||
          currentLayout.height !== clampedLayout.height ||
          currentLayout.state !== clampedLayout.state
        ) {
          nextLayouts[windowInstance.id] = clampedLayout;
          hasChanges = true;
        }
      }

      return hasChanges ? nextLayouts : previousLayouts;
    });
  }, [hasHydratedLayouts, windows]);

  useEffect(() => {
    if (!hasHydratedLayouts || !desiredAppId) {
      return;
    }

    if (!desiredAppId) {
      return;
    }

    const existing = windows.find((entry) => entry.id === desiredAppId);

    if (existing) {
      const highestZ = Math.max(...windows.map((entry) => entry.zIndex));

      if (existing.state === "minimized") {
        const config = APP_CONFIGS.find((entry) => entry.id === desiredAppId);
        const nextState =
          existing.lastNonMinimizedState ??
          (config ? getDefaultState(config) : "normal");

        setWindows((prev) =>
          prev.map((entry) =>
            entry.id === desiredAppId
              ? {
                  ...entry,
                  state: nextState,
                  lastNonMinimizedState: nextState,
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
      createWindowInstance(config, nextZIndex, persistedLayouts),
    ]);
    setNextZIndex((prev) => prev + 1);
  }, [desiredAppId, hasHydratedLayouts, nextZIndex, persistedLayouts, windows]);

  const openWindow = useCallback(
    (id: AppId) => {
      if (id === HEAVEN_SPACE_GAME_ID) {
        void setGameQuery(HEAVEN_SPACE_GAME_ID);
      }

      const existingWindow = windows.find((w) => w.id === id);
      const config = APP_CONFIGS.find((entry) => entry.id === id);

      if (existingWindow) {
        // If window exists but is minimized, restore it (set state to "normal" and bring to front)
        if (existingWindow.state === "minimized") {
          const nextState =
            existingWindow.lastNonMinimizedState ??
            (config ? getDefaultState(config) : "normal");

          setWindows((prev) =>
            prev.map((w) =>
              w.id === id
                ? {
                    ...w,
                    state: nextState,
                    lastNonMinimizedState: nextState,
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

      if (!config) return;

      setWindows((prev) => [
        ...prev,
        createWindowInstance(config, nextZIndex, persistedLayouts),
      ]);
      setNextZIndex((prev) => prev + 1);
    },
    [nextZIndex, persistedLayouts, setGameQuery, windows],
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
              lastNonMinimizedState:
                w.state === "minimized" ? w.lastNonMinimizedState : w.state,
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
              lastNonMinimizedState: "maximized" as const,
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
              lastNonMinimizedState: "normal" as const,
              // Don't update position/size yet - let animation handle it
              previousState: w.previousState, // Keep previousState for animation
            };
          }
          return {
            ...w,
            state: "normal" as const,
            lastNonMinimizedState: "normal" as const,
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
        lastNonMinimizedState:
          w.state === "minimized" ? w.lastNonMinimizedState : w.state,
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
