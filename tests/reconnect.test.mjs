import { afterEach, expect, jest, test } from "@jest/globals";
import { createReconnect } from "../src/reconnect.mjs";

afterEach(() => {
  jest.useRealTimers();
});

test("schedules and clears a reconnect timer", () => {
  jest.useFakeTimers();
  const retry = createReconnect({
    connect: jest.fn(),
    isClosed: () => false,
    enabled: true,
    baseDelay: 10,
    maxDelay: 20,
    maxAttempts: 1,
    log: {},
  });
  retry.schedule();
  expect(jest.getTimerCount()).toBe(1);
  retry.clear();
  expect(jest.getTimerCount()).toBe(0);
});
