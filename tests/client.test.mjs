import { expect, jest, test } from "@jest/globals";
import { createMcpFastifyApp } from "@modelcontextprotocol/fastify";
import { NodeStreamableHTTPServerTransport, toNodeHandler } from "@modelcontextprotocol/node";
import { Client } from "@modelcontextprotocol/client";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { connectMcpClient, mcpClient } from "../src/client.mjs";

test("creates a modern SDK v2 client and connects over HTTP", async () => {
  const transport = { close: jest.fn() };
  const client = { connect: jest.fn() };
  const ClientClass = jest.fn(() => client);
  const createTransport = jest.fn(() => transport);

  await expect(connectMcpClient(undefined, { ClientClass, createTransport })).resolves.toBe(client);

  expect(ClientClass).toHaveBeenCalledWith(
    { name: "@eliware/mcp-client", version: expect.any(String) },
    {
      capabilities: {},
      versionNegotiation: { mode: { pin: "2026-07-28" } },
    },
  );
  expect(createTransport).toHaveBeenCalledWith({});
  expect(client.connect).toHaveBeenCalledWith(transport);
});

test("uses caller identity and capabilities", async () => {
  const client = { connect: jest.fn() };
  const ClientClass = jest.fn(() => client);
  const clientInfo = { name: "app", version: "3" };
  await connectMcpClient(
    {
      clientInfo,
      capabilities: { roots: {} },
    },
    { ClientClass, createTransport: () => ({}) },
  );

  expect(ClientClass).toHaveBeenCalledWith(clientInfo, {
    capabilities: { roots: {} },
    versionNegotiation: { mode: { pin: "2026-07-28" } },
  });
});

test("uses the SDK v2 Client by default", async () => {
  const connect = jest.spyOn(Client.prototype, "connect").mockResolvedValue();
  const client = await mcpClient({ transport: "stdio", command: "node" });
  expect(client).toBeInstanceOf(Client);
  expect(connect).toHaveBeenCalledWith(
    expect.objectContaining({ constructor: expect.any(Function) }),
  );
  connect.mockRestore();
});

test("closes a transport when connection setup fails", async () => {
  const error = new Error("connect failed");
  const transport = { close: jest.fn() };
  const ClientClass = jest.fn(() => ({ connect: jest.fn().mockRejectedValue(error) }));

  await expect(
    connectMcpClient({}, { ClientClass, createTransport: () => transport }),
  ).rejects.toBe(error);
  expect(transport.close).toHaveBeenCalled();
});

test("preserves a connection error when transport cleanup fails", async () => {
  const error = new Error("connect failed");
  const transport = { close: jest.fn().mockRejectedValue(new Error("close failed")) };
  const ClientClass = jest.fn(() => ({ connect: jest.fn().mockRejectedValue(error) }));

  await expect(
    connectMcpClient({}, { ClientClass, createTransport: () => transport }),
  ).rejects.toBe(error);
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

  app.all("/mcp", async (request, reply) => {
    await handleRequest(request.raw, reply.raw, request.body);
  });

  await app.listen({ host: "127.0.0.1", port: 0 });
  const address = app.server.address();
  return {
    url: `http://127.0.0.1:${address.port}/mcp`,
    close: async () => {
      await handler.close();
      await app.close();
    },
  };
}

async function startLegacyOnlyServer() {
  const server = new McpServer(
    { name: "legacy-sdk-v2-integration", version: "1.0.0" },
    { supportedProtocolVersions: ["2025-11-25"] },
  );
  const transport = new NodeStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.server.connect(transport);

  const app = createMcpFastifyApp({ host: "127.0.0.1" });
  app.all("/mcp", async (request, reply) => {
    await transport.handleRequest(request.raw, reply.raw, request.body);
  });
  await app.listen({ host: "127.0.0.1", port: 0 });

  const address = app.server.address();
  return {
    url: `http://127.0.0.1:${address.port}/mcp`,
    close: async () => {
      await server.close();
      await transport.close();
      await app.close();
    },
  };
}

test("connects to the official SDK v2 Fastify server with protocol 2026-07-28", async () => {
  const server = await startServer();
  let client;

  try {
    client = await mcpClient({ url: server.url });

    expect(client.getProtocolEra()).toBe("modern");
    await expect(client.listTools()).resolves.toMatchObject({
      tools: [expect.objectContaining({ name: "health" })],
    });
    await expect(client.callTool({ name: "health", arguments: {} })).resolves.toMatchObject({
      content: [{ type: "text", text: "ready" }],
    });
  } finally {
    await client?.close();
    await server.close();
  }
});

test("rejects a server that supports only the 2025 protocol", async () => {
  const server = await startLegacyOnlyServer();

  try {
    await expect(mcpClient({ url: server.url })).rejects.toThrow(
      /pinned protocol version 2026-07-28/,
    );
  } finally {
    await server.close();
  }
});
