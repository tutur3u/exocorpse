import { expect, test } from "bun:test";
import {
  parseStringArrayInput,
  stringArrayInputValue,
} from "./string-array-input";

test("stored arrays serialize without adding values", () => {
  expect(stringArrayInputValue(["one", "two"])).toBe("one\ntwo");
  expect(stringArrayInputValue(undefined)).toBe("");
});

test("multiline tag drafts normalize for storage without creating blank tags", () => {
  expect(parseStringArrayInput("first tag\n\nsecond tag, third tag\n")).toEqual(
    ["first tag", "second tag", "third tag"],
  );
  expect(parseStringArrayInput("\n  \n")).toEqual([]);
});
