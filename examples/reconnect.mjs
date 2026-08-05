import mcpClient from '@eliware/mcp-client';

const client = await mcpClient({
  url: process.env.MCP_URL ?? 'http://localhost:1234/mcp',
  reconnect: true,
  reconnectBaseDelay: 1000,
  reconnectMaxDelay: 60000,
  maxReconnectAttempts: 10,
});

console.log(await client.listTools());
await client.close();
