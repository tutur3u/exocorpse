import { gzipSync } from "node:zlib";

export function createCompressedSyncPayload(value: unknown) {
  const compressed = gzipSync(JSON.stringify(value));
  const body = new Uint8Array(compressed.byteLength);
  body.set(compressed);

  return {
    body,
    headers: {
      "Content-Encoding": "gzip",
      "Content-Type": "application/json",
    },
  };
}
