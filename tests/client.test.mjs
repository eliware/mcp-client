import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createClientMocks } from "../test-fixtures/client-mocks.mjs";
import { mcpClient, resolveClientClass } from "../src/client.mjs";

const { connect, events, log, MockTransport, MockClient } = createClientMocks();

beforeEach(() => {
  jest.clearAllMocks();
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
  const client = await mcpClient({
    log,
    url: "http://server/mcp",
    ClientClass: MockClient,
    TransportClass: MockTransport,
  });
  expect(client.info.name).toBe("@eliware/mcp-client");
  expect(client.mcpConnection.transport.url).toBe("http://server/mcp");
  expect(log.debug).toHaveBeenCalledWith("MCP client connected (http)");
  await client.close();
});

test("creates an IPv4 dispatcher when requested", async () => {
  const client = await mcpClient({
    forceIPv4: true,
    ClientClass: MockClient,
    TransportClass: MockTransport,
    reconnect: false,
  });
  expect(client.mcpConnection.transport.options.requestInit.dispatcher).toBeDefined();
  await client.close();
});

test("adds bearer and custom headers", async () => {
  const client = await mcpClient({
    log,
    token: "secret",
    headers: { "x-app": "test" },
    ClientClass: MockClient,
    TransportClass: MockTransport,
  });
  expect(client.mcpConnection.transport.options.requestInit.headers).toEqual({
    Authorization: "Bearer secret",
    "x-app": "test",
  });
  await client.disconnect();
});

test("supports token providers and environment tokens", async () => {
  const tokenProvider = jest.fn().mockResolvedValue("dynamic");
  const client = await mcpClient({
    tokenProvider,
    ClientClass: MockClient,
    TransportClass: MockTransport,
  });
  expect(tokenProvider).toHaveBeenCalled();
  expect(client.mcpConnection.transport.options.requestInit.headers.Authorization).toBe(
    "Bearer dynamic",
  );
  await client.close();
  process.env.MCP_TOKEN = "env";
  const envClient = await mcpClient({ ClientClass: MockClient, TransportClass: MockTransport });
  expect(envClient.mcpConnection.transport.options.requestInit.headers.Authorization).toBe(
    "Bearer env",
  );
  await envClient.close();
});

test("supports the reconnect lifecycle", async () => {
  const client = await mcpClient({
    reconnect: false,
    forceIPv4: true,
    ClientClass: MockClient,
    HTTPTransportClass: MockTransport,
  });
  const oldTransport = client.mcpConnection.transport;
  const oldDispatcher = oldTransport.options.requestInit.dispatcher;
  const reconnected = await client.reconnect();
  expect(oldTransport.close).toHaveBeenCalled();
  expect(connect).toHaveBeenCalledTimes(2);
  expect(reconnected.mcpConnection.transport).not.toBe(oldTransport);
  expect(typeof reconnected.close).toBe("function");
  await reconnected.close();
  await client.close();
  const reopened = await client.reconnect();
  expect(reopened.mcpConnection.transport.options.requestInit.dispatcher).not.toBe(oldDispatcher);
  await reopened.close();
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
  const client = await mcpClient({
    capabilities: { roots: {} },
    ClientClass: MockClient,
    TransportClass: NoEvents,
  });
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
