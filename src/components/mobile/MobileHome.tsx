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
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-6 py-8">
      {/* Logo */}
      <div className="relative h-48 w-full max-w-md">
        <Image
          src="/desktop-logo.webp"
          alt="FENRIS & MORIS"
          fill
          className="object-contain"
        />
      </div>

      {/* Subtitle */}
      <p className="text-center font-serif text-lg text-white">
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
              className="flex aspect-square w-20 flex-col items-center justify-center gap-2 rounded-lg bg-black/60 p-4 transition-all hover:bg-black/80"
            >
              <Icon
                name={app.icon}
                size={32}
                alt={app.label}
                className="h-12 w-12"
                isHovered={hoveredButton === app.id}
              />
              <span className="text-center text-xs text-white">
                {app.label}
              </span>
            </button>
          ))}
        </div>

        {/* Row 2 — 2 icons offset between top ones */}
        <div className="flex justify-center gap-4 pl-5">
          {apps.slice(3).map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => onNavigate(app.id)}
              onMouseEnter={() => setHoveredButton(app.id)}
              onMouseLeave={() => setHoveredButton(null)}
              className="flex aspect-square w-20 flex-col items-center justify-center gap-2 rounded-lg bg-black/60 p-4 transition-all hover:bg-black/80"
            >
              <Icon
                name={app.icon}
                size={32}
                alt={app.label}
                className="h-12 w-12"
                isHovered={hoveredButton === app.id}
              />
              <span className="text-center text-xs text-white">
                {app.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
