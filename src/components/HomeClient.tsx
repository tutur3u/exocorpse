"use client";

import BootScreen from "@/components/BootScreen";
import Desktop from "@/components/Desktop";
import MobileLayout from "@/components/mobile/MobileLayout";
import { useSound } from "@/contexts/SoundContext";
import { WindowProvider } from "@/contexts/WindowContext";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import type { WikiSearchParams } from "@/lib/wiki-search-params";

type HomeClientProps = {
  wikiParams: WikiSearchParams;
};

export default function HomeClient({ wikiParams }: HomeClientProps) {
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
    return <MobileLayout wikiParams={wikiParams} />;
  }

  return (
    <WindowProvider wikiParams={wikiParams}>
      <Desktop />
    </WindowProvider>
  );
}
