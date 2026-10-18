import { expect, jest, test } from "@jest/globals";
import { Client } from "@modelcontextprotocol/client";
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
      capabilities: { sampling: {} },
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
