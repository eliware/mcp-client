import { createReconnect, createTransportBinding } from "./reconnect.mjs";
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
  let closePromise;
  const state = { closed: false, closing: false };
  let reconnectPromise;
  const retry = createReconnect({
    connect,
    isClosed: () => state.closed,
    enabled,
    baseDelay,
    maxDelay,
    maxAttempts,
    log,
  });
  const binding = createTransportBinding(retry.schedule);
  const close = () => {
    if (closePromise) return closePromise;
    state.closed = true;
    state.closing = true;
    retry.clear();
    binding.unbind();
    closePromise = (async () => {
      try {
        await getTransport()?.close?.();
      } finally {
        try {
          await closeDispatcher?.();
        } finally {
          clearTransport?.();
          state.closing = false;
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
    if (state.closing) throw new Error("Cannot reconnect while close is in progress");
    if (closePromise) await closePromise;
    if (!state.closed) {
      state.closed = true;
      binding.unbind();
      await getTransport()?.close?.();
      clearTransport?.();
    }
    state.closed = false;
    closePromise = undefined;
    try {
      return attach(await connect());
    } catch (error) {
      if (state.closed && closePromise) {
        await closePromise.catch(() => {});
      } else {
        state.closed = true;
        closePromise = undefined;
        await close().catch(() => {});
      }
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
    isClosed: () => state.closed,
    reset: retry.reset,
    bind: binding.bind,
    attach,
  };
}
