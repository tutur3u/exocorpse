"use client";

import {
  DEFAULT_WIKI_DESKTOP_EXPERIENCE,
  WIKI_DESKTOP_EXPERIENCE_EVENT,
  type WikiDesktopExperience,
} from "@/lib/wiki-desktop-experience";
import { useEffect, useState } from "react";

export function useWikiDesktopExperience() {
  const [experience, setExperience] = useState<WikiDesktopExperience>(
    DEFAULT_WIKI_DESKTOP_EXPERIENCE,
  );

  useEffect(() => {
    const listener = (event: Event) =>
      setExperience((event as CustomEvent<WikiDesktopExperience>).detail);
    window.addEventListener(WIKI_DESKTOP_EXPERIENCE_EVENT, listener);
    return () =>
      window.removeEventListener(WIKI_DESKTOP_EXPERIENCE_EVENT, listener);
  }, []);

  return experience;
}
