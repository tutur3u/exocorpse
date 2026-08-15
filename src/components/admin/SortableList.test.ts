import { describe, expect, test } from "bun:test";
import { canReorderItems } from "./SortableList";

describe("sortable list affordances", () => {
  test("only enables reordering when an item can move", () => {
    expect(canReorderItems(0)).toBe(false);
    expect(canReorderItems(1)).toBe(false);
    expect(canReorderItems(2)).toBe(true);
  });
});
