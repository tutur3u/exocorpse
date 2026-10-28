import { mock } from "bun:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest, NextResponse } from "next/server";

mock.module("server-only", () => ({}));
let cookie: string | null = null;
let cleared = false;
mock.module("next/headers", () => ({
  cookies: async () => ({
    get: () => (cookie ? { value: cookie } : undefined),
    set: (
      name: string,
      value: string,
      options: { expires?: Date; path?: string },
    ) => {
      cleared =
        name === "exocorpse_tuturuuu_admin_session" &&
        value === "" &&
        options.expires?.getTime() === 0 &&
        options.path === "/";
    },
  }),
}));
mock.module("next/navigation", () => ({
  redirect: () => {
    throw new Error("redirect");
  },
}));
mock.module("next/cache", () => ({
  cacheLife() {},
  cacheTag() {},
  updateTag() {},
}));
process.env.TUTURUUU_API_BASE_URL = "https://platform.example.test/api/v1";
process.env.TUTURUUU_EXOCORPSE_WORKSPACE_ID = "ws-fixture";
process.env.EXOCORPSE_SESSION_SECRET = "test-only-session-secret";
const session = await import("../../src/lib/exocorpse-session");
function signIn() {
  const response = NextResponse.json({});
  session.setExocorpseSessionCookie(response, {
    accessToken: "test-only-access-token",
    app: { name: "exocorpse" },
    expiresAt: new Date(Date.now() + 600_000).toISOString(),
    tokenType: "Bearer",
    user: { id: "user-fixture", email: "fixture@example.test" },
    workspaceId: "ws-fixture",
  });
  cookie =
    response.cookies.get("exocorpse_tuturuuu_admin_session")?.value ?? null;
}
signIn();
const calls: Array<{ url: string; init?: RequestInit }> = [];
const signedUrl =
  "https://nzamlzqfdwaaxdefwraj.supabase.co/storage/v1/object/sign/assets/file?token=fixture";
let validationStatus = 200;
let storageType = "text/html";
let storageLocation = signedUrl;
let storageStatus = 200;
let storageBytes: Uint8Array<ArrayBuffer> | undefined;
let storageStream: ReadableStream<Uint8Array> | undefined;
const originalFetch = globalThis.fetch;
globalThis.fetch = Object.assign(
  async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith("/summary"))
      return Response.json({}, { status: validationStatus });
    calls.push({ url, init });
    if (url.startsWith("https://nzamlzqfdwaaxdefwraj.supabase.co/"))
      return new Response(storageStream ?? storageBytes ?? "fixture file", {
        status: storageStatus,
        headers: {
          "Content-Type": storageType,
          Location: "https://127.0.0.1/private",
        },
      });
    if (url.includes("filePath="))
      return Response.json({
        data: { signedUrl: storageLocation, expiresIn: 60 },
      });
    return Response.json({
      path: "external-projects/ws-fixture/characters/hero/test.png",
      signedUrl,
    });
  },
  { preconnect: originalFetch.preconnect },
);
const upload =
  await import("../../src/app/api/storage/signed-upload-url/route");
const drive = await import("../../src/app/api/admin/drive/route");
const team = await import("../../src/app/api/admin/team/route");
const asset =
  await import("../../src/app/api/admin/cms/assets/[assetId]/route");
