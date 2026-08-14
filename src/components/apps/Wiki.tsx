"use client";

import { useInitialWikiData } from "@/contexts/InitialWikiDataContext";
import { usePublicStories } from "@/hooks/useStories";
import { BookOpen, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import WikiClient from "./WikiClient";

export default function Wiki() {
  const initialData = useInitialWikiData();
  const preset =
    initialData?.stories && initialData.stories.length > 0
      ? initialData.stories
      : undefined;
  const { data: stories = [], isLoading } = usePublicStories(preset);
  const [introVisible, setIntroVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroVisible(false), 850);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {introVisible || isLoading ? (
        <div className="absolute inset-0 z-50 grid place-items-center bg-[radial-gradient(circle_at_50%_35%,rgba(8,145,178,0.18),transparent_32%),linear-gradient(145deg,#030712,#080b16_55%,#130817)] p-6 text-[#fff6e8]">
          <div className="w-full max-w-sm text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/8 shadow-[0_0_45px_rgba(34,211,238,0.16)]">
              {isLoading ? (
                <LoaderCircle className="h-7 w-7 animate-spin text-cyan-200" />
              ) : (
                <BookOpen className="h-7 w-7 text-cyan-200" />
              )}
            </div>
            <p className="mt-5 font-serif text-2xl font-semibold">
              Opening the archive
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Preparing stories, worlds, and character records…
            </p>
            <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/8">
              <div className="h-full w-full origin-left animate-[wiki-load_850ms_ease-out_forwards] rounded-full bg-linear-to-r from-cyan-400 to-fuchsia-400 motion-reduce:animate-none" />
            </div>
            {!isLoading ? (
              <button
                className="mt-5 text-xs font-semibold tracking-[0.18em] text-cyan-200 uppercase hover:text-white"
                onClick={() => setIntroVisible(false)}
                type="button"
              >
                Enter now
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="flex-1 overflow-hidden">
        <WikiClient
          stories={stories}
          initialData={initialData}
          isLoadingStories={isLoading}
        />
      </div>
    </div>
  );
}
