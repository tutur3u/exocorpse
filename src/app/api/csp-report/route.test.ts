import { expect, test } from "bun:test";
import { POST } from "./route";

test("collects only the directive without logging private report fields", async () => {
  const original = console.warn;
  const messages: unknown[][] = [];
  console.warn = (...args: unknown[]) => {
    messages.push(args);
  };
  try {
    const response = await POST(
      new Request("http://localhost/api/csp-report", {
        method: "POST",
        body: JSON.stringify({
          "csp-report": {
            "effective-directive": "script-src-elem",
            "document-uri": "https://example.com/private",
            "script-sample": "private",
          },
        }),
      }),
    );
    expect(response.status).toBe(204);
    expect(messages).toEqual([
      ["[csp-report]", { directive: "script-src-elem" }],
    ]);
  } finally {
    console.warn = original;
  }
});
test("rejects oversized and malformed reports", async () => {
  for (const [body, status] of [
    ["x".repeat(16 * 1024 + 1), 413],
    ["{}", 400],
    ["not json", 400],
  ] as const) {
    expect(
      (
        await POST(
          new Request("http://localhost/api/csp-report", {
            method: "POST",
            body,
          }),
        )
      ).status,
    ).toBe(status);
  }
});
