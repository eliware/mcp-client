export function numberOption(value, fallback, minimum = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= minimum ? number : fallback;
}

export async function resolveToken({ token, tokenProvider }) {
  return tokenProvider ? tokenProvider() : (token ?? process.env.MCP_TOKEN);
}

export function resolveReconnectDelays(baseDelay, maxDelay) {
  const baseValue = baseDelay === undefined ? process.env.MCP_RECONNECT_BASE_DELAY : baseDelay;
  const resolvedBaseDelay = numberOption(baseValue, 1000, 0);
  const maxValue = maxDelay === undefined ? process.env.MCP_RECONNECT_MAX_DELAY : maxDelay;
  const resolvedMaxDelay = numberOption(maxValue, 60000, resolvedBaseDelay);
  return { baseDelay: resolvedBaseDelay, maxDelay: resolvedMaxDelay };
}

export function assertOpen(closed) {
  if (closed) throw new Error("MCP client is closed");
}

export function normalizeOptions(options) {
  return options ?? {};
}
