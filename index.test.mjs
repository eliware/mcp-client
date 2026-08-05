import { jest, test, expect, beforeEach, afterEach, describe } from '@jest/globals';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import mcpClient, { createTransport, resolveAuthHeaders, numberOption, assertOpen, normalizeOptions } from './index.mjs';

const connect = jest.fn();
const events = {};
const log = { debug: jest.fn(), error: jest.fn() };
class MockTransport {
  constructor(url, options) { this.url = url; this.options = options; }
  on(event, fn) { events[event] = fn; }
  close = jest.fn();
}
class MockClient {
  constructor(info, options) { this.info = info; this.options = options; this.connect = connect; }
}
beforeEach(() => { jest.clearAllMocks(); Object.keys(events).forEach(k => delete events[k]); connect.mockResolvedValue(undefined); });
afterEach(() => { jest.useRealTimers(); delete process.env.MCP_TOKEN; delete process.env.MCP_RECONNECT_BASE_DELAY; delete process.env.MCP_RECONNECT_MAX_DELAY; });

describe('mcpClient', () => {
  test('connects public server and exposes lifecycle', async () => {
    const client = await mcpClient({ log, url: 'http://server/mcp', ClientClass: MockClient, TransportClass: MockTransport });
    expect(client.info.name).toBe('@eliware/mcp-client');
    expect(client.mcpConnection.transport.url).toBe('http://server/mcp');
    expect(log.debug).toHaveBeenCalledWith('MCP client connected (http)');
    await client.close();
  });
  test('adds bearer and custom headers', async () => {
    const client = await mcpClient({ log, token: 'secret', headers: { 'x-app': 'test' }, ClientClass: MockClient, TransportClass: MockTransport });
    expect(client.mcpConnection.transport.options.requestInit.headers).toEqual({ Authorization: 'Bearer secret', 'x-app': 'test' });
    await client.disconnect();
  });
  test('supports token provider and environment token', async () => {
    const tokenProvider = jest.fn().mockResolvedValue('dynamic');
    const client = await mcpClient({ tokenProvider, ClientClass: MockClient, TransportClass: MockTransport });
    expect(tokenProvider).toHaveBeenCalled();
    expect(client.mcpConnection.transport.options.requestInit.headers.Authorization).toBe('Bearer dynamic');
    await client.close();
    process.env.MCP_TOKEN = 'env';
    const envClient = await mcpClient({ ClientClass: MockClient, TransportClass: MockTransport });
    expect(envClient.mcpConnection.transport.options.requestInit.headers.Authorization).toBe('Bearer env');
    await envClient.close();
  });
  test('supports reconnect lifecycle', async () => {
    const client = await mcpClient({ reconnect: false, ClientClass: MockClient, TransportClass: MockTransport });
    const old = client.mcpConnection.transport;
    await client.reconnect();
    expect(old.close).toHaveBeenCalled();
    expect(connect).toHaveBeenCalledTimes(2);
    await client.close();
  });
  test('schedules and logs failed reconnect', async () => {
    jest.useFakeTimers();
    connect.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('offline'));
    const client = await mcpClient({ log, reconnectBaseDelay: 5, reconnectMaxDelay: 10, ClientClass: MockClient, TransportClass: MockTransport });
    events.close();
    await jest.advanceTimersByTimeAsync(5);
    expect(log.error).toHaveBeenCalledWith('MCP reconnect failed', expect.any(Error));
    await client.close();
  });
  test('honors reconnect disabled, limits, and closed state', async () => {
    jest.useFakeTimers();
    const client = await mcpClient({ reconnect: true, maxReconnectAttempts: 0, ClientClass: MockClient, TransportClass: MockTransport });
    events.close();
    await jest.advanceTimersByTimeAsync(10);
    expect(connect).toHaveBeenCalledTimes(1);
    await client.close();
    events.close();
    expect(connect).toHaveBeenCalledTimes(1);
  });
  test('rejects stdio without command', async () => {
    await expect(mcpClient({ transport: 'stdio', ClientClass: MockClient })).rejects.toThrow('stdio transport requires command');
  });
  test('uses custom client capabilities and no-event transport', async () => {
    class NoEvents { close = jest.fn(); }
    const client = await mcpClient({ capabilities: { roots: {} }, ClientClass: MockClient, TransportClass: NoEvents });
    expect(client.options.capabilities).toEqual({ roots: {} });
    await client.close();
  });
});

