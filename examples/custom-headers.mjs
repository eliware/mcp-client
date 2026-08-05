import mcpClient from '@eliware/mcp-client';

const client = await mcpClient({
  url: process.env.MCP_URL ?? 'https://mcp.example.com/mcp',
  headers: {
    'X-Client-Name': 'example-client',
  },
});

console.log(await client.listTools());
await client.close();
