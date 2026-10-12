import { expect, test } from "@jest/globals";
import { assertOpen, normalizeOptions, numberOption } from "../src/options.mjs";

test("validates numeric options", () => {
  expect(numberOption("25", 1, 10)).toBe(25);
  expect(numberOption("25", 1)).toBe(25);
  expect(numberOption("bad", 1, 10)).toBe(1);
  expect(numberOption("5", 1, 10)).toBe(1);
  expect(numberOption("-1", 1, 0)).toBe(1);
});

test("guards a closed connection", () => {
  expect(() => assertOpen(true)).toThrow("MCP client is closed");
  expect(() => assertOpen(false)).not.toThrow();
});

test("normalizes absent options", () => {
  expect(normalizeOptions(null)).toEqual({});
  expect(normalizeOptions({ transport: "stdio" })).toEqual({ transport: "stdio" });
});
