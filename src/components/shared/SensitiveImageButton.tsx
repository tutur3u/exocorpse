"use client";

import { EyeOff } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

export default function SensitiveImageButton({
  children,
  className,
  label,
  onOpen,
  sensitive,
}: {
  children: ReactNode;
  className?: string;
  label?: string | null;
  onOpen: () => void;
  sensitive: boolean;
}) {
  const [revealed, setRevealed] = useState(!sensitive);
  return (
    <button
      className={`group relative overflow-hidden ${className ?? ""}`}
      onClick={() => (revealed ? onOpen() : setRevealed(true))}
      type="button"
    >
      <span
        className={`block h-full w-full transition duration-300 ${revealed ? "" : "scale-105 blur-2xl"}`}
      >
        {children}
      </span>
      {!revealed ? (
        <span className="absolute inset-0 grid place-content-center gap-2 bg-black/70 px-4 text-center text-sm font-semibold text-white">
          <EyeOff className="mx-auto h-6 w-6" />
          {label || "Sensitive image — click to reveal"}
        </span>
      ) : null}
    </button>
  );
}
