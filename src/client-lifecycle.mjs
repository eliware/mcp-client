import { createReconnect, createTransportBinding } from "./reconnect.mjs";
import { createLifecycleFacade } from "./client-facade.mjs";
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
  const ignoreError = () => {};
  let closePromise;
  const state = { closed: false, closing: false };
  let reconnectPromise;
  let retry;
  const binding = createTransportBinding(() => retry.schedule());
  retry = createReconnect({
    connect,
    isClosed: () => state.closed,
    enabled,
    baseDelay,
    maxDelay,
    maxAttempts,
    log,
    onConnect: (client) => attach(client),
  });
  const close = () => {
    if (closePromise) return closePromise;
    state.closed = true;
    state.closing = true;
    retry.clear(binding.unbind);
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
    retry.clear(binding.unbind);
    if (state.closing) throw new Error("Cannot reconnect while close is in progress");
    if (closePromise) await closePromise;
    if (!state.closed) {
      state.closed = true;
      await getTransport()?.close?.();
      clearTransport?.();
    }
    state.closed = false;
    closePromise = undefined;
    try {
      return attach(await connect());
    } catch (error) {
      if (state.closing && closePromise) {
        await closePromise.catch(ignoreError);
      }
      if (getTransport()) {
        closePromise = undefined;
        await close().catch(ignoreError);
      } else if (!state.closed) {
        closePromise = undefined;
        await close().catch(ignoreError);
      }
      throw error;
    }
  };
  const attach = createLifecycleFacade({ close, reconnect, getTransport });
  return {
    isClosed: () => state.closed,
    reset: retry.reset,
    bind: binding.bind,
    attach,
  };
}
