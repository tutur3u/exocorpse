import { expect, test } from "bun:test";
import { resolve } from "node:path";

test.skipIf(process.env.VERIFY_BUILT_DRIVE !== "1")(
  "the built Drive file response retains sandbox CSP and streams large files",
  () => {
    const result = Bun.spawnSync(
      [process.execPath, "run", "scripts/security/drive-built-check.ts"],
      {
        cwd: resolve(import.meta.dir, "../.."),
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    expect(result.stderr.toString()).toBe("");
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toContain(
      "Built Drive HTTP headers and 6 MiB streaming pass.",
    );
  },
  30_000,
);
