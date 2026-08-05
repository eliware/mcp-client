import mcpClient from '@eliware/mcp-client';

class TestTransport {
  async start() {}
  async close() {}
}

const client = await mcpClient({
  transport: 'http',
  TransportClass: TestTransport,
});

await client.close();
