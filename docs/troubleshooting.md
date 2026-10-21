# Troubleshooting

## HTTP connection fails

Check that `url` points to the server endpoint. Use the path that the server provides.
Check the server status, network access, and required bearer token.
Check that the server supports protocol version `2026-07-28` through `server/discover`.
For local defaults, check `MCP_URL` and `MCP_PORT`.
Set `url` to override both environment values.

## Authentication fails

Check that the token is valid and that the server accepts bearer authentication.
Check that `tokenProvider` returns a valid token for each request.
When you set `tokenProvider`, it supplies bearer credentials for each request. The client ignores `token`, `MCP_TOKEN`, and `Authorization` from `headers`.
When the provider returns an empty string, the client sends no `Authorization` header.
Without `tokenProvider`, the `token` option replaces an `Authorization` value in `headers`.

## stdio connection fails

Check that `command` names an installed executable. Check that `args` match the server command.
Pass required child process values with `env`.
Keep MCP protocol messages on stdout. Send server logs to stderr.
Set `transport` to `stdio` and provide a non-empty `command`.

## Protocol version does not match

Use an MCP server that supports protocol version `2026-07-28`.
The client does not connect to a server that supports only an older version.

## Check the package

Run `npm test` from a package checkout. Check the [usage guide](usage.md) and [API guide](api.md).

## Logs do not show connection starts

The default logger uses the `info` level, so it omits `debug` records.
Pass a logger from `@eliware/log` with `level: "debug"` to include connection starts.
Check the configured logger level and transports when expected records do not appear.