test('numberOption validates values', () => {
  expect(numberOption('25', 1, 10)).toBe(25);
  expect(numberOption('25', 1)).toBe(25);
  expect(numberOption('bad', 1, 10)).toBe(1);
  expect(numberOption('5', 1, 10)).toBe(1);
});
test('resolveAuthHeaders preserves headers without token', () => {
  expect(resolveAuthHeaders(undefined, { a: 'b' })).toEqual({ a: 'b' });
});

describe('createTransport branches', () => {
  class HTTP { constructor(url, options) { this.url = url; this.options = options; } }
  class SSE { constructor(url, options) { this.url = url; this.options = options; } }
  class Stdio { constructor(options) { this.options = options; } }
  test('injected transport', () => expect(createTransport({ TransportClass: HTTP, url: 'http://x', token: 't' }).options.requestInit.headers.Authorization).toBe('Bearer t'));
  test('HTTP transport', () => expect(createTransport({ transport: 'http', url: 'http://x', HTTPTransportClass: HTTP })).toBeInstanceOf(HTTP));
  test('SSE transport', () => expect(createTransport({ transport: 'sse', url: 'https://x/sse', SSETransportClass: SSE }).url).toEqual(new URL('https://x/sse')));
  test('stdio transport', () => expect(createTransport({ transport: 'stdio', command: 'node', args: ['x'], env: { A: '1' }, StdioTransportClass: Stdio }).options).toEqual({ command: 'node', args: ['x'], env: { A: '1' }}));
  test('native transports construct', async () => {
    const http = createTransport({ transport: 'http', url: 'https://x/mcp' });
    const sse = createTransport({ transport: 'sse', url: 'https://x/sse' });
    const stdio = createTransport({ transport: 'stdio', command: process.execPath, args: ['-e', ''] });
    expect(http.constructor.name).toBe('StreamableHTTPClientTransport');
    expect(sse.constructor.name).toBe('SSEClientTransport');
    expect(stdio.constructor.name).toBe('StdioClientTransport');
    await stdio.close();
  });
});

test('covers numberOption valid and invalid values', () => {
  expect(numberOption('25', 1, 0)).toBe(25);
  expect(numberOption('-1', 1, 0)).toBe(1);
  expect(numberOption('nope', 2, 0)).toBe(2);
});

test('supports transports without event listeners', async () => {
  class NoEventsTransport { close = jest.fn(); }
  const client = await mcpClient({ ClientClass: MockClient, TransportClass: NoEventsTransport, reconnect: false });
  await client.close();
});

test('uses the native MCP Client with a real stdio server', async () => {
  const client = await mcpClient({
    transport: 'stdio',
    command: process.execPath,
    args: [join(dirname(fileURLToPath(import.meta.resolve('@eliware/mcp-server'))), 'container.mjs'), '--stdio'],
    reconnect: false,
    log,
  });
  expect((await client.listTools()).tools.map(tool => tool.name)).toContain('echo');
  await client.close();
});

test('rejects closed connection guard', () => {
  expect(() => assertOpen(true)).toThrow('MCP client is closed');
  expect(() => assertOpen(false)).not.toThrow();
});

test('normalizes absent options', () => {
  expect(normalizeOptions(null)).toEqual({});
  expect(normalizeOptions({ transport: 'stdio' })).toEqual({ transport: 'stdio' });
});
