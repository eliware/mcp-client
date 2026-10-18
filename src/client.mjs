import { Client } from "@modelcontextprotocol/client";
import packageMeta from "../package.json" with { type: "json" };
import { createClientTransport } from "./transports.mjs";

const MCP_PROTOCOL_VERSION = "2026-07-28";

export async function connectMcpClient(options = {}, dependencies = {}) {
  const ClientClass = dependencies.ClientClass ?? Client;
  const transportFactory = dependencies.createTransport ?? createClientTransport;
  const client = new ClientClass(
    options.clientInfo ?? { name: packageMeta.name, version: packageMeta.version },
    {
      capabilities: options.capabilities ?? {},
      versionNegotiation: { mode: { pin: MCP_PROTOCOL_VERSION } },
    },
  );
  const transport = transportFactory(options);

  try {
    await client.connect(transport);
  } catch (error) {
    try {
      await transport.close?.();
    } catch {
      // Keep the connection error.
    }
    throw error;
  }

  return client;
}

/** Connect to an MCP server through Streamable HTTP or stdio. */
export function mcpClient(options) {
  return connectMcpClient(options);
}
