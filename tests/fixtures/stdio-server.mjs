import readline from 'node:readline';

const input = readline.createInterface({ input: process.stdin });
input.on('line', line => {
  const message = JSON.parse(line);
  if (message.id === undefined) return;
  const result = message.method === 'initialize'
    ? { protocolVersion: '2025-11-25', capabilities: { tools: {} }, serverInfo: { name: 'fixture', version: '1' } }
    : message.method === 'tools/list'
      ? { tools: [{ name: 'fixture-tool', description: 'Fixture tool', inputSchema: { type: 'object', properties: {} } }] }
      : {};
  process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id: message.id, result })}\n`);
});
