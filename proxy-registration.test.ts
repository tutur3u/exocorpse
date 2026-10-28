import { expect, test } from "bun:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// CI runs this after vercel build; the default source check runs before the build.
test.skipIf(process.env.VERIFY_BUILT_PROXY !== "1")(
  "the production build registers a Node.js proxy that covers admin routes",
  async () => {
    const manifest: unknown = JSON.parse(
      await readFile(
        new URL(
          "./.next/server/functions-config-manifest.json",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    assert(
      typeof manifest === "object" &&
        manifest !== null &&
        "functions" in manifest,
    );
    const functions = manifest.functions;
    assert(
      typeof functions === "object" &&
        functions !== null &&
        "/_middleware" in functions,
    );
    const proxy = functions["/_middleware"];
    assert(typeof proxy === "object" && proxy !== null);
    expect(proxy).toMatchObject({ runtime: "nodejs" });
    assert("matchers" in proxy && Array.isArray(proxy.matchers));
    const matchers: unknown[] = proxy.matchers;
    const patterns = matchers.map((matcher) => {
      assert(
        typeof matcher === "object" &&
          matcher !== null &&
          "regexp" in matcher &&
          typeof matcher.regexp === "string",
      );
      return new RegExp(matcher.regexp);
    });
    for (const path of ["/admin", "/admin/drive"]) {
      expect(patterns.some((pattern) => pattern.test(path))).toBe(true);
    }
    for (const path of ["/api/x", "/_next/static/x"]) {
      expect(patterns.some((pattern) => pattern.test(path))).toBe(false);
    }
  },
);
