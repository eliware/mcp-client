import { createReconnect, rejectReconnectDuringClose } from "./reconnect.mjs";
export function createClientLifecycle({
  connect,
  getTransport,
  clearTransport,
  closeDispatcher,
  enabled,
  baseDelay,
  maxDelay,
  maxAttempts,
  log,
}) {
  let closed = false;
  let closePromise;
  const closeState = { closing: false };
  let reconnectPromise;
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
    closeState.closing = true;
    retry.clear();
    closePromise = (async () => {
      try {
        await getTransport()?.close?.();
      } finally {
        try {
          await closeDispatcher?.();
        } finally {
          clearTransport?.();
          closeState.closing = false;
        }
      }
    })();
    return closePromise;
  };
  const reconnect = () => {
    if (reconnectPromise) return reconnectPromise;
    reconnectPromise = reconnectClient().finally(() => {
      reconnectPromise = undefined;
    });
    return reconnectPromise;
  };
  const reconnectClient = async () => {
    retry.clear();
    await rejectReconnectDuringClose(closeState.closing, closePromise);
    if (closePromise) await closePromise;
    if (!closed) {
      closed = true;
      await getTransport()?.close?.();
      clearTransport?.();
    }
    closed = false;
    closePromise = undefined;
    try {
      return attach(await connect());
    } catch (error) {
      closed = true;
      closePromise = undefined;
      await close().catch(() => {
        closePromise = undefined;
      });
      throw error;
    }
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
