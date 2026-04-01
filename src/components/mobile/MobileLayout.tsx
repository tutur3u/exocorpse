"use client";

import AboutMe from "@/components/apps/AboutMe";
import Blog from "@/components/apps/Blog";
import Commission from "@/components/apps/Commission";
import HeavenSpace from "@/components/apps/HeavenSpace";
import Portfolio from "@/components/apps/Portfolio";
import Wiki from "@/components/apps/Wiki";
import { MobileProvider } from "@/contexts/MobileContext";
import { WindowProvider } from "@/contexts/WindowContext";
import type { BlogSearchParams } from "@/lib/blog-search-params";
import type { CommissionSearchParams } from "@/lib/commission-search-params";
import { HEAVEN_SPACE_GAME_ID, gameQueryParser } from "@/lib/game-query";
import type { GameSearchParams } from "@/lib/game-search-params";
import type { PortfolioSearchParams } from "@/lib/portfolio-search-params";
import type { WikiSearchParams } from "@/lib/wiki-search-params";
import type { AppId } from "@/types/window";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import DesktopNoticeBanner from "./DesktopNoticeBanner";
import MobileHeader from "./MobileHeader";
import MobileHome from "./MobileHome";
import MobileWindow from "./MobileWindow";

type MobileLayoutProps = {
  wikiParams?: WikiSearchParams;
  blogParams?: BlogSearchParams;
  commissionParams?: CommissionSearchParams;
  portfolioParams?: PortfolioSearchParams;
  gameParams?: GameSearchParams;
};

const EMPTY_WIKI_PARAMS: WikiSearchParams = {
  story: null,
  world: null,
  character: null,
  faction: null,
  location: null,
};

const EMPTY_BLOG_PARAMS: BlogSearchParams = {
  "blog-post": null,
  "blog-page": null,
  "blog-page-size": null,
};

const EMPTY_COMMISSION_PARAMS: CommissionSearchParams = {
  "commission-tab": null,
  "blacklist-page": null,
  "blacklist-page-size": null,
  service: null,
  style: null,
};

const EMPTY_PORTFOLIO_PARAMS: PortfolioSearchParams = {
  "portfolio-tab": null,
  "portfolio-piece": null,
};

const EMPTY_GAME_PARAMS: GameSearchParams = {
  game: null,
};

const MOBILE_APPS = [
  {
    id: "about" as AppId,
    title: "About Me",
    component: AboutMe,
  },
  {
    id: "portfolio" as AppId,
    title: "Portfolio",
    component: Portfolio,
  },
  {
    id: "commission" as AppId,
    title: "Commissions",
    component: Commission,
  },
  {
    id: "blog" as AppId,
    title: "Blog",
    component: Blog,
  },
  {
    id: "wiki" as AppId,
    title: "Wiki",
    component: Wiki,
  },
  {
    id: "heaven-space" as AppId,
    title: "Heaven Space",
    component: HeavenSpace,
  },
];

export default function MobileLayout({
  wikiParams,
  blogParams,
  commissionParams,
  portfolioParams,
  gameParams,
}: MobileLayoutProps) {
  const safeWikiParams = wikiParams ?? EMPTY_WIKI_PARAMS;
  const safeBlogParams = blogParams ?? EMPTY_BLOG_PARAMS;
  const safeCommissionParams = commissionParams ?? EMPTY_COMMISSION_PARAMS;
  const safePortfolioParams = portfolioParams ?? EMPTY_PORTFOLIO_PARAMS;
  const safeGameParams = gameParams ?? EMPTY_GAME_PARAMS;

  // Determine initial app based on URL params
  const hasWikiParams =
    safeWikiParams.story ||
    safeWikiParams.world ||
    safeWikiParams.character ||
    safeWikiParams.faction;

  const hasBlogParams =
    safeBlogParams["blog-post"] ||
    safeBlogParams["blog-page"] ||
    safeBlogParams["blog-page-size"];

  const hasCommissionParams =
    safeCommissionParams["commission-tab"] ||
    safeCommissionParams["blacklist-page"] ||
    safeCommissionParams["blacklist-page-size"];

  const hasPortfolioParams =
    safePortfolioParams["portfolio-tab"] ||
    safePortfolioParams["portfolio-piece"];

  const [gameQuery, setGameQuery] = useQueryState(
    "game",
    gameQueryParser.withOptions({
      shallow: true,
      history: "push",
    }),
  );

  const requestedApp = gameQuery
    ? HEAVEN_SPACE_GAME_ID
    : hasWikiParams
      ? "wiki"
      : hasBlogParams
        ? "blog"
        : hasCommissionParams
          ? "commission"
          : hasPortfolioParams
            ? "portfolio"
            : null;
  const [selectedApp, setSelectedApp] = useState<AppId | null>(requestedApp);

  useEffect(() => {
    if (requestedApp) {
      setSelectedApp(requestedApp);
    }
  }, [requestedApp]);

  const handleNavigate = (appId: string) => {
    setSelectedApp(appId as AppId);
    void setGameQuery(
      appId === HEAVEN_SPACE_GAME_ID ? HEAVEN_SPACE_GAME_ID : null,
    );
  };

  const handleClose = () => {
    setSelectedApp(null);
    void setGameQuery(null);
  };

  const selectedAppConfig = MOBILE_APPS.find((app) => app.id === selectedApp);
  const AppComponent = selectedAppConfig?.component;

  return (
    <MobileProvider
      wikiParams={safeWikiParams}
      blogParams={safeBlogParams}
      commissionParams={safeCommissionParams}
      portfolioParams={safePortfolioParams}
      gameParams={safeGameParams}
    >
      <WindowProvider gameParams={safeGameParams}>
        <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-black text-slate-100">
          {/* Background Image spans entire screen */}
          <div className="absolute inset-0">
            <Image
              src="/background-image.webp"
              alt="Background image"
              fill
              className="object-cover object-center"
              loading="eager"
              priority
            />
          </div>

          {/* Foreground content */}
          <div className="relative z-10 flex h-full flex-col overflow-hidden">
            {/* Desktop Notice Banner */}
            <DesktopNoticeBanner />

            {/* Header with Music Controls */}
            <MobileHeader isAppOpen={!!selectedApp} />

            {/* Main Content Area */}
            <div className="relative flex-1 overflow-hidden">
              {/* Content Overlay */}
              <div className="relative z-10 h-full">
                {!selectedApp ? (
                  <MobileHome onNavigate={handleNavigate} />
                ) : (
                  <MobileWindow
                    appId={selectedApp}
                    title={selectedAppConfig?.title || ""}
                    onClose={handleClose}
                  >
                    {AppComponent && <AppComponent />}
                  </MobileWindow>
                )}
              </div>
            </div>
          </div>
        </div>
      </WindowProvider>
    </MobileProvider>
  );
}
