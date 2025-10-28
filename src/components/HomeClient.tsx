"use client";

import BootScreen from "@/components/BootScreen";
import Desktop from "@/components/Desktop";
import MobileLayout from "@/components/mobile/MobileLayout";
import type { InitialBlogData } from "@/contexts/InitialBlogDataContext";
import { InitialBlogDataProvider } from "@/contexts/InitialBlogDataContext";
import type { InitialCommissionData } from "@/contexts/InitialCommissionDataContext";
import { InitialCommissionDataProvider } from "@/contexts/InitialCommissionDataContext";
import type { InitialPortfolioData } from "@/contexts/InitialPortfolioDataContext";
import { InitialPortfolioDataProvider } from "@/contexts/InitialPortfolioDataContext";
import type { InitialWikiData } from "@/contexts/InitialWikiDataContext";
import { InitialWikiDataProvider } from "@/contexts/InitialWikiDataContext";
import { useSound } from "@/contexts/SoundContext";
import { WindowProvider } from "@/contexts/WindowContext";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import type { BlogSearchParams } from "@/lib/blog-search-params";
import type { CommissionSearchParams } from "@/lib/commission-search-params";
import type { PortfolioSearchParams } from "@/lib/portfolio-search-params";
import type { WikiSearchParams } from "@/lib/wiki-search-params";

type HomeClientProps = {
  wikiParams: WikiSearchParams;
  blogParams: BlogSearchParams;
  commissionParams: CommissionSearchParams;
  portfolioParams: PortfolioSearchParams;
  initialWikiData: InitialWikiData;
  initialBlogData: InitialBlogData;
  initialCommissionData: InitialCommissionData;
  initialPortfolioData: InitialPortfolioData;
};

export default function HomeClient({
  wikiParams,
  blogParams,
  commissionParams,
  portfolioParams,
  initialWikiData,
  initialBlogData,
  initialCommissionData,
  initialPortfolioData,
}: HomeClientProps) {
  const isMobile = useMobileDetection();
  const { isBootComplete, setBootComplete } = useSound();

  // Check if we have any wiki or blog params (content)
  const hasContent = !!(
    wikiParams.story ||
    wikiParams.world ||
    wikiParams.character ||
    wikiParams.faction ||
    blogParams["blog-post"] ||
    blogParams["blog-page"] ||
    blogParams["blog-page-size"] ||
    commissionParams["commission-tab"] ||
    commissionParams["blacklist-page"] ||
    commissionParams["blacklist-page-size"] ||
    commissionParams.service ||
    commissionParams.style ||
    portfolioParams["portfolio-tab"] ||
    portfolioParams["portfolio-piece"]
  );

  // Show boot screen only on first visit to root index (no content params)
  if (!isBootComplete && !hasContent) {
    return <BootScreen onBootComplete={() => setBootComplete(true)} />;
  }

  const Component = isMobile ? MobileLayout : Desktop;
  type WindowProviderProps = React.ComponentProps<typeof WindowProvider>;
  const commonProps: Omit<WindowProviderProps, "children"> = {
    wikiParams,
    blogParams,
    commissionParams,
    portfolioParams,
  };

  return (
    <InitialPortfolioDataProvider initialData={initialPortfolioData}>
      <InitialCommissionDataProvider value={initialCommissionData}>
        <InitialBlogDataProvider initialData={initialBlogData}>
          <InitialWikiDataProvider initialData={initialWikiData}>
            {isMobile ? (
              <MobileLayout {...commonProps} />
            ) : (
              <WindowProvider {...commonProps}>
                <Desktop />
              </WindowProvider>
            )}
          </InitialWikiDataProvider>
        </InitialBlogDataProvider>
      </InitialCommissionDataProvider>
    </InitialPortfolioDataProvider>
  );
}
