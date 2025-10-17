"use client";

import type { InitialWikiData } from "@/app/page";
import BootScreen from "@/components/BootScreen";
import Desktop from "@/components/Desktop";
import MobileLayout from "@/components/mobile/MobileLayout";
import { InitialWikiDataProvider } from "@/contexts/InitialWikiDataContext";
import { useSound } from "@/contexts/SoundContext";
import { WindowProvider } from "@/contexts/WindowContext";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import type { WikiSearchParams } from "@/lib/wiki-search-params";

type HomeClientProps = {
  wikiParams: WikiSearchParams;
  initialData: InitialWikiData;
};

export default function HomeClient({
  wikiParams,
  initialData,
}: HomeClientProps) {
  const isMobile = useMobileDetection();
  const { isBootComplete, setBootComplete } = useSound();

  // Check if we have any wiki params (content)
  const hasContent = !!(
    wikiParams.story ||
    wikiParams.world ||
    wikiParams.character ||
    wikiParams.faction
  );

  // Show boot screen only on first visit to root index (no content params)
  if (!isBootComplete && !hasContent) {
    return <BootScreen onBootComplete={() => setBootComplete(true)} />;
  }

  if (isMobile) {
    return (
      <InitialWikiDataProvider initialData={initialData}>
        <MobileLayout wikiParams={wikiParams} />
      </InitialWikiDataProvider>
    );
  }

  return (
    <InitialWikiDataProvider initialData={initialData}>
      <WindowProvider wikiParams={wikiParams}>
        <Desktop />
      </WindowProvider>
    </InitialWikiDataProvider>
  );
}
