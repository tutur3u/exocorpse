import { describe, expect, test } from "bun:test";
import { adminCmsTheme } from "./admin-theme";

describe("legacy admin color themes", () => {
  test("keeps the pre-CMS wiki gradients distinct", () => {
    expect(adminCmsTheme("stories").button).toContain(
      "from-blue-600 to-purple-600",
    );
    expect(adminCmsTheme("worlds").button).toContain(
      "from-indigo-600 to-cyan-600",
    );
    expect(adminCmsTheme("characters").media).toContain(
      "from-green-400 via-emerald-400 to-teal-400",
    );
    expect(adminCmsTheme("factions").media).toContain(
      "from-purple-400 via-pink-400 to-rose-400",
    );
    expect(adminCmsTheme("locations").media).toContain(
      "from-amber-400 via-orange-400 to-red-400",
    );
  });
});
