export function createTransportBinding(schedule) {
  let unbindCurrent;
  const unbind = () => {
    unbindCurrent?.();
    unbindCurrent = undefined;
  };
  const bind = (transport) => {
    unbind();
    if (typeof transport.on !== "function") return;
    const handler = () => schedule();
    transport.on("close", handler);
    transport.on("error", handler);
    unbindCurrent = () => {
      const remove = transport.off ?? transport.removeListener;
      remove?.call(transport, "close", handler);
      remove?.call(transport, "error", handler);
    };
  };
  return { bind, unbind };
}

export function createReconnect({
  connect,
  isClosed,
  enabled,
  baseDelay,
  maxDelay,
  maxAttempts,
  log,
}) {
  let timer;
  let attempts = 0;
  let delay = baseDelay;

  const reset = () => {
    attempts = 0;
    delay = baseDelay;
  };
  const clear = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };
  const schedule = () => {
    if (isClosed() || !enabled || timer || attempts >= maxAttempts) return;
    attempts += 1;
    timer = setTimeout(async () => {
      timer = undefined;
      try {
        await connect();
      } catch (error) {
        if (!isClosed()) {
          log.error?.("MCP reconnect failed", error);
          schedule();
        }
      }
    }, delay);
    delay = Math.min(Math.max(delay * 2, baseDelay), maxDelay);
  };
  return { clear, reset, schedule };
}
