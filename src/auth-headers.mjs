export function resolveAuthHeaders(token, headers = {}, { omitAuthorization = false } = {}) {
  const resolvedHeaders = omitAuthorization
    ? Object.fromEntries(
        Object.entries(headers).filter(([name]) => name.toLowerCase() !== "authorization"),
      )
    : headers;
  return token ? { ...resolvedHeaders, Authorization: `Bearer ${token}` } : resolvedHeaders;
}
