import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createClientMocks } from "../test-fixtures/client-mocks.mjs";
import { mcpClient, resolveClientClass } from "../src/client.mjs";

const { connect, events, log, transports, MockTransport, MockClient } = createClientMocks();
const openClient = (options = {}) =>
  mcpClient({ ClientClass: MockClient, TransportClass: MockTransport, ...options });

beforeEach(() => {
  jest.clearAllMocks();
  transports.length = 0;
  Object.keys(events).forEach((key) => delete events[key]);
  connect.mockResolvedValue(undefined);
});

afterEach(() => {
  jest.useRealTimers();
  delete process.env.MCP_TOKEN;
  delete process.env.MCP_RECONNECT_BASE_DELAY;
  delete process.env.MCP_RECONNECT_MAX_DELAY;
});

test("selects the default SDK client class", () => {
  expect(resolveClientClass()).toBe(Client);
  expect(resolveClientClass(MockClient)).toBe(MockClient);
});

test("connects and exposes lifecycle controls", async () => {
  const client = await openClient({ log, url: "http://server/mcp" });
  expect(client.info.name).toBe("@eliware/mcp-client");
  expect(client.mcpConnection.transport.url).toBe("http://server/mcp");
  expect(log.debug).toHaveBeenCalledWith("MCP client connected (http)");
  await client.close();
});

test("creates an IPv4 dispatcher when requested", async () => {
  const client = await openClient({ forceIPv4: true, reconnect: false });
  expect(client.mcpConnection.transport.options.requestInit.dispatcher).toBeDefined();
  await client.close();
});

test("adds bearer and custom headers", async () => {
  const client = await openClient({ log, token: "secret", headers: { "x-app": "test" } });
  expect(client.mcpConnection.transport.options.requestInit.headers).toEqual({
    Authorization: "Bearer secret",
    "x-app": "test",
  });
  await client.disconnect();
});

test("supports token providers and environment tokens", async () => {
  const tokenProvider = jest.fn().mockResolvedValue("dynamic");
  const client = await openClient({ tokenProvider });
  expect(tokenProvider).toHaveBeenCalled();
  expect(client.mcpConnection.transport.options.requestInit.headers.Authorization).toBe(
    "Bearer dynamic",
  );
  await client.close();
  process.env.MCP_TOKEN = "env";
  const envClient = await openClient();
  expect(envClient.mcpConnection.transport.options.requestInit.headers.Authorization).toBe(
    "Bearer env",
  );
  await envClient.close();
});

test("supports the reconnect lifecycle", async () => {
  jest.useFakeTimers();
  const client = await mcpClient({
    reconnectBaseDelay: 5,
    forceIPv4: true,
    ClientClass: MockClient,
    HTTPTransportClass: MockTransport,
  });
  const oldSequence = client.currentSequence();
  events.close();
  await jest.advanceTimersByTimeAsync(5);
  jest.useRealTimers();
  expect(client.currentSequence()).not.toBe(oldSequence);
  const automaticTransport = client.mcpConnection.transport;
  const reconnected = await client.reconnect();
  expect(reconnected).toBe(client);
  expect(automaticTransport.close).toHaveBeenCalled();
  expect(connect).toHaveBeenCalledTimes(3);
  expect(reconnected.mcpConnection.transport).not.toBe(automaticTransport);
  await reconnected.close();
});

test("does not reconnect while the client closes", async () => {
  let finishClose;
  class SlowCloseTransport extends MockTransport {
    close = jest.fn(
      () =>
        new Promise((resolve) => {
          finishClose = resolve;
        }),
    );
  }
  const client = await openClient({ reconnect: false, TransportClass: SlowCloseTransport });
  const closePromise = client.close();
  const reconnectPromise = client.reconnect();
  finishClose();
  await closePromise;
  await expect(reconnectPromise).rejects.toThrow("Cannot reconnect while close is in progress");
  expect(connect).toHaveBeenCalledTimes(1);
  expect(client.mcpConnection.transport).toBeUndefined();
});

test("closes a transport when close interrupts its connection", async () => {
  let finishConnect;
  connect
    .mockImplementationOnce(() => Promise.resolve())
    .mockImplementationOnce(() => new Promise((resolve) => (finishConnect = resolve)));
  const client = await openClient({ reconnect: false });
  const reconnectPromise = client.reconnect();
  await new Promise((resolve) => setImmediate(resolve));
  const connectingTransport = client.mcpConnection.transport;
  connectingTransport.close.mockRejectedValueOnce(new Error("close failed"));
  const closePromise = client.close();
  await expect(closePromise).rejects.toThrow("close failed");
  finishConnect();
  await expect(reconnectPromise).rejects.toThrow("Client closed during connection");
  expect(connectingTransport.close).toHaveBeenCalled();
  expect(client.mcpConnection.transport).toBeUndefined();
});

test("closes resources when the initial connection fails", async () => {
  connect.mockRejectedValueOnce(new Error("offline"));
  const failure = openClient().then(null, (error) => error);
  await Promise.resolve();
  transports[0].close.mockRejectedValueOnce(new Error("cleanup failed"));
  expect((await failure).message).toBe("offline");
  expect(transports[0].close).toHaveBeenCalledTimes(1);
});

test("allows another manual reconnect after a connection failure", async () => {
  connect
    .mockResolvedValueOnce(undefined)
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce(undefined);
  const client = await openClient({ reconnect: false });
  await client.close();
  await expect(client.reconnect()).rejects.toThrow("offline");
  expect(transports[1].close).toHaveBeenCalledTimes(1);
  expect(connect).toHaveBeenCalledTimes(2);
  const reconnected = await client.reconnect();
  expect(connect).toHaveBeenCalledTimes(3);
  expect(reconnected.mcpConnection.transport).toBeDefined();
  await reconnected.close();
});

test("rejects stdio without a command", async () => {
  await expect(mcpClient({ transport: "stdio", ClientClass: MockClient })).rejects.toThrow(
    "stdio transport requires command",
  );
});

test("uses custom capabilities with transports without events", async () => {
  class NoEvents {
    close = jest.fn();
  }
  const client = await openClient({ capabilities: { roots: {} }, TransportClass: NoEvents });
  expect(client.options.capabilities).toEqual({ roots: {} });
  await client.close();
});

test("connects to a stdio transport with a local command", async () => {
  const tokenProvider = jest.fn();
  class StdioTransport {
    constructor(options) {
      this.options = options;
    }
    close = jest.fn();
  }
  const client = await mcpClient({
    transport: "stdio",
    command: "node",
    args: ["server.mjs"],
    tokenProvider,
    reconnect: false,
    log,
    ClientClass: MockClient,
    StdioTransportClass: StdioTransport,
  });
  expect(client.mcpConnection.transport.options).toEqual({
    command: "node",
    args: ["server.mjs"],
    env: undefined,
  });
  expect(tokenProvider).not.toHaveBeenCalled();
  await client.close();
});
