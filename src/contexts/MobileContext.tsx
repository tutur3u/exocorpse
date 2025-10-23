"use client";

import AboutMe from "@/components/apps/AboutMe";
import Blog from "@/components/apps/Blog";
import Commission from "@/components/apps/Commission";
import Portfolio from "@/components/apps/Portfolio";
import Wiki from "@/components/apps/Wiki";
import type { BlogSearchParams } from "@/lib/blog-search-params";
import { CommissionSearchParams } from "@/lib/commission-search-params";
import type { WikiSearchParams } from "@/lib/wiki-search-params";
import type { AppId } from "@/types/window";
import React, { createContext, useCallback, useContext, useState } from "react";

type BottomSheetState = "closed" | "half-open" | "full-open";

interface MobileApp {
  id: AppId;
  title: string;
  icon: string;
  component: React.ComponentType;
}

interface MobileContextType {
  sheetState: BottomSheetState;
  selectedApp: AppId | null;
  apps: MobileApp[];
  openSheet: () => void;
  closeSheet: () => void;
  expandSheet: () => void;
  selectApp: (id: AppId) => void;
  goBackToAppList: () => void;
}

const MobileContext = createContext<MobileContextType | undefined>(undefined);

export const MOBILE_APPS: MobileApp[] = [
  {
    id: "about",
    title: "About Me",
    icon: "👤",
    component: AboutMe,
  },
  {
    id: "portfolio",
    title: "Portfolio",
    icon: "📁",
    component: Portfolio,
  },
  {
    id: "commission",
    title: "Commission",
    icon: "💼",
    component: Commission,
  },
  {
    id: "blog",
    title: "Blog",
    icon: "📝",
    component: Blog,
  },
  {
    id: "wiki",
    title: "Wiki",
    icon: "📚",
    component: Wiki,
  },
];

export function MobileProvider({
  children,
  wikiParams,
  blogParams,
  commissionParams,
}: {
  children: React.ReactNode;
  wikiParams: WikiSearchParams;
  blogParams: BlogSearchParams;
  commissionParams: CommissionSearchParams;
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

  // Initialize state with appropriate app open if params are present
  const [sheetState, setSheetState] = useState<BottomSheetState>(
    hasWikiParams || hasBlogParams || hasCommissionParams
      ? "full-open"
      : "closed",
  );
  const [selectedApp, setSelectedApp] = useState<AppId | null>(
    hasWikiParams
      ? "wiki"
      : hasBlogParams
        ? "blog"
        : hasCommissionParams
          ? "commission"
          : null,
  );

  const openSheet = useCallback(() => {
    setSheetState("half-open");
  }, []);

  const closeSheet = useCallback(() => {
    setSheetState("closed");
    // Delay clearing selected app to allow animation to complete
    setTimeout(() => setSelectedApp(null), 300);
  }, []);

  const expandSheet = useCallback(() => {
    setSheetState("full-open");
  }, []);

  const selectApp = useCallback((id: AppId) => {
    setSelectedApp(id);
    setSheetState("full-open");
  }, []);

  const goBackToAppList = useCallback(() => {
    setSelectedApp(null);
    setSheetState("half-open");
  }, []);

  return (
    <MobileContext.Provider
      value={{
        sheetState,
        selectedApp,
        apps: MOBILE_APPS,
        openSheet,
        closeSheet,
        expandSheet,
        selectApp,
        goBackToAppList,
      }}
    >
      {children}
    </MobileContext.Provider>
  );
}

export function useMobile() {
  const context = useContext(MobileContext);
  if (!context) {
    throw new Error("useMobile must be used within MobileProvider");
  }
  return context;
}
