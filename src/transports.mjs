import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { resolveAuthHeaders } from "./auth-headers.mjs";

export function createTransport({
  transport,
  url = process.env.MCP_URL || `http://localhost:${process.env.MCP_PORT || 1234}/mcp`,
  token,
  headers,
  command,
  args,
  env,
  dispatcher,
  TransportClass,
  HTTPTransportClass = StreamableHTTPClientTransport,
  SSETransportClass = SSEClientTransport,
  StdioTransportClass = StdioClientTransport,
}) {
  if (TransportClass) {
    return new TransportClass(url, {
      requestInit: {
        headers: resolveAuthHeaders(token, headers),
        ...(dispatcher ? { dispatcher } : {}),
      },
    });
  }
  if (transport === "stdio") {
    if (!command) throw new Error("stdio transport requires command");
    return new StdioTransportClass({ command, args, env });
  }
  const options = {
    requestInit: {
      headers: resolveAuthHeaders(token, headers),
      ...(dispatcher ? { dispatcher } : {}),
    },
  };
  if (transport === "sse") return new SSETransportClass(new URL(url), options);
  return new HTTPTransportClass(url, options);
}

export function createClientTransport(options, token, dispatcher) {
  return createTransport({ ...options, token, dispatcher });
}
