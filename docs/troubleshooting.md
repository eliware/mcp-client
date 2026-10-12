# Troubleshooting

## HTTP or SSE connection fails

Check that the URL includes the server endpoint. Use `/mcp` for Streamable HTTP when the server uses that path.
Use the `sse` transport only when the server exposes a legacy SSE endpoint.
Check the server permissions and bearer token.

## stdio connection fails

Check that `command` names an installed program. Check that `args` match the server command.
Keep MCP messages on stdout. Write server logs to stderr.

## Reconnect does not start

Check that `reconnect` is not `false`. Check that `maxReconnectAttempts` is greater than zero.
Check that the delay settings use non-negative numbers.

## Stop reconnect attempts

Call `close()` or `disconnect()`. Both methods close the active transport.
Call `reconnect()` to create a new connection after a close.

## Check the package

Run `npm test` from the repository. Check `MCP_URL`, `MCP_PORT`, and token settings.
