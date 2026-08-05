import { log as defaultLog } from '@eliware/common';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';


function numberOption(value, fallback, minimum = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= minimum ? number : fallback;
}

function assertOpen(closed) {
  if (closed) throw new Error('MCP client is closed');
}

function normalizeOptions(options) {
  return options ?? {};
}

function resolveAuthHeaders(token, headers = {}) {
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

function createTransport({ transport, url, token, headers, command, args, env, TransportClass, HTTPTransportClass = StreamableHTTPClientTransport, SSETransportClass = SSEClientTransport, StdioTransportClass = StdioClientTransport }) {
  if (TransportClass) {
    return new TransportClass(url, { requestInit: { headers: resolveAuthHeaders(token, headers) } });
  }
  if (transport === 'stdio') {
    if (!command) throw new Error('stdio transport requires command');
    return new StdioTransportClass({ command, args, env });
  }
  const options = { requestInit: { headers: resolveAuthHeaders(token, headers) } };
  if (transport === 'sse') return new SSETransportClass(new URL(url), options);
  return new HTTPTransportClass(url, options);
}

/** Connect to an MCP server using standard SDK transports. */
export async function mcpClient(options) {
  const {
    log = defaultLog,
    url = process.env.MCP_URL || `http://localhost:${process.env.MCP_PORT || 1234}/mcp`,
    token,
    tokenProvider,
    headers,
    transport = 'http',
    command,
    args,
    env,
    clientInfo = { name: '@eliware/mcp-client', version: '1.1.1' },
    capabilities = { sampling: {} },
    ClientClass = Client,
    TransportClass,
    HTTPTransportClass,
    SSETransportClass,
    StdioTransportClass,
    reconnect = true,
    reconnectBaseDelay = numberOption(process.env.MCP_RECONNECT_BASE_DELAY, 1000, 0),
    reconnectMaxDelay = numberOption(process.env.MCP_RECONNECT_MAX_DELAY, 60000, reconnectBaseDelay),
    maxReconnectAttempts = Infinity,
  } = normalizeOptions(options);
  let client;
  let activeTransport;
  let closed = false;
  let reconnectTimer;
  let attempts = 0;
  let delay = reconnectBaseDelay;

  const getToken = async () => tokenProvider ? tokenProvider() : token ?? process.env.MCP_TOKEN;

  const connect = async () => {
    assertOpen(closed);
    const authToken = await getToken();
    client = new ClientClass(clientInfo, { capabilities });
    activeTransport = createTransport({ transport, url, token: authToken, headers, command, args, env, TransportClass, HTTPTransportClass, SSETransportClass, StdioTransportClass });
    await client.connect(activeTransport);
    attempts = 0;
    delay = reconnectBaseDelay;
    log.debug?.(`MCP client connected (${transport})`);
    if (typeof activeTransport.on === 'function') {
      activeTransport.on('close', scheduleReconnect);
      activeTransport.on('error', scheduleReconnect);
    }
    return client;
  };

  const scheduleReconnect = () => {
    if (closed || !reconnect || reconnectTimer || attempts >= maxReconnectAttempts) return;
    attempts += 1;
    reconnectTimer = setTimeout(async () => {
      reconnectTimer = undefined;
      try { await connect(); } catch (error) {
        log.error?.('MCP reconnect failed', error);
        scheduleReconnect();
      }
    }, delay);
    delay = Math.min(Math.max(delay * 2, reconnectBaseDelay), reconnectMaxDelay);
  };

  const connected = await connect();
  const close = async () => {
    closed = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    await activeTransport?.close?.();
  };
  const reconnectNow = async () => { closed = false; await activeTransport?.close?.(); return connect(); };
  Object.defineProperties(connected, {
    close: { value: close },
    disconnect: { value: close },
    reconnect: { value: reconnectNow },
    mcpConnection: { value: { get transport() { return activeTransport; }, close } },
  });
  return connected;
}

export { createTransport, resolveAuthHeaders, numberOption, assertOpen, normalizeOptions };
export default mcpClient;
