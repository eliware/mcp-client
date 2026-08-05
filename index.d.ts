/** Supported official MCP SDK transports. */
export type McpTransport = 'http' | 'sse' | 'stdio';

/** Options for creating a connected MCP client. */
export interface McpClientOptions {
  /** MCP endpoint URL. Defaults to MCP_URL or http://localhost:${MCP_PORT || 1234}/mcp. */
  url?: string;
  /** Static bearer token sent as an Authorization header. */
  token?: string;
  /** Resolves a bearer token for each connection, including reconnects. */
  tokenProvider?: () => string | Promise<string | undefined>;
  /** Additional HTTP/SSE request headers. */
  headers?: Record<string, string>;
  /** Transport type; defaults to Streamable HTTP ('http'). */
  transport?: McpTransport;
  /** Child-process executable when transport is 'stdio'. */
  command?: string;
  /** Child-process arguments when transport is 'stdio'. */
  args?: string[];
  /** Child-process environment when transport is 'stdio'. */
  env?: Record<string, string>;
  /** MCP client identity sent during initialization. */
  clientInfo?: { name: string; version: string };
  /** MCP client capabilities. */
  capabilities?: Record<string, unknown>;
  /** Optional lifecycle/reconnect logging functions. */
  log?: {
    debug?: (...args: unknown[]) => void;
    error?: (...args: unknown[]) => void;
    warn?: (...args: unknown[]) => void;
  };
  /** Injectable SDK Client class for tests/adapters. */
  ClientClass?: any;
  /** Override the selected transport class. */
  TransportClass?: any;
  /** Override the Streamable HTTP transport class. */
  HTTPTransportClass?: any;
  /** Override the SSE transport class. */
  SSETransportClass?: any;
  /** Override the stdio transport class. */
  StdioTransportClass?: any;
  /** Enable automatic reconnect; defaults to true. */
  reconnect?: boolean;
  /** Initial reconnect delay in milliseconds. */
  reconnectBaseDelay?: number;
  /** Maximum reconnect delay in milliseconds. */
  reconnectMaxDelay?: number;
  /** Maximum reconnect attempts; defaults to Infinity. */
  maxReconnectAttempts?: number;
}

/** A connected official MCP SDK Client with lifecycle helpers attached. */
export type ConnectedMcpClient = any & {
  close(): Promise<void>;
  disconnect(): Promise<void>;
  reconnect(): Promise<ConnectedMcpClient>;
  mcpConnection: {
    transport: any;
    close(): Promise<void>;
  };
};

/** Connects to an MCP server and returns its initialized SDK Client. */
export declare function mcpClient(options?: McpClientOptions): Promise<ConnectedMcpClient>;

/** Creates the selected official SDK transport without connecting it. */
export declare function createTransport(options: Record<string, unknown>): any;

/** Merges a bearer token into request headers. */
export declare function resolveAuthHeaders(
  token?: string,
  headers?: Record<string, string>,
): Record<string, string>;

/** Validates a numeric option against a minimum and fallback value. */
export declare function numberOption(
  value: unknown,
  fallback: number,
  minimum?: number,
): number;

export default mcpClient;
