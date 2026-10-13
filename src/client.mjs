import { log as defaultLog } from "@eliware/common";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Agent } from "undici";
import packageMeta from "../package.json" with { type: "json" };
import { assertOpen, normalizeOptions, numberOption } from "./options.mjs";
import { createClientLifecycle } from "./client-lifecycle.mjs";
import { createClientTransport } from "./transports.mjs";

export function resolveClientClass(ClientClass) {
  return ClientClass ?? Client;
}

/** Connect to an MCP server with official SDK transports. */
export async function mcpClient(options) {
  const {
    log = defaultLog,
    token,
    tokenProvider,
    transport = "http",
    clientInfo = { name: packageMeta.name, version: packageMeta.version },
    capabilities = { sampling: {} },
    ClientClass,
    reconnect = true,
    reconnectBaseDelay = numberOption(process.env.MCP_RECONNECT_BASE_DELAY, 1000, 0),
    reconnectMaxDelay = numberOption(
      process.env.MCP_RECONNECT_MAX_DELAY,
      60000,
      reconnectBaseDelay,
    ),
    maxReconnectAttempts = Infinity,
    forceIPv4 = process.platform === "win32",
  } = normalizeOptions(options);
  let client;
  let activeTransport;
  const ClientImplementation = resolveClientClass(ClientClass);
  const dispatcher =
    forceIPv4 && transport !== "stdio" ? new Agent({ connect: { family: 4 } }) : undefined;

  const getToken = async () => (tokenProvider ? tokenProvider() : (token ?? process.env.MCP_TOKEN));

  const connect = async () => {
    assertOpen(lifecycle.isClosed());
    const authToken = await getToken();
    client = new ClientImplementation(clientInfo, { capabilities });
    activeTransport = createClientTransport(normalizeOptions(options), authToken, dispatcher);
    await client.connect(activeTransport);
    lifecycle.reset();
    log.debug?.(`MCP client connected (${transport})`);
    lifecycle.bind(activeTransport);
    return client;
  };

  const lifecycle = createClientLifecycle({
    connect,
    getTransport: () => activeTransport,
    dispatcher,
    enabled: reconnect,
    baseDelay: reconnectBaseDelay,
    maxDelay: reconnectMaxDelay,
    maxAttempts: maxReconnectAttempts,
    log,
  });
  const connected = await connect();
  return lifecycle.attach(connected);
}

export default mcpClient;
