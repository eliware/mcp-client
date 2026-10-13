import { createReconnect } from "./reconnect.mjs";

export function createClientLifecycle({
  connect,
  getTransport,
  closeDispatcher,
  enabled,
  baseDelay,
  maxDelay,
  maxAttempts,
  log,
}) {
  let closed = false;
  let closePromise;
  const retry = createReconnect({
    connect,
    isClosed: () => closed,
    enabled,
    baseDelay,
    maxDelay,
    maxAttempts,
    log,
  });
  const close = () => {
    if (closePromise) return closePromise;
    closed = true;
    retry.clear();
    closePromise = (async () => {
      try {
        await getTransport()?.close?.();
      } finally {
        await closeDispatcher?.();
      }
    })();
    return closePromise;
  };
  const reconnect = async () => {
    retry.clear();
    if (closePromise) await closePromise;
    if (!closed) {
      closed = true;
      await getTransport()?.close?.();
    }
    closed = false;
    closePromise = undefined;
    return attach(await connect());
  };
  const attach = (client) => {
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
  };
  return {
    isClosed: () => closed,
    reset: retry.reset,
    bind: (transport) => {
      if (typeof transport.on !== "function") return;
      transport.on("close", retry.schedule);
      transport.on("error", retry.schedule);
    },
    attach,
  };
}
