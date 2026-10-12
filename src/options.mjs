export function numberOption(value, fallback, minimum = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= minimum ? number : fallback;
}

export function assertOpen(closed) {
  if (closed) throw new Error("MCP client is closed");
}

export function normalizeOptions(options) {
  return options ?? {};
}
