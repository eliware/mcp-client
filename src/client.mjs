import { log as defaultLog } from "@eliware/common";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Agent } from "undici";
import packageMeta from "../package.json" with { type: "json" };
import { assertOpen, normalizeOptions, resolveReconnectDelays, resolveToken } from "./options.mjs";
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
    maxReconnectAttempts = Infinity,
    forceIPv4 = process.platform === "win32",
  } = normalizeOptions(options);
  const { baseDelay, maxDelay } = resolveReconnectDelays(
    options?.reconnectBaseDelay,
    options?.reconnectMaxDelay,
  );
  let client;
  let activeTransport;
  let dispatcher;
  const ClientImplementation = resolveClientClass(ClientClass);

  const getToken = () => resolveToken({ token, tokenProvider });

  const connect = async () => {
    assertOpen(lifecycle.isClosed());
    const authToken = transport === "stdio" ? undefined : await getToken();
    client = new ClientImplementation(clientInfo, { capabilities });
    dispatcher ??=
      forceIPv4 && transport !== "stdio" ? new Agent({ connect: { family: 4 } }) : undefined;
    activeTransport = createClientTransport(normalizeOptions(options), authToken, dispatcher);
    const connectingTransport = activeTransport;
    await client.connect(connectingTransport);
    if (lifecycle.isClosed()) {
      await connectingTransport.close?.();
      activeTransport = undefined;
      throw new Error("Client closed during connection");
    }
    lifecycle.reset();
    log.debug?.(`MCP client connected (${transport})`);
    lifecycle.bind(activeTransport);
    return client;
  };

  const lifecycle = createClientLifecycle({
    connect,
    getTransport: () => activeTransport,
    clearTransport: () => {
      activeTransport = undefined;
    },
    closeDispatcher: async () => {
      const currentDispatcher = dispatcher;
      dispatcher = undefined;
      await currentDispatcher?.close();
    },
    enabled: reconnect,
    baseDelay,
    maxDelay,
    maxAttempts: maxReconnectAttempts,
    log,
  });
  const connected = await connect();
  return lifecycle.attach(connected);
}

export default mcpClient;
