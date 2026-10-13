import { afterEach, expect, jest, test } from "@jest/globals";
import { createClientLifecycle } from "../src/client-lifecycle.mjs";

afterEach(() => {
  jest.useRealTimers();
});

const makeLifecycle = (options = {}) =>
  createClientLifecycle({
    connect: jest.fn(),
    getTransport: () => undefined,
    enabled: false,
    baseDelay: 5,
    maxDelay: 10,
    maxAttempts: 1,
    log: {},
    ...options,
  });

test("binds transport events and schedules a reconnect", async () => {
  jest.useFakeTimers();
  const listeners = {};
  const connect = jest.fn();
  const lifecycle = makeLifecycle({ connect, enabled: true });
  lifecycle.bind({ on: (name, listener) => (listeners[name] = listener) });
  lifecycle.reset();
  listeners.close();
  listeners.error();
  await jest.advanceTimersByTimeAsync(5);
  expect(connect).toHaveBeenCalledTimes(1);
});

test("attaches and closes client lifecycle methods", async () => {
  const transport = { close: jest.fn() };
  const dispatcher = { close: jest.fn() };
  const closeDispatcher = jest.fn(() => dispatcher.close());
  const connect = jest.fn().mockResolvedValue({});
  const lifecycle = makeLifecycle({ connect, getTransport: () => transport, closeDispatcher });
  const client = lifecycle.attach({});
  expect(client.mcpConnection.transport).toBe(transport);
  expect(client.mcpConnection.close).toBe(client.close);
  expect(lifecycle.isClosed()).toBe(false);
  await client.close();
  expect(lifecycle.isClosed()).toBe(true);
  expect(transport.close).toHaveBeenCalledTimes(1);
  expect(dispatcher.close).toHaveBeenCalledTimes(1);
  await client.disconnect();
  expect(transport.close).toHaveBeenCalledTimes(1);
  expect(closeDispatcher).toHaveBeenCalledTimes(1);
  const reconnected = await client.reconnect();
  expect(reconnected.close).toBe(client.close);
  expect(reconnected.mcpConnection.transport).toBe(transport);
  expect(lifecycle.isClosed()).toBe(false);
  expect(transport.close).toHaveBeenCalledTimes(1);
  await client.mcpConnection.close();
  expect(lifecycle.isClosed()).toBe(true);
  expect(closeDispatcher).toHaveBeenCalledTimes(2);
});

test("clears a pending retry before a manual reconnect", async () => {
  jest.useFakeTimers();
  const listeners = {};
  let lifecycle;
  const transport = {
    on: (name, listener) => (listeners[name] = listener),
    close: jest.fn(() => listeners.close()),
  };
  const connect = jest.fn(() => {
    lifecycle.reset();
    return Promise.resolve({});
  });
  lifecycle = makeLifecycle({
    connect,
    getTransport: () => transport,
    enabled: true,
    maxAttempts: 2,
  });
  lifecycle.bind(transport);
  const client = lifecycle.attach({});
  listeners.close();
  expect(jest.getTimerCount()).toBe(1);
  await client.reconnect();
  expect(jest.getTimerCount()).toBe(0);
  await jest.advanceTimersByTimeAsync(10);
  expect(connect).toHaveBeenCalledTimes(1);
});

test("closes the dispatcher when transport close fails", async () => {
  const dispatcher = { close: jest.fn() };
  const closeDispatcher = jest.fn(() => dispatcher.close());
  const transport = { close: jest.fn().mockRejectedValue(new Error("transport close failed")) };
  const lifecycle = makeLifecycle({ getTransport: () => transport, closeDispatcher });
  const client = lifecycle.attach({});
  await expect(client.close()).rejects.toThrow("transport close failed");
  expect(dispatcher.close).toHaveBeenCalledTimes(1);
});

test("cleans up and closes the lifecycle when reconnect fails", async () => {
  const firstTransport = { close: jest.fn() };
  const failedTransport = { close: jest.fn() };
  const dispatcher = { close: jest.fn() };
  let activeTransport = firstTransport;
  const connect = jest.fn(() => {
    activeTransport = failedTransport;
    throw new Error("connect failed");
  });
  const closeDispatcher = jest.fn(() => {
    dispatcher.close();
    throw new Error("dispatcher close failed");
  });
  const lifecycle = makeLifecycle({
    connect,
    getTransport: () => activeTransport,
    clearTransport: () => {
      activeTransport = undefined;
    },
    closeDispatcher,
  });
  const client = lifecycle.attach({});
  await expect(client.reconnect()).rejects.toThrow("connect failed");
  expect(lifecycle.isClosed()).toBe(true);
  expect(firstTransport.close).toHaveBeenCalledTimes(1);
  expect(failedTransport.close).toHaveBeenCalledTimes(1);
  expect(client.mcpConnection.transport).toBeUndefined();
  expect(closeDispatcher).toHaveBeenCalledTimes(1);
  expect(dispatcher.close).toHaveBeenCalledTimes(1);
  await expect(client.reconnect()).rejects.toThrow("dispatcher close failed");
  expect(connect).toHaveBeenCalledTimes(1);
});

test("shares one promise across concurrent reconnect calls", async () => {
  const transport = { close: jest.fn() };
  let finishConnect;
  const nextClient = {};
  const connect = jest.fn(
    () =>
      new Promise((resolve) => {
        finishConnect = () => resolve(nextClient);
      }),
  );
  const lifecycle = makeLifecycle({
    connect,
    getTransport: () => transport,
  });
  const client = lifecycle.attach({});
  const firstReconnect = client.reconnect();
  const secondReconnect = client.reconnect();
  expect(secondReconnect).toBe(firstReconnect);
  await new Promise((resolve) => setImmediate(resolve));
  expect(connect).toHaveBeenCalledTimes(1);
  finishConnect();
  const [firstClient, secondClient] = await Promise.all([firstReconnect, secondReconnect]);
  expect(firstClient).toBe(secondClient);
  expect(typeof firstClient.close).toBe("function");
});

test("waits for close when a reconnect fails", async () => {
  let activeTransport;
  let failConnect;
  let finishClose;
  const transport = { close: jest.fn(() => new Promise((resolve) => (finishClose = resolve))) };
  const connect = jest.fn(() => {
    activeTransport = transport;
    return new Promise((resolve, reject) => (failConnect = () => reject(new Error("offline"))));
  });
  const lifecycle = makeLifecycle({
    connect,
    getTransport: () => activeTransport,
    clearTransport: () => (activeTransport = undefined),
  });
  const client = lifecycle.attach({});
  const reconnect = client.reconnect();
  await new Promise((resolve) => setImmediate(resolve));
  const close = client.close();
  failConnect();
  finishClose();
  await expect(reconnect).rejects.toThrow("offline");
  await close;
  expect(transport.close).toHaveBeenCalledTimes(1);
  expect(client.mcpConnection.transport).toBeUndefined();
});

test("binds no listeners for a transport without events", () => {
  const lifecycle = makeLifecycle({ connect: jest.fn().mockRejectedValue(new Error("offline")) });
  expect(() => lifecycle.bind({})).not.toThrow();
  return expect(lifecycle.attach({}).reconnect()).rejects.toThrow("offline");
});
