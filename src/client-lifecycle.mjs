import { createReconnect } from "./reconnect.mjs";

export function createClientLifecycle({
  connect,
  getTransport,
  dispatcher,
  enabled,
  baseDelay,
  maxDelay,
  maxAttempts,
  log,
}) {
  let closed = false;
  const retry = createReconnect({
    connect,
    isClosed: () => closed,
    enabled,
    baseDelay,
    maxDelay,
    maxAttempts,
    log,
  });
  const close = async () => {
    closed = true;
    retry.clear();
    await getTransport()?.close?.();
    await dispatcher?.close();
  };
  const reconnect = async () => {
    closed = false;
    await getTransport()?.close?.();
    return connect();
  };
  return {
    isClosed: () => closed,
    reset: retry.reset,
    bind: (transport) => {
      if (typeof transport.on !== "function") return;
      transport.on("close", retry.schedule);
      transport.on("error", retry.schedule);
    },
    attach: (client) => {
      Object.defineProperties(client, {
        close: { value: close },
        disconnect: { value: close },
        reconnect: { value: reconnect },
        mcpConnection: {
          value: {
            get transport() {
              return getTransport();
            },
            close,
          },
        },
      });
      return client;
    },
  };
}
