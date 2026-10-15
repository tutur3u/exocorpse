import { expect, test } from "bun:test";
import {
  parseStringArrayInput,
  reconcileStringArrayInput,
} from "./string-array-input";

test("controlled tag rerenders preserve Enter, blank lines and unfinished separators", () => {
  for (const text of [
    "first\n",
    "first\n\n",
    "first, ",
    "first\nsecond\n",
    "\n",
  ]) {
    const saved = parseStringArrayInput(text).join("\n");
    expect(reconcileStringArrayInput(text, saved)).toBe(text);
  }
  expect(reconcileStringArrayInput("old\n", "loaded\nvalues")).toBe(
    "loaded\nvalues",
  );
});

test("multiline tag drafts normalize for storage without creating blank tags", () => {
  expect(parseStringArrayInput("first tag\n\nsecond tag, third tag\n")).toEqual(
    ["first tag", "second tag", "third tag"],
  );
  expect(parseStringArrayInput("\n  \n")).toEqual([]);
});
