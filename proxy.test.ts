import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { proxy } from "./src/proxy";

describe("admin proxy", () => {
  test("sends unauthenticated visitors to the state-issuing login route", () => {
    const response = proxy(
      new NextRequest("http://localhost:3000/admin?target=preview"),
    );
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/admin/tuturuuu/login");
    expect(location.searchParams.get("next")).toBe("preview");
  });

  test("keeps the state-issuing login route reachable", () => {
    const response = proxy(
      new NextRequest("http://localhost:3000/admin/tuturuuu/login"),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("Content-Security-Policy")).toContain(
      "'nonce-",
    );
  });
});