const repository = await import("../../src/lib/tuturuuu-cms-repository");
const integrations = await import("../../src/lib/tuturuuu-admin-integrations");
const uploadBody = {
  path: "characters/hero/test.png",
  contentType: "image/png",
  size: 123,
};
const req = (path: string, body: unknown, method = "POST") =>
  new NextRequest(`https://app.example.test${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Origin: "https://app.example.test",
    },
    body: JSON.stringify(body),
  });
const post = (body: unknown) =>
  upload.POST(req("/api/storage/signed-upload-url", body));
switch (process.argv[2]) {
  case "default-upsert": {
    assert.equal((await post(uploadBody)).status, 200);
    assert.equal(JSON.parse(String(calls.at(-1)?.init?.body)).upsert, false);
    calls.length = 0;
    assert.equal((await post({ ...uploadBody, upsert: true })).status, 400);
    assert.equal(calls.length, 0);
    break;
  }
  case "upload-policy": {
    for (const body of [
      {
        ...uploadBody,
        contentType: "image/svg+xml",
        path: "characters/hero/test.svg",
      },
      {
        ...uploadBody,
        contentType: "text/html",
        path: "characters/hero/test.html",
      },
      {
        ...uploadBody,
        contentType: "application/xml",
        path: "characters/hero/test.xml",
      },
      { ...uploadBody, path: "characters/hero/test.svg" },
      { ...uploadBody, path: "unknown/hero/test.png" },
      { ...uploadBody, path: "drive/hero/test.png" },
      { ...uploadBody, path: "characters/../test.png" },
      { ...uploadBody, path: "characters/hero/folder/test.png" },
      { ...uploadBody, path: "characters/hero/..\\test.png" },
      { ...uploadBody, path: "/characters/hero/test.png" },
      { ...uploadBody, path: "characters/%2e%2e/test.png" },
      { ...uploadBody, size: 51 * 1024 * 1024 },
      { ...uploadBody, size: -1 },
      { ...uploadBody, size: 1.5 },
      { ...uploadBody, size: undefined },
      { ...uploadBody, contentType: undefined },
    ]) {
      calls.length = 0;
      assert.equal((await post(body)).status, 400, JSON.stringify(body));
      assert.equal(calls.length, 0);
    }
    assert.equal(
      (await post({ ...uploadBody, size: 50 * 1024 * 1024 })).status,
      200,
    );
    assert.equal(
      (
        await post({
          path: "stories/hero/music.mp3",
          contentType: "audio/mpeg",
          size: 123,
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await post({
          path: "characters/hero/music.mp3",
          contentType: "audio/mpeg",
          size: 123,
        })
      ).status,
      400,
    );
    break;
  }
  case "drive-upload-policy": {
    const body = {
      action: "upload-url",
      directory: "drive/root/art",
      filename: "test.png",
      contentType: "image/png",
      size: 123,
    };
    for (const input of [
      { ...body, filename: "test.html", contentType: "text/html" },
      { ...body, filename: "test.svg", contentType: "image/png" },
      { ...body, directory: "characters/hero" },
      { ...body, directory: "drive/root/../hero" },
      { ...body, size: 51 * 1024 * 1024 },
      { ...body, filename: "../test.png" },
    ]) {
      calls.length = 0;
      assert.equal(
        (await drive.POST(req("/api/admin/drive", input))).status,
        400,
      );
      assert.equal(calls.length, 0);
    }
    assert.equal((await drive.POST(req("/api/admin/drive", body))).status, 200);
    assert.equal(
      JSON.parse(String(calls.at(-1)?.init?.body)).entrySlug,
      "root/art",
    );
    assert.equal(JSON.parse(String(calls.at(-1)?.init?.body)).upsert, false);
    break;
  }
  case "ids-and-paths": {
    for (const id of ["..", ".", "a/b", "%2e%2e", "bad?query", "a\\b"]) {
      for (const operation of [
        () => repository.deleteExocorpseCmsEntry(id),
        () => repository.deleteExocorpseCmsAsset(id),
        () =>
          repository.getExocorpseCmsAssetPreviewResponse(
            id,
            new URLSearchParams(),
          ),
        () =>
          repository.updateExocorpseCmsEntryBundle(id, "now", {
            entry: {},
            blocks: [],
            relations: [],
          }),
        () =>
          repository.reorderExocorpseCmsAssets([{ assetId: id, sortOrder: 0 }]),
        () => integrations.addExocorpseTeamRoleMember(id, "user-fixture"),
        () => integrations.removeExocorpseTeamRoleMember("role-fixture", id),
      ]) {
        calls.length = 0;
        await assert.rejects(async () => operation());
        assert.equal(calls.length, 0);
      }
    }
    await integrations.getExocorpseDriveListing(
      new URLSearchParams({ path: "drive/root", unexpected: "x", limit: "10" }),
    );
    assert.equal(
      new URL(calls.at(-1)!.url).searchParams.has("unexpected"),
      false,
    );
    await assert.rejects(async () =>
      integrations.getExocorpseDriveReadUrl("drive/root/../secret"),
    );
    break;
  }
  case "explicit-auth": {
    cookie = null;
    const handlers = [
      () => post(null),
      () => drive.GET(new Request("https://app.example.test/api/admin/drive")),
      () => drive.POST(req("/api/admin/drive", null)),
      () => drive.PATCH(req("/api/admin/drive", null, "PATCH")),
      () => drive.DELETE(req("/api/admin/drive", null, "DELETE")),
      () => team.GET(),
      () => team.POST(req("/api/admin/team", null)),
      () => team.DELETE(req("/api/admin/team", null, "DELETE")),
      () =>
        asset.GET(
          new Request("https://app.example.test/api/admin/cms/assets/bad"),
          { params: Promise.resolve({ assetId: ".." }) },
        ),
    ];
    for (const handler of handlers) assert.equal((await handler()).status, 401);
    assert.equal(calls.length, 0);
    break;
  }
  case "session-outage": {
    for (const status of [429, 500, 503]) {
      validationStatus = status;
      assert.equal(await session.getExocorpseSessionFromCookies(), null);
    }
    globalThis.fetch = Object.assign(
      async () => {
        throw new Error("offline");
      },
      { preconnect: originalFetch.preconnect },
    );
    assert.equal(await session.getExocorpseSessionFromCookies(), null);
    break;
  }
  case "logout": {
    const { logout } = await import("../../src/lib/actions/auth");
    await assert.rejects(logout, /redirect/);
    assert.equal(cleared, true);
    break;
  }
  case "preview": {
    const source = await readFile(
      "src/components/admin/AdminDriveManager.tsx",
      "utf8",
    );
    // Static JSX security invariant covers the original exploit without needing
    // a browser or replacing React hooks just to open the modal.
    for (const iframe of source.matchAll(/<iframe\b[\s\S]*?\/>/g)) {
      assert.match(iframe[0], /sandbox="(?:|allow-downloads)"/);
    }
    assert.match(source, /<AdminDriveFilePreview/);
    const { default: Preview } =
      await import("../../src/components/admin/AdminDriveFilePreview");
    const url = "/api/admin/drive?filePath=drive%2Froot%2Ffile&content=1";
    for (const [name, contentType, tag] of [
      ["invoice.html", "text/html", null],
      ["drawing.svg", "image/svg+xml", null],
      ["document.pdf", "application/pdf", null],
      ["readme.txt", "text/plain", null],
      ["test.png", "image/png", "img"],
      ["music.mp3", "audio/mpeg", "audio"],
      ["movie.mp4", "video/mp4", "video"],
      ["disguised.svg", "image/png", null],
    ] as const) {
      const html = renderToStaticMarkup(
        createElement(Preview, {
          url,
          item: {
            name,
            contentType,
            path: `drive/root/${name}`,
            kind: "file",
            size: 123,
            createdAt: null,
            updatedAt: null,
          },
        }),
      );
      assert.doesNotMatch(html, /<iframe|<object|<embed/);
      assert.match(html, /download=/);
      assert.match(html, /&amp;download=1/);
      if (tag) assert.match(html, new RegExp(`<${tag} `));
      else assert.doesNotMatch(html, /<img|<audio|<video/);
    }
    break;
  }
  case "served-file-headers": {
    const response = await drive.GET(
      new Request(
        "https://app.example.test/api/admin/drive?filePath=drive%2Froot%2Flegacy.html&content=1",
      ),
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
    assert.match(
      response.headers.get("Content-Disposition") ?? "",
      /^attachment;/,
    );
    assert.equal(
      response.headers.get("Content-Type"),
      "application/octet-stream",
    );
    assert.equal(await response.text(), "fixture file");
    storageType = "image/png";
    const image = await drive.GET(
      new Request(
        "https://app.example.test/api/admin/drive?filePath=drive%2Froot%2Ftest.png&content=1",
      ),
    );
    assert.equal(image.headers.get("Content-Type"), "image/png");
    assert.match(image.headers.get("Content-Disposition") ?? "", /^inline;/);
    const forcedDownload = await drive.GET(
      new Request(
        "https://app.example.test/api/admin/drive?filePath=drive%2Froot%2Ftest.png&content=1&download=1",
      ),
    );
    assert.match(
      forcedDownload.headers.get("Content-Disposition") ?? "",
      /^attachment;/,
    );
    assert.equal(
      forcedDownload.headers.get("X-Content-Type-Options"),
      "nosniff",
    );
    assert.match(forcedDownload.headers.get("Cache-Control") ?? "", /no-store/);
    for (const location of [
      "https://127.0.0.1/private",
      "http://nzamlzqfdwaaxdefwraj.supabase.co/storage/v1/object/sign/x",
      "https://other.supabase.co/storage/v1/object/sign/x",
      "not a url",
    ]) {
      storageLocation = location;
      calls.length = 0;
      const rejected = await drive.GET(
        new Request(
          "https://app.example.test/api/admin/drive?filePath=drive%2Froot%2Ftest.png&content=1",
        ),
      );
      assert.equal(rejected.status, 502);
      assert.equal(calls.length, 1);
    }
    storageLocation = signedUrl;
    storageStatus = 302;
    calls.length = 0;
    const redirected = await drive.GET(
      new Request(
        "https://app.example.test/api/admin/drive?filePath=drive%2Froot%2Ftest.png&content=1",
      ),
    );
    assert.equal(redirected.status, 502);
    assert.equal(calls.length, 2);
    assert.equal(calls.at(-1)?.init?.redirect, "manual");
    storageStatus = 200;
    storageBytes = new Uint8Array(50 * 1024 * 1024 + 1);
    const oversized = await drive.GET(
      new Request(
        "https://app.example.test/api/admin/drive?filePath=drive%2Froot%2Ftest.png&content=1",
      ),
    );
    assert.equal(oversized.status, 200);
    await assert.rejects(() => oversized.arrayBuffer(), /byte limit/);
    storageBytes = undefined;
    storageLocation = "https://127.0.0.1/private";
    const unsafe = await drive.GET(
      new Request(
        "https://app.example.test/api/admin/drive?filePath=drive%2Froot%2Ftest.png&content=1",
      ),
    );
    assert.equal(unsafe.status, 502);
    break;
  }
  case "existing-drive-paths": {
    for (const name of [
      "My Art (final).png",
      "Art & Stuff",
      "[WIP] sketch.png",
      "_drafts",
      "O'Neil.png",
      "a+b.png",
      "画像.png",
    ]) {
      const path = `drive/root/${name}`;
      await integrations.getExocorpseDriveReadUrl(path);
      await integrations.getExocorpseDriveListing(
        new URLSearchParams({ path }),
      );
      await integrations.renameExocorpseDriveEntry({
        kind: "file",
        path,
        newName: "renamed.png",
      });
      await integrations.deleteExocorpseDriveEntry({ kind: "file", path });
      assert.equal(
        (
          await drive.GET(
            new Request(
              `https://app.example.test/api/admin/drive?${new URLSearchParams({ filePath: path, content: "1" })}`,
            ),
          )
        ).status,
        200,
      );
    }
    for (const path of [
      "drive/root/../x",
      "drive/root/a..b",
      "drive/root/%2e%2e",
      "drive/root/%252e%252e",
      "drive/root/a\\b",
      "drive/root/a\u0000b",
      "drive/root/a\u202eb",
      "drive/root/a\u2066b",
      "/drive/root/a",
      "drive/root//a",
      "drive/roots/a",
      "characters/root/a",
      "drive/root/",
    ]) {
      calls.length = 0;
      await assert.rejects(
        async () => integrations.getExocorpseDriveReadUrl(path),
        path,
      );
      assert.equal(calls.length, 0);
    }
    await assert.rejects(async () =>
      integrations.renameExocorpseDriveEntry({
        kind: "file",
        path: "drive/root/My Art (final).png",
        newName: "bad&name.png",
      }),
    );
    break;
  }
  case "streamed-files": {
    storageType = "image/png";
    let finish = () => {};
    storageStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(3 * 1024 * 1024).fill(1));
        finish = () => {
          controller.enqueue(new Uint8Array(3 * 1024 * 1024).fill(2));
          controller.close();
        };
      },
    });
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const response = await Promise.race([
        drive.GET(
          new Request(
            "https://app.example.test/api/admin/drive?filePath=drive%2Froot%2Flarge.png&content=1",
          ),
        ),
        new Promise<null>((resolve) => {
          timer = setTimeout(() => resolve(null), 1000);
        }),
      ]);
      assert.ok(
        response,
        "The response must start before the storage stream finishes",
      );
      assert.equal(response.headers.get("Content-Length"), null);
      assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
      assert.match(
        response.headers.get("Content-Disposition") ?? "",
        /^inline;/,
      );
      assert.match(
        response.headers.get("Content-Security-Policy") ?? "",
        /sandbox/,
      );
      const reader = response.body!.getReader();
      const first = await reader.read();
      assert.equal(first.value?.byteLength, 3 * 1024 * 1024);
      finish();
      const second = await reader.read();
      assert.equal(second.value?.byteLength, 3 * 1024 * 1024);
      assert.equal((await reader.read()).done, true);
    } finally {
      clearTimeout(timer);
    }
    break;
  }
  case "drive-downloads": {
    for (const [filename, contentType] of [
      ["archive.zip", "application/zip"],
      ["document.pdf", "application/pdf"],
      [
        "document.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      [
        "sheet.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
      [
        "slides.pptx",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ],
      ["table.csv", "text/csv"],
      ["data.json", "application/json"],
      ["readme.txt", "text/plain"],
      ["art.psd", "image/vnd.adobe.photoshop"],
      ["art.clip", "application/octet-stream"],
      ["art.kra", "application/x-krita"],
      ["archive.7z", "application/x-7z-compressed"],
    ]) {
      const response = await drive.POST(
        req("/api/admin/drive", {
          action: "upload-url",
          directory: "drive/root",
          filename,
          contentType,
          size: 123,
        }),
      );
      assert.equal(response.status, 200, filename);
      storageType = contentType;
      const file = await drive.GET(
        new Request(
          `https://app.example.test/api/admin/drive?${new URLSearchParams({ filePath: `drive/root/${filename}`, content: "1" })}`,
        ),
      );
      assert.equal(
        file.headers.get("Content-Type"),
        "application/octet-stream",
      );
      assert.match(
        file.headers.get("Content-Disposition") ?? "",
        /^attachment;/,
      );
      assert.equal(file.headers.get("X-Content-Type-Options"), "nosniff");
    }
    for (const [filename, contentType] of [
      ["bad.html", "text/html"],
      ["bad.xhtml", "application/xhtml+xml"],
      ["bad.xml", "application/xml"],
      ["bad.svg", "image/svg+xml"],
      ["bad.js", "text/javascript"],
      ["bad.html", "application/octet-stream"],
      ["bad.bin", "text/html"],
    ]) {
      assert.equal(
        (
          await drive.POST(
            req("/api/admin/drive", {
              action: "upload-url",
              directory: "drive/root",
              filename,
              contentType,
              size: 123,
            }),
          )
        ).status,
        400,
      );
    }
    break;
  }
  case "unique-filenames": {
    const { uploadCmsAssetDirect } =
      await import("../../src/lib/cms-asset-upload");
    async function storedName(name: string) {
      calls.length = 0;
      await uploadCmsAssetDirect({
        collectionType: "characters",
        entrySlug: "hero",
        file: new File(["fixture"], name, { type: "image/png" }),
      });
      const metadata = calls.find(
        (call) => call.url === "/api/storage/signed-upload-url",
      );
      return (
        String(JSON.parse(String(metadata?.init?.body)).path)
          .split("/")
          .at(-1) ?? ""
      );
    }
    const first = await storedName("portrait.png");
    const second = await storedName("portrait.png");
    assert.notEqual(first, second);
    assert.match(first, /^portrait-[a-f0-9-]+\.png$/);
    assert.match(await storedName("画像.png"), /^upload-[a-f0-9-]+\.png$/);
    for (const name of [
      "../bad.png",
      "a".repeat(300) + ".png",
      "[WIP] picture.png",
      "画像.png",
    ]) {
      const stored = await storedName(name);
      assert.ok(stored.length <= 160);
      assert.ok(!stored.includes(".."));
      assert.equal(
        (await post({ ...uploadBody, path: `characters/hero/${stored}` }))
          .status,
        200,
      );
    }
    break;
  }
  case "m4a-alias": {
    assert.equal(
      (
        await post({
          path: "stories/hero/music.m4a",
          contentType: "audio/x-m4a",
          size: 123,
        })
      ).status,
      200,
    );
    break;
  }
  default:
    throw new Error("Unknown scenario");
}
