import { existsSync } from "node:fs";

if (process.env.CI || process.env.VERCEL || !existsSync(".git")) {
  console.log("Skipping Git hook installation outside a local Git checkout.");
  process.exit(0);
}

const result = Bun.spawnSync(["bunx", "lefthook", "install"], {
  stderr: "inherit",
  stdout: "inherit",
});

process.exit(result.exitCode);
