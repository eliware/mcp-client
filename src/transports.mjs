import { StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { resolveAuthHeaders } from "./auth-headers.mjs";

export function createClientTransport(options, dependencies = {}) {
  const {
    transport = "http",
    token = process.env.MCP_TOKEN,
    tokenProvider,
    headers,
    command,
    args,
    env,
  } = options;
  if (transport === "stdio") {
    if (!command) throw new Error("stdio transport requires command");
    const StdioClass = dependencies.StdioTransportClass ?? StdioClientTransport;
    return new StdioClass({ command, args, env });
  }
  if (transport !== "http") throw new Error(`Unsupported MCP transport: ${transport}`);

  const HTTPClass = dependencies.HTTPTransportClass ?? StreamableHTTPClientTransport;
  const url = options.url ?? defaultUrl();
  const authProvider = tokenProvider
    ? {
        token: async () => {
          const providedToken = await tokenProvider();
          return providedToken || undefined;
        },
      }
    : undefined;
  return new HTTPClass(new URL(url), {
    authProvider,
    requestInit: {
      headers: resolveAuthHeaders(tokenProvider ? undefined : token, headers, {
        omitAuthorization: Boolean(tokenProvider),
      }),
    },
  });
}

function defaultUrl() {
  return process.env.MCP_URL || `http://localhost:${process.env.MCP_PORT || 1234}/mcp`;
}
