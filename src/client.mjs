import { Client } from "@modelcontextprotocol/client";
import { createLogger } from "@eliware/log";
import packageMeta from "../package.json" with { type: "json" };
import { createClientTransport } from "./transports.mjs";

const MCP_PROTOCOL_VERSION = "2026-07-28";

export async function connectMcpClient(options = {}, dependencies = {}) {
  const ClientClass = dependencies.ClientClass ?? Client;
  const transportFactory = dependencies.createTransport ?? createClientTransport;
  const logger = options.logger ?? createLogger({ format: "json" });
  const context = { operation: "connect", transport: options.transport ?? "http" };
  const client = new ClientClass(
    options.clientInfo ?? { name: packageMeta.name, version: packageMeta.version },
    {
      capabilities: options.capabilities ?? {},
      versionNegotiation: { mode: { pin: MCP_PROTOCOL_VERSION } },
    },
  );
  const transport = transportFactory(options);

  logger.debug("Connecting to MCP server", context);
  try {
    await client.connect(transport);
  } catch (error) {
    logger.error("MCP client connection failed", context);
    try {
      await transport.close?.();
    } catch {
      // Keep the connection error.
      logger.warn("MCP transport cleanup failed", {
        operation: "transport.cleanup",
        transport: context.transport,
      });
    }
    throw error;
  }

  logger.info("Connected to MCP server", context);
  return client;
}

/** Connect to an MCP server through Streamable HTTP or stdio. */
export function mcpClient(options) {
  return connectMcpClient(options);
}
