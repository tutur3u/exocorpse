import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

// Run after `bun run build` with VERIFY_BUILT_PROXY=1. The default check runs before a build.
test.skipIf(process.env.VERIFY_BUILT_PROXY !== "1")(
  "the production build registers the admin proxy with the Node.js runtime",
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
    expect(manifest).toMatchObject({
      functions: {
        "/_middleware": {
          runtime: "nodejs",
          matchers: expect.arrayContaining([
            expect.objectContaining({ originalSource: "/admin" }),
            expect.objectContaining({
              originalSource: "/admin/((?!tuturuuu/login(?:/|$)).*)",
            }),
          ]),
        },
      },
    });
  },
);
