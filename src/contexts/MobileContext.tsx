"use client";

import AboutMe from "@/components/apps/AboutMe";
import Commission from "@/components/apps/Commission";
import Portfolio from "@/components/apps/Portfolio";
import Wiki from "@/components/apps/Wiki";
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
    id: "wiki",
    title: "Wiki",
    icon: "📚",
    component: Wiki,
  },
];

export function MobileProvider({
  children,
  wikiParams,
}: {
  children: React.ReactNode;
  wikiParams: WikiSearchParams;
}) {
  const hasWikiParams =
    wikiParams.story ||
    wikiParams.world ||
    wikiParams.character ||
    wikiParams.faction;

  // Initialize state with wiki app open if params are present
  const [sheetState, setSheetState] = useState<BottomSheetState>(
    hasWikiParams ? "full-open" : "closed",
  );
  const [selectedApp, setSelectedApp] = useState<AppId | null>(
    hasWikiParams ? "wiki" : null,
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
