"use client";

import { useEffect, useRef } from "react";

const MIN_REFRESH_DELAY_MS = 15_000;

export default function AdminSessionKeeper({
  expiresAt,
  refreshEarlySeconds = 90,
}: {
  expiresAt: string;
  refreshEarlySeconds?: number;
}) {
  const latestExpiry = useRef(expiresAt);

  useEffect(() => {
    latestExpiry.current = expiresAt;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const schedule = () => {
      const refreshAt =
        Date.parse(latestExpiry.current) - refreshEarlySeconds * 1000;
      timer = setTimeout(
        refresh,
        Math.max(MIN_REFRESH_DELAY_MS, refreshAt - Date.now()),
      );
    };

    const refresh = async () => {
      try {
        const response = await fetch("/api/auth/session/refresh", {
          cache: "no-store",
          method: "POST",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as { expiresAt?: string };
        if (payload.expiresAt) latestExpiry.current = payload.expiresAt;
      } finally {
        if (!cancelled) schedule();
      }
    };

    void refresh();
    const refreshWhenVisible = () => {
      if (
        document.visibilityState === "visible" &&
        Date.parse(latestExpiry.current) <=
          Date.now() + refreshEarlySeconds * 1000
      ) {
        if (timer) clearTimeout(timer);
        void refresh();
      }
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [expiresAt, refreshEarlySeconds]);

  return null;
}
