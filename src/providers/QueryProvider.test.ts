import { describe, expect, test } from "bun:test";
import { PUBLIC_QUERY_DEFAULTS } from "./QueryProvider";

describe("public CMS query freshness", () => {
  test("quickly refreshes mounted and refocused marketing surfaces", () => {
    expect(PUBLIC_QUERY_DEFAULTS).toEqual({
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
      staleTime: 60_000,
    });
  });
});
