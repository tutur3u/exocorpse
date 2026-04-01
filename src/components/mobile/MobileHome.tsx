"use client";

import Image from "next/image";
import { useState } from "react";
import Icon from "../shared/Icon";

interface MobileHomeProps {
  onNavigate: (appId: string) => void;
}

export default function MobileHome({ onNavigate }: MobileHomeProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const apps = [
    { id: "about", label: "about me", icon: "Butterflies" },
    { id: "portfolio", label: "portfolio", icon: "Portfolio" },
    { id: "commission", label: "commissions", icon: "Commission" },
    { id: "wiki", label: "wiki", icon: "World_Wiki" },
    { id: "blog", label: "blog", icon: "Blog" },
    {
      id: "heaven-space",
      label: "heaven space",
      icon: "/media/heaven-space/epilogue.png",
    },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-6 py-8 text-slate-100">
      {/* Logo */}
      <div className="relative h-48 w-full max-w-md">
        <Image
          src="/desktop-logo.webp"
          alt="FENRIS & MORIS"
          fill
          className="object-contain drop-shadow-[0_14px_30px_rgba(2,6,23,0.9)]"
        />
      </div>

      {/* Subtitle */}
      <p className="rounded-full border border-white/10 bg-slate-950/45 px-4 py-2 text-center font-serif text-lg text-slate-100 shadow-[0_12px_28px_rgba(2,6,23,0.44)] backdrop-blur-md">
        the duo of artist & writer in one vessel.
      </p>

      {/* Navigation Buttons in Olympic Layout */}
      <div className="flex w-full max-w-xs flex-col items-center gap-4">
        {/* Row 1 — 3 icons */}
        <div className="flex justify-center gap-4">
          {apps.slice(0, 3).map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => onNavigate(app.id)}
              onMouseEnter={() => setHoveredButton(app.id)}
              onMouseLeave={() => setHoveredButton(null)}
              className="flex aspect-square w-20 flex-col items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-slate-950/55 p-4 shadow-[0_14px_32px_rgba(2,6,23,0.42)] backdrop-blur-md transition-all hover:border-cyan-300/50 hover:bg-slate-950/72"
            >
              <Icon
                name={app.icon}
                size={32}
                alt={app.label}
                className="h-12 w-12"
                isHovered={hoveredButton === app.id}
              />
              <span className="text-center text-xs text-slate-100">
                {app.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          {apps.slice(3).map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => onNavigate(app.id)}
              onMouseEnter={() => setHoveredButton(app.id)}
              onMouseLeave={() => setHoveredButton(null)}
              className="flex aspect-square w-20 flex-col items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-slate-950/55 p-4 shadow-[0_14px_32px_rgba(2,6,23,0.42)] backdrop-blur-md transition-all hover:border-cyan-300/50 hover:bg-slate-950/72"
            >
              <Icon
                name={app.icon}
                size={32}
                alt={app.label}
                className="h-12 w-12"
                isHovered={hoveredButton === app.id}
              />
              <span className="text-center text-xs text-slate-100">
                {app.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
