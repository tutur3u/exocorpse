"use client";

import { MobileProvider } from "@/contexts/MobileContext";
import type { BlogSearchParams } from "@/lib/blog-search-params";
import type { WikiSearchParams } from "@/lib/wiki-search-params";
import DesktopNoticeBanner from "./DesktopNoticeBanner";
import MobileBottomSheet from "./MobileBottomSheet";

type MobileLayoutProps = {
  wikiParams: WikiSearchParams;
  blogParams: BlogSearchParams;
};

export default function MobileLayout({
  wikiParams,
  blogParams,
}: MobileLayoutProps) {
  return (
    <MobileProvider wikiParams={wikiParams} blogParams={blogParams}>
      <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Desktop Notice Banner */}
        <DesktopNoticeBanner />

        {/* Background Content */}
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center text-white">
            <h1 className="mb-4 text-4xl font-bold">EXOCORPSE</h1>
            <p className="mb-8 text-lg opacity-90">Swipe up to explore</p>
            <div className="animate-bounce">
              <svg
                className="mx-auto h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom Sheet */}
        <MobileBottomSheet />
      </div>
    </MobileProvider>
  );
}
