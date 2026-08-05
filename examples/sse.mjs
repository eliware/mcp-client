import mcpClient from '@eliware/mcp-client';

const client = await mcpClient({
  transport: 'sse',
  url: process.env.MCP_URL ?? 'http://localhost:1234/sse',
});

console.log(await client.listTools());
await client.close();
