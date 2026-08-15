import { afterEach, describe, expect, test } from "bun:test";
import { uploadCmsAssetDirect } from "./cms-asset-upload";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("direct CMS asset uploads", () => {
  test("keeps file bytes out of the server action and registers signed headers", async () => {
    const requests: Array<{ input: string; init?: RequestInit }> = [];
    globalThis.fetch = (async (input, init) => {
      requests.push({ input: String(input), init });
      if (String(input) === "/api/storage/signed-upload-url") {
        return Response.json({
          headers: { "x-upload-provider": "r2" },
          path: "external-projects/exocorpse/content/hero/test.png",
          signedUrl: "https://uploads.example.test/file",
          token: "upload-token",
        });
      }
      return new Response(null, { status: 200 });
    }) as typeof fetch;

    const file = new File(["image-bytes"], "test.png", {
      type: "image/png",
    });
    const path = await uploadCmsAssetDirect({
      collectionType: "content",
      entrySlug: "hero",
      file,
    });

    expect(path).toBe("external-projects/exocorpse/content/hero/test.png");
    expect(requests).toHaveLength(2);
    expect(requests[0]?.init?.body).toBe(
      JSON.stringify({
        contentType: "image/png",
        path: "content/hero/test.png",
        size: file.size,
        upsert: false,
      }),
    );
    expect(requests[1]?.init?.body).toBe(file);
    expect(requests[1]?.init?.headers).toEqual({
      Authorization: "Bearer upload-token",
      "Content-Type": "image/png",
      "x-upload-provider": "r2",
    });
  });

  test("retries provider uploads without a content type when required", async () => {
    let uploadAttempts = 0;
    globalThis.fetch = (async (input, init) => {
      if (String(input) === "/api/storage/signed-upload-url") {
        return Response.json({
          path: "external-projects/exocorpse/content/hero/test.png",
          signedUrl: "https://uploads.example.test/file",
        });
      }
      uploadAttempts += 1;
      if (uploadAttempts === 1) return new Response(null, { status: 403 });
      expect(init?.headers).toEqual({});
      return new Response(null, { status: 200 });
    }) as typeof fetch;

    await uploadCmsAssetDirect({
      collectionType: "content",
      entrySlug: "hero",
      file: new File(["image"], "test.png", { type: "image/png" }),
    });
    expect(uploadAttempts).toBe(2);
  });

  test("reports preparation and completion progress in fetch environments", async () => {
    const progress: number[] = [];
    globalThis.fetch = (async (input) => {
      if (String(input) === "/api/storage/signed-upload-url") {
        return Response.json({
          path: "external-projects/exocorpse/content/hero/test.png",
          signedUrl: "https://uploads.example.test/file",
        });
      }
      return new Response(null, { status: 200 });
    }) as typeof fetch;

    await uploadCmsAssetDirect({
      collectionType: "content",
      entrySlug: "hero",
      file: new File(["image"], "test.png", { type: "image/png" }),
      onProgress: (percentage) => progress.push(percentage),
    });

    expect(progress).toEqual([2, 96]);
  });
});
