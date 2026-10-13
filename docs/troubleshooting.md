# Troubleshooting

## HTTP or SSE connection fails

Check that `url` points to the server endpoint. Use the path that the server provides.
Use `transport: "sse"` only when the server exposes a legacy SSE endpoint.
Check the server status, network access, and required bearer token.
For local defaults, check `MCP_URL` and `MCP_PORT`.

## Authentication fails

Check that the token is valid and that the server accepts bearer authentication.
Check that `tokenProvider` returns a string for each connection.
Check whether `token` or `tokenProvider` overrides the `Authorization` value in `headers`.

## stdio connection fails

Check that `command` names an installed executable. Check that `args` match the server command.
Pass required child process values with `env`.
Keep MCP protocol messages on stdout. Send server logs to stderr.

## Reconnect does not start

Check that `reconnect` is not `false`. Check that `maxReconnectAttempts` is greater than zero.
Check that delay values are valid numbers. The default first delay is 1000 milliseconds.
The default maximum delay is 60000 milliseconds. A retry also needs a transport close or error.

## Stop reconnect attempts

Call `await client.close()` or `await client.disconnect()`.
Call `await client.reconnect()` to open a new connection after close.

## Check the package

Run `npm test` from a package checkout. Check the [usage guide](usage.md) and [API guide](api.md).
