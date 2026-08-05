// Minimal MCP client example.
// The server endpoint is normally /mcp for Streamable HTTP.
import mcpClient from './index.mjs';

const client = await mcpClient({
  url: process.env.MCP_URL ?? 'http://localhost:1234/mcp',
  token: process.env.MCP_TOKEN,
});

const { tools } = await client.listTools();
console.log('Available tools:', tools.map(({ name }) => name));

// The returned object is the official MCP SDK Client, so standard methods
// such as callTool(), listResources(), and getPrompt() are available.
await client.close();
