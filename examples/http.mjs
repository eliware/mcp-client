import mcpClient from '@eliware/mcp-client';

const client = await mcpClient({
  url: process.env.MCP_URL ?? 'http://localhost:1234/mcp',
});

console.log(await client.listTools());
await client.close();
