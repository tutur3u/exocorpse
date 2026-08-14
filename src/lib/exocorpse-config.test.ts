import { afterEach, describe, expect, it } from "bun:test";

import {
  EXOCORPSE_PRODUCTION_ORIGIN,
  getExocorpseAppBaseUrl,
} from "./exocorpse-config";

const originalEnvironment = {
  EXOCORPSE_APP_URL: process.env.EXOCORPSE_APP_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_EXOCORPSE_APP_URL: process.env.NEXT_PUBLIC_EXOCORPSE_APP_URL,
  VERCEL_ENV: process.env.VERCEL_ENV,
};

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("getExocorpseAppBaseUrl", () => {
  it("uses the registered canonical origin in Vercel production", () => {
    delete process.env.EXOCORPSE_APP_URL;
    delete process.env.NEXT_PUBLIC_EXOCORPSE_APP_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.VERCEL_ENV = "production";

    expect(
      getExocorpseAppBaseUrl("https://exocorpse-random-deployment.vercel.app"),
    ).toBe(EXOCORPSE_PRODUCTION_ORIGIN);
  });

  it("keeps the request origin for local and preview environments", () => {
    delete process.env.EXOCORPSE_APP_URL;
    delete process.env.NEXT_PUBLIC_EXOCORPSE_APP_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.VERCEL_ENV = "preview";

    expect(getExocorpseAppBaseUrl("http://localhost:3000/")).toBe(
      "http://localhost:3000",
    );
  });
});
