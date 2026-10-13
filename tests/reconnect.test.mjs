import { afterEach, expect, jest, test } from "@jest/globals";
import { createReconnect, createTransportBinding } from "../src/reconnect.mjs";

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
    maxAttempts: 2,
    log: {},
  });
  retry.schedule();
  expect(jest.getTimerCount()).toBe(1);
  retry.clear();
  expect(jest.getTimerCount()).toBe(0);
  retry.schedule();
  expect(jest.getTimerCount()).toBe(1);
  retry.clear();
});

test("logs a failed reconnect and schedules the next attempt", async () => {
  jest.useFakeTimers();
  const log = { error: jest.fn() };
  const retry = createReconnect({
    connect: jest.fn().mockRejectedValue(new Error("offline")),
    isClosed: () => false,
    enabled: true,
    baseDelay: 5,
    maxDelay: 10,
    maxAttempts: 2,
    log,
  });
  retry.schedule();
  await jest.advanceTimersByTimeAsync(5);
  expect(log.error).toHaveBeenCalledWith("MCP reconnect failed", expect.any(Error));
  expect(jest.getTimerCount()).toBe(1);
  retry.clear();
});

test("does not schedule retries when closed, disabled, or limited", () => {
  jest.useFakeTimers();
  const connect = jest.fn();
  const options = {
    connect,
    isClosed: () => false,
    enabled: true,
    baseDelay: 5,
    maxDelay: 10,
    maxAttempts: 0,
    log: {},
  };
  createReconnect(options).schedule();
  expect(jest.getTimerCount()).toBe(0);
  createReconnect({ ...options, isClosed: () => true, maxAttempts: 1 }).schedule();
  expect(jest.getTimerCount()).toBe(0);
  createReconnect({ ...options, enabled: false, maxAttempts: 1 }).schedule();
  expect(jest.getTimerCount()).toBe(0);
});

test("allows retries after reset", async () => {
  jest.useFakeTimers();
  const retry = createReconnect({
    connect: jest.fn().mockRejectedValue(new Error("offline")),
    isClosed: () => false,
    enabled: true,
    baseDelay: 5,
    maxDelay: 10,
    maxAttempts: 1,
    log: {},
  });
  retry.schedule();
  await jest.advanceTimersByTimeAsync(5);
  expect(jest.getTimerCount()).toBe(0);
  retry.reset();
  retry.schedule();
  expect(jest.getTimerCount()).toBe(1);
  retry.clear();
});

test("removes old transport listeners when it binds a new transport", () => {
  const first = { off: jest.fn(), on: jest.fn() };
  const second = { off: jest.fn(), on: jest.fn() };
  const binding = createTransportBinding(jest.fn());
  binding.bind(first);
  binding.bind(second);
  expect(first.off).toHaveBeenCalledWith("close", expect.any(Function));
  expect(first.off).toHaveBeenCalledWith("error", expect.any(Function));
  binding.unbind();
  expect(second.off).toHaveBeenCalledWith("close", expect.any(Function));
  expect(second.off).toHaveBeenCalledWith("error", expect.any(Function));
});

test("does not schedule another retry after close during a connection attempt", async () => {
  jest.useFakeTimers();
  let failConnect;
  let closed = false;
  const retry = createReconnect({
    connect: () => new Promise((resolve, reject) => (failConnect = reject)),
    isClosed: () => closed,
    enabled: true,
    baseDelay: 5,
    maxDelay: 10,
    maxAttempts: 2,
    log: { error: jest.fn() },
  });
  retry.schedule();
  jest.advanceTimersByTime(5);
  await Promise.resolve();
  closed = true;
  failConnect(new Error("closed"));
  await Promise.resolve();
  expect(jest.getTimerCount()).toBe(0);
});
