// Tests for mcpClient in index.mjs
import mcpClient from '@eliware/mcp-client';
import { jest, test, expect, beforeEach, afterEach } from '@jest/globals';

const mockConnect = jest.fn();
const mockOn = jest.fn();
const mocklog = {
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

class MockTransport {
  constructor() { }
  on = mockOn;
}

class MockClient {
  constructor() { }
  connect = mockConnect;
}

describe('mcpClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MCP_TOKEN = 'test-token';
  });
  afterEach(() => {
    delete process.env.MCP_TOKEN;
  });

  test('should initialize and connect the MCP client', async () => {
    mockConnect.mockResolvedValueOnce();
    const client = await mcpClient({
      log: mocklog,
      ClientClass: MockClient,
      TransportClass: MockTransport,
      token: 'test-token',
    });
    expect(client).toBeInstanceOf(MockClient);
    expect(mockConnect).toHaveBeenCalled();
    expect(mocklog.debug).toHaveBeenCalledWith(expect.stringContaining('MCP Client connected'));
  });

  test('should throw error if no token is provided', async () => {
    delete process.env.MCP_TOKEN;
    await expect(
      mcpClient({
        log: mocklog,
        ClientClass: MockClient,
        TransportClass: MockTransport,
        token: undefined,
      })
    ).rejects.toThrow('Missing MCP_TOKEN for MCP client authentication.');
    expect(mocklog.error).toHaveBeenCalledWith('No MCP_TOKEN provided for MCP client authentication.');
  });
});
