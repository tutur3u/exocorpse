import { afterEach, beforeEach, expect, mock, spyOn, test } from "bun:test";
import { POST } from "./route";

let windowTime = Date.now();
beforeEach(() => {
  windowTime += 120_000;
  spyOn(Date, "now").mockReturnValue(windowTime);
});
afterEach(() => mock.restore());

function reportRequest(ip: string, identityHeader = "x-vercel-forwarded-for") {
  return new Request("http://localhost/api/csp-report", {
    method: "POST",
    headers: { [identityHeader]: ip },
    body: JSON.stringify({
      "csp-report": { "effective-directive": "script-src" },
    }),
  });
}

test("collects only the directive without logging private report fields", async () => {
  const original = console.warn;
  const messages: unknown[][] = [];
  console.warn = (...args: unknown[]) => {
    messages.push(args);
  };
  try {
    const response = await POST(
      new Request("http://localhost/api/csp-report", {
        method: "POST",
        body: JSON.stringify({
          "csp-report": {
            "effective-directive": "script-src-elem",
            "document-uri": "https://example.com/private",
            "script-sample": "private",
          },
        }),
      }),
    );
    expect(response.status).toBe(204);
    expect(messages).toEqual([
      ["[csp-report]", { directive: "script-src-elem", policy: "report" }],
    ]);
  } finally {
    console.warn = original;
  }
});
test("rejects oversized and malformed reports", async () => {
  for (const [body, status] of [
    ["x".repeat(16 * 1024 + 1), 413],
    ["{}", 400],
    ["not json", 400],
  ] as const) {
    expect(
      (
        await POST(
          new Request("http://localhost/api/csp-report", {
            method: "POST",
            body,
          }),
        )
      ).status,
    ).toBe(status);
  }
});

test("rate limits an IP before body parsing or logging and recovers next window", async () => {
  const log = spyOn(console, "warn").mockImplementation(() => {});
  for (let i = 0; i < 10; i++) {
    expect((await POST(reportRequest("192.0.2.1"))).status).toBe(204);
  }
  const rejected = reportRequest("192.0.2.1");
  Object.defineProperty(rejected, "body", {
    get() {
      throw new Error("Body must not be read");
    },
  });
  const response = await POST(rejected);
  expect(response.status).toBe(429);
  expect(await response.text()).toBe("");
  expect(log).toHaveBeenCalledTimes(10);
  expect((await POST(reportRequest("192.0.2.2"))).status).toBe(204);
  spyOn(Date, "now").mockReturnValue(windowTime + 60_000);
  expect((await POST(reportRequest("192.0.2.1"))).status).toBe(204);
});

test("global cap rejects reports even when each IP is new", async () => {
  const log = spyOn(console, "warn").mockImplementation(() => {});
  for (let i = 1; i <= 120; i++) {
    expect((await POST(reportRequest(`198.51.100.${i}`))).status).toBe(204);
  }
  const response = await POST(reportRequest("203.0.113.1"));
  expect(response.status).toBe(429);
  expect(await response.text()).toBe("");
  expect(log).toHaveBeenCalledTimes(120);
});

for (const identitySource of ["platform", "real-ip", "fallback"] as const) {
  test(`rotating raw XFF cannot bypass the ${identitySource} identity bucket`, async () => {
    const log = spyOn(console, "warn").mockImplementation(() => {});
    for (let i = 1; i <= 11; i++) {
      const request = reportRequest(`198.51.100.${i}`, "x-forwarded-for");
      if (identitySource === "platform") {
        request.headers.set("x-vercel-forwarded-for", "192.0.2.10");
        request.headers.set("x-real-ip", `203.0.113.${i}`);
      } else if (identitySource === "real-ip") {
        request.headers.set("x-real-ip", "192.0.2.10");
      }
      const response = await POST(request);
      expect(response.status).toBe(i <= 10 ? 204 : 429);
      if (i === 11) expect(await response.text()).toBe("");
    }
    expect(log).toHaveBeenCalledTimes(10);
  });
}

