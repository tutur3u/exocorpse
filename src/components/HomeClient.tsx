"use client";

import Desktop from "@/components/Desktop";
import MobileLayout from "@/components/mobile/MobileLayout";
import { WindowProvider } from "@/contexts/WindowContext";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import type { WikiSearchParams } from "@/lib/wiki-search-params";

type HomeClientProps = {
  wikiParams: WikiSearchParams;
};

export default function HomeClient({ wikiParams }: HomeClientProps) {
  const isMobile = useMobileDetection();

  if (isMobile) {
    return <MobileLayout wikiParams={wikiParams} />;
  }

  return (
    <WindowProvider wikiParams={wikiParams}>
      <Desktop />
    </WindowProvider>
  );
}
