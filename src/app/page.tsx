"use client";

import Desktop from "@/components/Desktop";
import MobileLayout from "@/components/mobile/MobileLayout";
import { WindowProvider } from "@/contexts/WindowContext";
import { useMobileDetection } from "@/hooks/useMobileDetection";

export default function Home() {
  const isMobile = useMobileDetection();

  if (isMobile) {
    return <MobileLayout />;
  }

  return (
    <WindowProvider>
      <Desktop />
    </WindowProvider>
  );
}
