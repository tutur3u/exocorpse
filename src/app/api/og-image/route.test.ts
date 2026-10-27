import { afterEach, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { GET } from "./route";

const originalFetch = globalThis.fetch;
function setFetch(
  implementation: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>,
) {
  globalThis.fetch = Object.assign(implementation, {
    preconnect: originalFetch.preconnect,
  });
}
afterEach(() => {
  globalThis.fetch = originalFetch;
});
const asset =
  "https://tuturuuu.com/api/v1/workspaces/ws/external-projects/assets/asset";
function request(src: string) {
  return new NextRequest(
    `http://localhost/api/og-image?${new URLSearchParams({ src })}`,
  );
}
for (const src of [
  "http://127.0.0.1/image",
  "https://example.com/image",
  "https://tuturuuu.com/other",
  asset.replace("tuturuuu.com", "user@tuturuuu.com"),
  asset.replace("tuturuuu.com", "tuturuuu.com:8443"),
]) {
  test(`rejects unapproved image destination ${src}`, async () => {
    let calls = 0;
    setFetch(async () => {
      calls++;
      return new Response(null, { status: 502 });
    });
    expect((await GET(request(src))).status).toBe(400);
    expect(calls).toBe(0);
  });
}
test("disables upstream caching and redirects and bounds the fetch deadline", async () => {
  let options: RequestInit | undefined;
  setFetch(async (_input, init) => {
    options = init;
    return new Response(null, {
      status: 302,
      headers: { location: "http://127.0.0.1/" },
    });
  });
  expect((await GET(request(asset))).status).toBe(502);
  expect(options?.redirect).toBe("error");
  expect(options?.cache).toBe("no-store");
  expect(options?.next?.revalidate).toBeUndefined();
  expect(options?.signal).toBeInstanceOf(AbortSignal);
});
for (const declared of [true, false]) {
  test(`caps ${declared ? "declared" : "streamed"} image bytes`, async () => {
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(5 * 1024 * 1024 + 1));
        controller.close();
      },
    });
    setFetch(
      async () =>
        new Response(body, {
          headers: declared
            ? { "content-length": String(5 * 1024 * 1024 + 1) }
            : {},
        }),
    );
    expect((await GET(request(asset))).status).toBe(413);
  });
}
test("transforms an approved image into the expected JPEG", async () => {
  const sharp = (await import("sharp")).default;
  const input = await sharp({
    create: { width: 2, height: 2, channels: 3, background: "red" },
  })
    .png()
    .toBuffer();
  setFetch(async () => new Response(new Uint8Array(input)));
  const response = await GET(request(asset));
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe("image/jpeg");
  const output = await sharp(
    Buffer.from(await response.arrayBuffer()),
  ).metadata();
  expect([output.width, output.height, output.format]).toEqual([
    1200,
    630,
    "jpeg",
  ]);
});
