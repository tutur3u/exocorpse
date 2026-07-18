"use client";

import dynamic from "next/dynamic";
import PortfolioLoadingSkeleton from "./PortfolioLoadingSkeleton";

function AppLoadingFallback() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading application"
      className="flex h-full min-h-48 items-center justify-center bg-slate-950/95 text-sm tracking-[0.2em] text-slate-400 uppercase"
    >
      Loading
    </div>
  );
}

export const LazyAboutMe = dynamic(() => import("./AboutMe"), {
  loading: AppLoadingFallback,
});
export const LazyBlog = dynamic(() => import("./Blog"), {
  loading: AppLoadingFallback,
});
export const LazyCommission = dynamic(() => import("./Commission"), {
  loading: AppLoadingFallback,
});
export const LazyHeavenSpace = dynamic(() => import("./HeavenSpace"), {
  loading: AppLoadingFallback,
});
export const LazyPortfolio = dynamic(() => import("./Portfolio"), {
  loading: PortfolioLoadingSkeleton,
});
export const LazyWiki = dynamic(() => import("./Wiki"), {
  loading: AppLoadingFallback,
});
