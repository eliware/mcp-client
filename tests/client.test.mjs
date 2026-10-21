import { expect, jest, test } from "@jest/globals";
import { createMcpFastifyApp } from "@modelcontextprotocol/fastify";
import { NodeStreamableHTTPServerTransport, toNodeHandler } from "@modelcontextprotocol/node";
import { Client } from "@modelcontextprotocol/client";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { connectMcpClient, mcpClient } from "../src/client.mjs";

function createLogger() {
  return {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

test("creates a modern SDK v2 client and connects over HTTP", async () => {
  const transport = { close: jest.fn() };
  const client = { connect: jest.fn() };
  const ClientClass = jest.fn(() => client);
  const createTransport = jest.fn(() => transport);
  const logger = createLogger();

  await expect(connectMcpClient({ logger }, { ClientClass, createTransport })).resolves.toBe(
    client,
  );

  expect(ClientClass).toHaveBeenCalledWith(
    { name: "@eliware/mcp-client", version: expect.any(String) },
    {
      capabilities: {},
      versionNegotiation: { mode: { pin: "2026-07-28" } },
    },
  );
  expect(createTransport).toHaveBeenCalledWith({ logger });
  expect(client.connect).toHaveBeenCalledWith(transport);
});

test("uses caller identity and capabilities", async () => {
  const client = { connect: jest.fn() };
  const ClientClass = jest.fn(() => client);
  const clientInfo = { name: "app", version: "3" };
  const logger = createLogger();
  await connectMcpClient(
    {
      clientInfo,
      capabilities: { roots: {} },
      logger,
    },
    { ClientClass, createTransport: () => ({}) },
  );

  expect(ClientClass).toHaveBeenCalledWith(clientInfo, {
    capabilities: { roots: {} },
    versionNegotiation: { mode: { pin: "2026-07-28" } },
  });
});

test("sends structured connection records to the injected logger", async () => {
  const logger = createLogger();
  const client = { connect: jest.fn() };
  const ClientClass = jest.fn(() => client);

  await connectMcpClient(
    { transport: "stdio", logger },
    { ClientClass, createTransport: () => ({}) },
  );

  expect(logger.debug).toHaveBeenCalledWith("Connecting to MCP server", {
    operation: "connect",
    transport: "stdio",
  });
  expect(logger.info).toHaveBeenCalledWith("Connected to MCP server", {
    operation: "connect",
    transport: "stdio",
  });
  expect(JSON.stringify(logger)).not.toContain("private-token");
});

test("uses default options and the package logger when no logger is supplied", async () => {
  const write = jest.spyOn(console._stdout, "write").mockImplementation(() => true);

  try {
    await connectMcpClient(undefined, {
      ClientClass: jest.fn(() => ({ connect: jest.fn() })),
      createTransport: () => ({}),
    });
  } finally {
    write.mockRestore();
  }
});

test("uses the SDK v2 Client by default", async () => {
  const connect = jest.spyOn(Client.prototype, "connect").mockResolvedValue();
  const client = await mcpClient({
    transport: "stdio",
    command: "node",
    logger: createLogger(),
  });
  expect(client).toBeInstanceOf(Client);
  expect(connect).toHaveBeenCalledWith(
    expect.objectContaining({ constructor: expect.any(Function) }),
  );
  connect.mockRestore();
});

test("closes a transport when connection setup fails", async () => {
  const error = new Error("connect failed");
  const transport = { close: jest.fn() };
  const logger = createLogger();
  const ClientClass = jest.fn(() => ({ connect: jest.fn().mockRejectedValue(error) }));

  await expect(
    connectMcpClient(
      { logger, token: "private-token" },
      { ClientClass, createTransport: () => transport },
    ),
  ).rejects.toBe(error);
  expect(transport.close).toHaveBeenCalled();
  expect(logger.error).toHaveBeenCalledWith("MCP client connection failed", {
    operation: "connect",
    transport: "http",
  });
  expect(JSON.stringify(logger)).not.toContain("private-token");
  expect(JSON.stringify(logger)).not.toContain("connect failed");
});

test("preserves a connection error when transport cleanup fails", async () => {
  const error = new Error("connect failed");
  const transport = { close: jest.fn().mockRejectedValue(new Error("close failed")) };
  const logger = createLogger();
  const ClientClass = jest.fn(() => ({ connect: jest.fn().mockRejectedValue(error) }));

  await expect(
    connectMcpClient({ logger }, { ClientClass, createTransport: () => transport }),
  ).rejects.toBe(error);
  expect(logger.warn).toHaveBeenCalledWith("MCP transport cleanup failed", {
    operation: "transport.cleanup",
    transport: "http",
  });
});

async function startServer() {
  const handler = createMcpHandler(
    () => {
      const server = new McpServer({ name: "sdk-v2-integration", version: "1.0.0" });
      server.registerTool("health", { description: "Return the server status." }, async () => ({
        content: [{ type: "text", text: "ready" }],
      }));
      return server;
    },
    { legacy: "reject" },
  );
  const app = createMcpFastifyApp({ host: "127.0.0.1" });
  const handleRequest = toNodeHandler(handler);
  const legacyServer = new McpServer(
    { name: "legacy-sdk-v2-integration", version: "1.0.0" },
    { supportedProtocolVersions: ["2025-11-25"] },
  );
  const legacyTransport = new NodeStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await legacyServer.server.connect(legacyTransport);

  app.all("/mcp", async (request, reply) => {
    await handleRequest(request.raw, reply.raw, request.body);
  });
  app.all("/legacy", async (request, reply) => {
    await legacyTransport.handleRequest(request.raw, reply.raw, request.body);
  });

  await app.listen({ host: "127.0.0.1", port: 0 });
  const address = app.server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  return {
    url: `${baseUrl}/mcp`,
    legacyUrl: `${baseUrl}/legacy`,
    close: async () => {
      await handler.close();
      await legacyServer.close();
      await legacyTransport.close();
      await app.close();
    },
  };
}

test("uses the official SDK v2 Fastify server and rejects its legacy-only route", async () => {
  const server = await startServer();
  const logger = createLogger();
  let client;

  try {
    client = await mcpClient({ url: server.url, logger });

    expect(client.getProtocolEra()).toBe("modern");
    expect(logger.debug).toHaveBeenCalledWith("Connecting to MCP server", {
      operation: "connect",
      transport: "http",
    });
    expect(logger.info).toHaveBeenCalledWith("Connected to MCP server", {
      operation: "connect",
      transport: "http",
    });
    await expect(client.listTools()).resolves.toMatchObject({
      tools: [expect.objectContaining({ name: "health" })],
    });
    await expect(client.callTool({ name: "health", arguments: {} })).resolves.toMatchObject({
      content: [{ type: "text", text: "ready" }],
    });

    await client.close();
    client = undefined;
    await expect(mcpClient({ url: server.legacyUrl, logger })).rejects.toThrow(
      /pinned protocol version 2026-07-28/,
    );
  } finally {
    await client?.close();
    await server.close();
  }
});