for (const header of ["x-vercel-forwarded-for", "x-real-ip"]) {
  for (const suffixLength of [8, 4096]) {
    test(`${header} rejects rotating IPv6 zone suffixes of length ${suffixLength}`, async () => {
      const log = spyOn(console, "warn").mockImplementation(() => {});
      for (let i = 1; i <= 11; i++) {
        const request = reportRequest(
          `fe80::1%${"z".repeat(suffixLength)}${i}`,
          header,
        );
        if (header === "x-vercel-forwarded-for") {
          request.headers.set("x-real-ip", "192.0.2.10");
        }
        const response = await POST(request);
        expect(response.status).toBe(i <= 10 ? 204 : 429);
        if (i === 11) expect(await response.text()).toBe("");
      }
      expect(log).toHaveBeenCalledTimes(10);
    });
  }
}

for (const header of ["x-vercel-forwarded-for", "x-real-ip"]) {
  test(`${header} enforces the raw length cap before trimming`, async () => {
    const log = spyOn(console, "warn").mockImplementation(() => {});
    for (let i = 1; i <= 11; i++) {
      const request = reportRequest("", header);
      if (header === "x-vercel-forwarded-for") {
        request.headers.set("x-real-ip", "192.0.2.10");
      }
      const getHeader = request.headers.get.bind(request.headers);
      spyOn(request.headers, "get").mockImplementation((name) =>
        name === header ? `${" ".repeat(65)}198.51.100.${i}` : getHeader(name),
      );
      const response = await POST(request);
      expect(response.status).toBe(i <= 10 ? 204 : 429);
      if (i === 11) expect(await response.text()).toBe("");
    }
    expect(log).toHaveBeenCalledTimes(10);
  });
}

test("enforcing reports log their policy without trusting body disposition or leaking URLs", async () => {
  const log = spyOn(console, "warn").mockImplementation(() => {});
  const response = await POST(
    new Request("http://localhost/api/csp-report?policy=enforce", {
      method: "POST",
      body: JSON.stringify({
        "csp-report": {
          "effective-directive": "script-src-elem",
          disposition: "report",
          "document-uri": "https://example.com/private?token=secret",
          "script-sample": "private",
        },
      }),
    }),
  );
  expect(response.status).toBe(204);
  expect(log.mock.calls).toEqual([
    ["[csp-report]", { directive: "script-src-elem", policy: "enforce" }],
  ]);
});

function enforcingRequest(ip: string) {
  const request = reportRequest(ip);
  return new Request("http://localhost/api/csp-report?policy=enforce", request);
}

test("report-only exhaustion cannot consume the enforcing IP bucket", async () => {
  spyOn(console, "warn").mockImplementation(() => {});
  for (let i = 0; i < 10; i++)
    expect((await POST(reportRequest("192.0.2.1"))).status).toBe(204);
  expect((await POST(reportRequest("192.0.2.1"))).status).toBe(429);
  for (let i = 0; i < 10; i++)
    expect((await POST(enforcingRequest("192.0.2.1"))).status).toBe(204);
  const rejected = enforcingRequest("192.0.2.1");
  Object.defineProperty(rejected, "body", {
    get() {
      throw new Error("Body must not be read");
    },
  });
  expect((await POST(rejected)).status).toBe(429);
  spyOn(Date, "now").mockReturnValue(windowTime + 60_000);
  expect((await POST(enforcingRequest("192.0.2.1"))).status).toBe(204);
});

test("global budgets are independently bounded for both policy endpoints", async () => {
  spyOn(console, "warn").mockImplementation(() => {});
  for (let i = 1; i <= 120; i++)
    expect((await POST(reportRequest(`198.51.100.${i}`))).status).toBe(204);
  expect((await POST(reportRequest("203.0.113.1"))).status).toBe(429);
  for (let i = 1; i <= 120; i++)
    expect((await POST(enforcingRequest(`198.51.100.${i}`))).status).toBe(204);
  expect((await POST(enforcingRequest("203.0.113.1"))).status).toBe(429);
});
