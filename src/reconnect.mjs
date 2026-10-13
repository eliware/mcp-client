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
        log.error?.("MCP reconnect failed", error);
        schedule();
      }
    }, delay);
    delay = Math.min(Math.max(delay * 2, baseDelay), maxDelay);
  };
  return { clear, reset, schedule };
}
