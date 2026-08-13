"use client";

import { useEffect } from "react";

export default function ImageProtection() {
  useEffect(() => {
    const protectImage = (event: Event) => {
      if (event.target instanceof HTMLImageElement) event.preventDefault();
    };

    document.addEventListener("contextmenu", protectImage, true);
    document.addEventListener("dragstart", protectImage, true);
    return () => {
      document.removeEventListener("contextmenu", protectImage, true);
      document.removeEventListener("dragstart", protectImage, true);
    };
  }, []);

  return null;
}
