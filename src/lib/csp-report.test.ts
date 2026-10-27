import { expect, test } from "bun:test";
import config from "../../next.config";
test("Report-Only policy sends violations to the local collector", async () => {
  const rules = await config.headers!();
  const policy = rules
    .flatMap((rule) => rule.headers)
    .find(
      (header) => header.key === "Content-Security-Policy-Report-Only",
    )?.value;
  expect(policy).toContain("report-uri /api/csp-report");
});
