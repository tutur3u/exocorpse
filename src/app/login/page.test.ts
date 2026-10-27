import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import LoginPage from "./page";

async function redirectTarget(redirect?: string) {
  try {
    await LoginPage({ searchParams: Promise.resolve({ redirect }) });
  } catch (error) {
    const digest = (error as { digest?: string }).digest ?? "";
    // NEXT_REDIRECT;<type>;<url>;<status>;
    return digest.split(";")[2];
  }
  throw new Error("LoginPage did not redirect");
}

describe("/login entry point", () => {
  test("hands off to the state-issuing login route", async () => {
    expect(await redirectTarget("/admin")).toBe(
      "/admin/tuturuuu/login?next=dashboard",
    );
    expect(await redirectTarget("/admin?target=preview")).toBe(
      "/admin/tuturuuu/login?next=preview",
    );
  });

  test("falls back to a safe default target", async () => {
    for (const value of [
      undefined,
      "",
      "/admin/blog-posts",
      "https://evil.example/x",
      "//evil.example",
      "/admin?target=nope",
    ]) {
      expect(await redirectTarget(value)).toBe(
        "/admin/tuturuuu/login?next=library",
      );
    }
  });
});

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)
      ? [path]
      : [];
  });
}

describe("login entry points", () => {
  test("only the state-issuing route builds a centralized login URL, and it passes state", () => {
    const callers = sourceFiles(join(import.meta.dir, "../..")).filter(
      (file) =>
        /buildExocorpseCentralizedLoginUrl\(/.test(
          readFileSync(file, "utf8"),
        ) && !file.endsWith("lib/exocorpse-config.ts"),
    );
    expect(callers.map((file) => file.split("src/")[1])).toEqual([
      "app/admin/tuturuuu/login/route.ts",
    ]);
    const route = readFileSync(callers[0]!, "utf8");
    expect(route).toMatch(
      /buildExocorpseCentralizedLoginUrl\(\{[^}]*\bstate\b/,
    );
    expect(route).toMatch(/setExocorpseLoginStateCookie\(/);
  });
});
