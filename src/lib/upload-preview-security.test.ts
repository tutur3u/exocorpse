import { expect, test } from "bun:test";
import { resolve } from "node:path";

// Module mocks in the older route suites are process-global. Exercise the real
// routes/session/repository in a fresh process, with only platform I/O replaced.
for (const scenario of [
  "default-upsert",
  "upload-policy",
  "drive-upload-policy",
  "ids-and-paths",
  "explicit-auth",
  "session-outage",
  "logout",
  "preview",
  "served-file-headers",
]) {
  test(`upload/preview security: ${scenario}`, () => {
    const result = Bun.spawnSync(
      [
        process.execPath,
        "run",
        "scripts/security/upload-preview-check.ts",
        scenario,
      ],
      {
        cwd: resolve(import.meta.dir, "../.."),
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    expect(result.stderr.toString()).toBe("");
    expect(result.exitCode).toBe(0);
  });
}
