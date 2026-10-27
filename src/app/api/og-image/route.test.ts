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
test("disables upstream caching and automatic redirects and bounds the fetch deadline", async () => {
  let options: RequestInit | undefined;
  setFetch(async (_input, init) => {
    options = init;
    return new Response(null, {
      status: 302,
      headers: { location: "http://127.0.0.1/" },
    });
  });
  expect((await GET(request(asset))).status).toBe(502);
  expect(options?.redirect).toBe("manual");
  expect(options?.cache).toBe("no-store");
  expect(options?.next?.revalidate).toBeUndefined();
  expect(options?.signal).toBeInstanceOf(AbortSignal);
});
const signedAsset =
  "https://nzamlzqfdwaaxdefwraj.supabase.co/storage/v1/object/sign/assets/image.png?token=test";
test("follows one verified CMS storage redirect and preserves JPEG output", async () => {
  const sharp = (await import("sharp")).default;
  const input = await sharp({
    create: { width: 2, height: 2, channels: 3, background: "red" },
  })
    .png()
    .toBuffer();
  const calls: Array<{ input: string; options: RequestInit | undefined }> = [];
  setFetch(async (url, options) => {
    calls.push({ input: String(url), options });
    return calls.length === 1
      ? new Response(null, { status: 307, headers: { location: signedAsset } })
      : new Response(new Uint8Array(input));
  });
  const response = await GET(request(asset));
  expect(response.status).toBe(200);
  expect(calls.map((call) => call.input)).toEqual([asset, signedAsset]);
  expect(calls.map((call) => call.options?.redirect)).toEqual([
    "manual",
    "manual",
  ]);
  expect(calls.map((call) => call.options?.cache)).toEqual([
    "no-store",
    "no-store",
  ]);
  expect(calls[0]?.options?.signal).toBe(calls[1]?.options?.signal);
  const metadata = await sharp(
    Buffer.from(await response.arrayBuffer()),
  ).metadata();
  expect([metadata.width, metadata.height, metadata.format]).toEqual([
    1200,
    630,
    "jpeg",
  ]);
  expect(response.headers.get("Vercel-CDN-Cache-Control")).toContain(
    "max-age=86400",
  );
});
for (const location of [
  "http://nzamlzqfdwaaxdefwraj.supabase.co/storage/v1/object/sign/assets/image.png",
  "https://127.0.0.1/storage/v1/object/sign/assets/image.png",
  "https://other.supabase.co/storage/v1/object/sign/assets/image.png",
  "https://nzamlzqfdwaaxdefwraj.supabase.co.evil.test/storage/v1/object/sign/assets/image.png",
  "https://user@nzamlzqfdwaaxdefwraj.supabase.co/storage/v1/object/sign/assets/image.png",
  "https://nzamlzqfdwaaxdefwraj.supabase.co:8443/storage/v1/object/sign/assets/image.png",
  "https://nzamlzqfdwaaxdefwraj.supabase.co/storage/v1/object/public/assets/image.png",
]) {
  test(`rejects untrusted storage redirect ${location}`, async () => {
    let calls = 0;
    setFetch(async () => {
      calls++;
      return new Response(null, { status: 302, headers: { location } });
    });
    expect((await GET(request(asset))).status).toBe(502);
    expect(calls).toBe(1);
  });
}
test("rejects a second redirect without fetching its destination", async () => {
  let calls = 0;
  setFetch(async () => {
    calls++;
    return new Response(null, {
      status: 302,
      headers: { location: signedAsset },
    });
  });
  expect((await GET(request(asset))).status).toBe(502);
  expect(calls).toBe(2);
});
test("caps bytes after a verified storage redirect", async () => {
  let calls = 0;
  setFetch(async () => {
    calls++;
    if (calls === 1)
      return new Response(null, {
        status: 302,
        headers: { location: signedAsset },
      });
    return new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(5 * 1024 * 1024 + 1));
          controller.close();
        },
      }),
    );
  });
  expect((await GET(request(asset))).status).toBe(413);
  expect(calls).toBe(2);
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
