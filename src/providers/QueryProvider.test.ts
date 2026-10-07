import { describe, expect, test } from "bun:test";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { PUBLIC_QUERY_DEFAULTS } from "./QueryProvider";

describe("public CMS query freshness", () => {
  test("reuses fresh initial content but refreshes it after a CMS mutation", async () => {
    let requests = 0;
    const client = new QueryClient({
      defaultOptions: { queries: PUBLIC_QUERY_DEFAULTS },
    });
    const observer = new QueryObserver(client, {
      queryKey: ["public-content"],
      initialData: "before save",
      queryFn: async () => {
        requests += 1;
        return "after save";
      },
    });
    const unsubscribe = observer.subscribe(() => undefined);
    try {
      expect(requests).toBe(0);
      expect(observer.getCurrentResult().data).toBe("before save");
      await client.invalidateQueries();
      expect(requests).toBe(1);
      expect(observer.getCurrentResult().data).toBe("after save");
    } finally {
      unsubscribe();
      client.clear();
    }
  });

  test("refreshes stale content when its window is reopened", async () => {
    let requests = 0;
    const client = new QueryClient({
      defaultOptions: { queries: PUBLIC_QUERY_DEFAULTS },
    });
    const observer = new QueryObserver(client, {
      queryKey: ["public-content"],
      initialData: "old content",
      initialDataUpdatedAt: Date.now() - 61_000,
      queryFn: async () => {
        requests += 1;
        return "current content";
      },
    });
    const unsubscribe = observer.subscribe(() => undefined);
    try {
      expect(requests).toBe(1);
      await client.refetchQueries();
      expect(observer.getCurrentResult().data).toBe("current content");
    } finally {
      unsubscribe();
      client.clear();
    }
  });
});
