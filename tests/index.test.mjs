import { expect, test } from "@jest/globals";
import mcpClient, * as clientApi from "../src/index.mjs";

test("exports the public client API", () => {
  expect(typeof mcpClient).toBe("function");
  expect(clientApi.mcpClient).toBe(mcpClient);
  expect(typeof clientApi.createTransport).toBe("function");
  expect(typeof clientApi.resolveAuthHeaders).toBe("function");
  expect(typeof clientApi.numberOption).toBe("function");
});
