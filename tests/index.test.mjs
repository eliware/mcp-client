import { expect, test } from "@jest/globals";
import { mcpClient } from "../src/index.mjs";

test("exports only the named client factory", async () => {
  const api = await import("../src/index.mjs");
  expect(Object.keys(api)).toEqual(["mcpClient"]);
  expect(api.mcpClient).toBe(mcpClient);
});
