import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { config, proxy } from "./src/proxy";

describe("admin proxy", () => {
  test("sends unauthenticated visitors to the state-issuing login route", () => {
    const response = proxy(
      new NextRequest("http://localhost:3000/admin?target=preview"),
    );
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/admin/tuturuuu/login");
    expect(location.searchParams.get("next")).toBe("preview");
  });

  test("matcher excludes the login route itself", () => {
    const patterns = config.matcher
      .filter((matcher) => matcher !== "/admin")
      .map((matcher) => new RegExp(`^${matcher}$`));
    expect(patterns.length).toBeGreaterThan(0);
    const matches = (path: string) =>
      config.matcher.includes(path) || patterns.some((re) => re.test(path));
    expect(matches("/admin/tuturuuu/login")).toBe(false);
    expect(matches("/admin")).toBe(true);
    expect(matches("/admin/blog-posts")).toBe(true);
  });
});
