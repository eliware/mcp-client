/**
 * MCP Client module for connecting to a Model Context Protocol server.
 *
 * @module mcpClient
 * @author Eli Sterling, eliware.org
 * @license MIT
 */
import { fs, log as logger, path } from '@eliware/common';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

/**
 * Creates and connects an MCP client with automatic reconnection and token authentication.
 *
 * @async
 * @function mcpClient
 * @param {Object} [options] - Configuration options.
 * @param {Object} [options.log=logger] - Logger instance for logging output.
 * @param {number} [options.port=process.env.MCP_PORT||1234] - Port for the MCP server.
 * @param {string} [options.baseUrl=process.env.MCP_URL||`http://localhost:${port}/`] - Base URL for the MCP server.
 * @param {string} [options.token] - Authentication token for the MCP server. Falls back to MCP_TOKEN env var.
 * @param {Function} [options.ClientClass=Client] - Client class to instantiate.
 * @param {Function} [options.TransportClass=StreamableHTTPClientTransport] - Transport class to use for connection.
 * @returns {Promise<Client>} Resolves to a connected MCP Client instance.
 * @throws {Error} If authentication token is missing.
 */
export async function mcpClient({
  log = logger,
  port = process.env.MCP_PORT || 1234,
  baseUrl = process.env.MCP_URL || `http://localhost:${port}/`,
  token,
  ClientClass = Client,
  TransportClass = StreamableHTTPClientTransport,
} = {}) {
  let client;
  let transport;
  let RECONNECT_BASE_DELAY = process.env.MCP_RECONNECT_BASE_DELAY ? parseInt(process.env.MCP_RECONNECT_BASE_DELAY, 10) : 1000; // 1s
  if (isNaN(RECONNECT_BASE_DELAY) || RECONNECT_BASE_DELAY < 1000) {
    RECONNECT_BASE_DELAY = 1000;
  }
  const RECONNECT_MAX_DELAY = process.env.MCP_RECONNECT_MAX_DELAY ? parseInt(process.env.MCP_RECONNECT_MAX_DELAY, 10) : 60000; // 1min
  if (isNaN(RECONNECT_MAX_DELAY) || RECONNECT_MAX_DELAY < RECONNECT_BASE_DELAY) {
    RECONNECT_MAX_DELAY = RECONNECT_BASE_DELAY;
  }
  let reconnectDelay = RECONNECT_BASE_DELAY;

  // Get version from package.json
  let version = '1.0.0';
  try {
    const packageJsonPath = path(import.meta, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    version = packageJson.version || version;
  } catch (err) {
    log.warn && log.warn('[CLIENT] Could not read package.json for version:', err && err.stack ? err.stack : err);
  }

  async function connectWithRetry() {
    // Fallback to env only if token is undefined or null
    let authToken = token;
    if (authToken === undefined || authToken === null) {
      authToken = process.env.MCP_TOKEN;
    }
    if (!authToken) {
      log.error && log.error('No MCP_TOKEN provided for MCP client authentication.');
      throw new Error('Missing MCP_TOKEN for MCP client authentication.');
    }
    try {
      client = new ClientClass(
        { name: '@eliware/mcp-client', version },
        { capabilities: { sampling: {} } }
      );
      const transportOptions = {
        requestInit: {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      };
      log.debug && log.debug(`[DEBUG] Using MCP_TOKEN for Authorization header`);
      transport = new TransportClass(baseUrl, transportOptions);
      await client.connect(transport);
      log.debug && log.debug(`MCP Client connected to ${baseUrl}`);
      reconnectDelay = RECONNECT_BASE_DELAY;
      if (typeof transport.on === 'function') {
        transport.on('close', handleDisconnect);
        transport.on('error', handleDisconnect);
      }
      return client;
    } catch (error) {
      log.error && log.error('Error connecting MCP Client:', error);
      await new Promise(resolve => setTimeout(resolve, reconnectDelay));
      reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_DELAY);
      return connectWithRetry();
    }
  }

  function handleDisconnect() {
    log.debug && log.debug('MCP Client disconnected. Attempting to reconnect...');
    setTimeout(connectWithRetry, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_DELAY);
  }

  return connectWithRetry();
}

/**
 * Default export for mcpClient.
 * @see mcpClient
 */
export default mcpClient;
