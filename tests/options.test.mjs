import { afterEach, expect, jest, test } from "@jest/globals";
import {
  assertOpen,
  normalizeOptions,
  numberOption,
  resolveReconnectDelays,
  resolveToken,
} from "../src/options.mjs";

afterEach(() => {
  delete process.env.MCP_TOKEN;
  delete process.env.MCP_RECONNECT_BASE_DELAY;
  delete process.env.MCP_RECONNECT_MAX_DELAY;
});

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

test("resolves tokens from provider, option, or environment", async () => {
  process.env.MCP_TOKEN = "environment";
  const tokenProvider = jest.fn().mockResolvedValue("provider");
  expect(await resolveToken({ tokenProvider, token: "option" })).toBe("provider");
  expect(await resolveToken({ token: "option" })).toBe("option");
  expect(await resolveToken({})).toBe("environment");
});

test("resolves reconnect delays from defaults and environment", () => {
  expect(resolveReconnectDelays()).toEqual({ baseDelay: 1000, maxDelay: 60000 });
  process.env.MCP_RECONNECT_BASE_DELAY = "200";
  process.env.MCP_RECONNECT_MAX_DELAY = "900";
  expect(resolveReconnectDelays()).toEqual({ baseDelay: 200, maxDelay: 900 });
  expect(resolveReconnectDelays(300, 1200)).toEqual({ baseDelay: 300, maxDelay: 1200 });
});

test("uses safe reconnect delay defaults for invalid environment values", () => {
  process.env.MCP_RECONNECT_BASE_DELAY = "invalid";
  process.env.MCP_RECONNECT_MAX_DELAY = "invalid";
  expect(resolveReconnectDelays()).toEqual({ baseDelay: 1000, maxDelay: 60000 });
  process.env.MCP_RECONNECT_BASE_DELAY = "250";
  process.env.MCP_RECONNECT_MAX_DELAY = "100";
  expect(resolveReconnectDelays()).toEqual({ baseDelay: 250, maxDelay: 60000 });
});
