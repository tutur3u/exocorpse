"use client";

import BootScreen from "@/components/BootScreen";
import Desktop from "@/components/Desktop";
import MobileLayout from "@/components/mobile/MobileLayout";
import type { InitialBlogData } from "@/contexts/InitialBlogDataContext";
import { InitialBlogDataProvider } from "@/contexts/InitialBlogDataContext";
import type { InitialWikiData } from "@/contexts/InitialWikiDataContext";
import { InitialWikiDataProvider } from "@/contexts/InitialWikiDataContext";
import { useSound } from "@/contexts/SoundContext";
import { WindowProvider } from "@/contexts/WindowContext";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import type { BlogSearchParams } from "@/lib/blog-search-params";
import type { WikiSearchParams } from "@/lib/wiki-search-params";

type HomeClientProps = {
  wikiParams: WikiSearchParams;
  blogParams: BlogSearchParams;
  initialWikiData: InitialWikiData;
  initialBlogData: InitialBlogData;
};

export default function HomeClient({
  wikiParams,
  blogParams,
  initialWikiData,
  initialBlogData,
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
    blogParams["blog-page-size"]
  );

  // Show boot screen only on first visit to root index (no content params)
  if (!isBootComplete && !hasContent) {
    return <BootScreen onBootComplete={() => setBootComplete(true)} />;
  }

  if (isMobile) {
    return (
      <InitialBlogDataProvider initialData={initialBlogData}>
        <InitialWikiDataProvider initialData={initialWikiData}>
          <MobileLayout wikiParams={wikiParams} blogParams={blogParams} />
        </InitialWikiDataProvider>
      </InitialBlogDataProvider>
    );
  }

  return (
    <InitialBlogDataProvider initialData={initialBlogData}>
      <InitialWikiDataProvider initialData={initialWikiData}>
        <WindowProvider wikiParams={wikiParams} blogParams={blogParams}>
          <Desktop />
        </WindowProvider>
      </InitialWikiDataProvider>
    </InitialBlogDataProvider>
  );
}
