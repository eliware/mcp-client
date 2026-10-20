export function resolveAuthHeaders(token, headers = {}, removeAuthorization = false) {
  if (!token && !removeAuthorization) return headers;

  const resolved = Object.fromEntries(
    Object.entries(headers).filter(([name]) => name.toLowerCase() !== "authorization"),
  );
  if (token) resolved.Authorization = `Bearer ${token}`;
  return resolved;
}
