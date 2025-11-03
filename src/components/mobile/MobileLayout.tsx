"use client";

import AboutMe from "@/components/apps/AboutMe";
import Blog from "@/components/apps/Blog";
import Commission from "@/components/apps/Commission";
import Portfolio from "@/components/apps/Portfolio";
import Wiki from "@/components/apps/Wiki";
import { MobileProvider } from "@/contexts/MobileContext";
import type { BlogSearchParams } from "@/lib/blog-search-params";
import type { CommissionSearchParams } from "@/lib/commission-search-params";
import type { PortfolioSearchParams } from "@/lib/portfolio-search-params";
import type { WikiSearchParams } from "@/lib/wiki-search-params";
import type { AppId } from "@/types/window";
import Image from "next/image";
import { useState } from "react";
import DesktopNoticeBanner from "./DesktopNoticeBanner";
import MobileHeader from "./MobileHeader";
import MobileHome from "./MobileHome";
import MobileWindow from "./MobileWindow";

type MobileLayoutProps = {
  wikiParams: WikiSearchParams;
  blogParams: BlogSearchParams;
  commissionParams: CommissionSearchParams;
  portfolioParams: PortfolioSearchParams;
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
];

export default function MobileLayout({
  wikiParams,
  blogParams,
  commissionParams,
  portfolioParams,
}: MobileLayoutProps) {
  // Determine initial app based on URL params
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

  const initialApp = hasWikiParams
    ? "wiki"
    : hasBlogParams
      ? "blog"
      : hasCommissionParams
        ? "commission"
        : hasPortfolioParams
          ? "portfolio"
          : null;

  const [selectedApp, setSelectedApp] = useState<AppId | null>(initialApp);

  const handleNavigate = (appId: string) => {
    setSelectedApp(appId as AppId);
  };

  const handleClose = () => {
    setSelectedApp(null);
  };

  const selectedAppConfig = MOBILE_APPS.find((app) => app.id === selectedApp);
  const AppComponent = selectedAppConfig?.component;

  return (
    <MobileProvider
      wikiParams={wikiParams}
      blogParams={blogParams}
      commissionParams={commissionParams}
      portfolioParams={portfolioParams}
    >
      <div className="relative flex h-screen w-screen flex-col overflow-hidden">
        {/* Background Image spans entire screen */}
        <div className="absolute inset-0">
          <Image
            src="/background-image.webp"
            alt="Background Image"
            fill
            className="object-cover"
            loading="eager"
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
    </MobileProvider>
  );
}
