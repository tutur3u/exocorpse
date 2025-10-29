"use client";

import { MobileProvider } from "@/contexts/MobileContext";
import type { BlogSearchParams } from "@/lib/blog-search-params";
import type { CommissionSearchParams } from "@/lib/commission-search-params";
import type { PortfolioSearchParams } from "@/lib/portfolio-search-params";
import type { WikiSearchParams } from "@/lib/wiki-search-params";
import Image from "next/image";
import DesktopNoticeBanner from "./DesktopNoticeBanner";
import MobileBottomSheet from "./MobileBottomSheet";

type MobileLayoutProps = {
  wikiParams: WikiSearchParams;
  blogParams: BlogSearchParams;
  commissionParams: CommissionSearchParams;
  portfolioParams: PortfolioSearchParams;
};

export default function MobileLayout({
  wikiParams,
  blogParams,
  commissionParams,
  portfolioParams,
}: MobileLayoutProps) {
  return (
    <MobileProvider
      wikiParams={wikiParams}
      blogParams={blogParams}
      commissionParams={commissionParams}
      portfolioParams={portfolioParams}
    >
      <div className="relative h-screen w-screen overflow-hidden bg-cover bg-center">
        <Image
          src="/background-image.webp"
          alt="Background Image"
          fill
          className="object-cover"
          loading="eager"
        />
        {/* Desktop Notice Banner */}
        <DesktopNoticeBanner />

        {/* Background Content */}
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center text-white">
            <div className="pointer-events-auto relative h-40 w-96">
              <Image
                src="/desktop-logo.webp"
                alt="EXOCORPSE & MORS Logo"
                fill
                className="object-contain"
              />
            </div>
            <p className="mb-8 text-lg opacity-90">
              the duo of artist & writer in one vessel
            </p>
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
