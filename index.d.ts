// Type declarations for mcpClient

export interface McpClientOptions {
  log?: any;
  port?: number | string;
  baseUrl?: string;
  token?: string;
  ClientClass?: any;
  TransportClass?: any;
}

export declare function mcpClient(options?: McpClientOptions): Promise<any>;

export default mcpClient;
