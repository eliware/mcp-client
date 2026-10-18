import type { Client, ClientCapabilities, Implementation } from "@modelcontextprotocol/client";

export interface McpClientOptions {
  /** MCP server endpoint. The default is http://localhost:1234/mcp. */
  url?: string;
  /** Select stdio for a local server process. HTTP is the default. */
  transport?: "http" | "stdio";
  /** Local server executable for stdio transport. */
  command?: string;
  /** Local server arguments for stdio transport. */
  args?: string[];
  /** Local server environment for stdio transport. */
  env?: Record<string, string>;
  /** Static bearer token for HTTP transport. */
  token?: string;
  /** Resolve a bearer token for each HTTP request. */
  tokenProvider?: () => string | Promise<string>;
  /** Additional HTTP request headers. */
  headers?: Record<string, string>;
  /** Client identity sent during initialization. */
  clientInfo?: Implementation;
  /** Client capabilities. */
  capabilities?: ClientCapabilities;
}

/** Connect to an MCP server and return its initialized SDK v2 client. */
export declare function mcpClient(options?: McpClientOptions): Promise<Client>;
