import { expect, test } from "@jest/globals";
import { resolveAuthHeaders } from "../src/auth-headers.mjs";

test("preserves custom headers without a token", () => {
  const headers = { "x-app": "test" };
  expect(resolveAuthHeaders(undefined, headers)).toBe(headers);
});

test("adds a bearer token and replaces an existing authorization value", () => {
  expect(resolveAuthHeaders("token", { Authorization: "Basic old", "x-app": "test" })).toEqual({
    Authorization: "Bearer token",
    "x-app": "test",
  });
});

test("adds a bearer token when no custom headers exist", () => {
  expect(resolveAuthHeaders("token")).toEqual({ Authorization: "Bearer token" });
});
