import mcpClient from '@eliware/mcp-client';

const client = await mcpClient({
  transport: 'stdio',
  command: process.env.MCP_COMMAND ?? process.execPath,
  args: process.env.MCP_ARGS ? JSON.parse(process.env.MCP_ARGS) : ['/path/to/server.mjs', '--stdio'],
});

console.log(await client.listTools());
await client.close();
