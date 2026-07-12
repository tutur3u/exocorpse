import { gunzipSync } from "node:zlib";
import { describe, expect, test } from "bun:test";
import { createCompressedSyncPayload } from "./tuturuuu-sync-payload";

describe("createCompressedSyncPayload", () => {
  test("compresses JSON and declares the request encoding", () => {
    const value = {
      manifest: { entries: Array.from({ length: 100 }, () => "entry") },
    };
    const payload = createCompressedSyncPayload(value);

    expect(payload.headers).toEqual({
      "Content-Encoding": "gzip",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(gunzipSync(payload.body).toString("utf8"))).toEqual(
      value,
    );
    expect(payload.body.byteLength).toBeLessThan(
      Buffer.byteLength(JSON.stringify(value)),
    );
  });
});
