import mcpClient from '@eliware/mcp-client';

const client = await mcpClient({
  url: process.env.MCP_URL ?? 'https://mcp.example.com/mcp',
  tokenProvider: async () => process.env.MCP_TOKEN,
});

console.log(await client.listTools());
await client.close();
