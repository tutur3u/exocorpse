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
  type,
}: {
  children: ReactNode;
  className?: string;
  label?: string | null;
  onOpen: () => void;
  sensitive: boolean;
  type?: "gore" | "nsfw" | null;
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
        <span
          className={`absolute inset-0 grid place-content-center gap-2 px-4 text-center text-sm font-semibold text-white ${type === "gore" ? "bg-red-950/85" : type === "nsfw" ? "bg-fuchsia-950/85" : "bg-black/70"}`}
        >
          <EyeOff className="mx-auto h-6 w-6" />
          {label ||
            (type === "gore"
              ? "Graphic content — click to reveal"
              : type === "nsfw"
                ? "Adult content — click to reveal"
                : "Sensitive image — click to reveal")}
        </span>
      ) : null}
    </button>
  );
}
