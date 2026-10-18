# Troubleshooting

## HTTP connection fails

Check that `url` points to the server endpoint. Use the path that the server provides.
Check the server status, network access, and required bearer token.
For local defaults, check `MCP_URL` and `MCP_PORT`.

## Authentication fails

Check that the token is valid and that the server accepts bearer authentication.
Check that `tokenProvider` returns a string for each request.
Check the order of `token`, `tokenProvider`, and `Authorization` in `headers`.

## stdio connection fails

Check that `command` names an installed executable. Check that `args` match the server command.
Pass required child process values with `env`.
Keep MCP protocol messages on stdout. Send server logs to stderr.

## Protocol version does not match

Use an MCP server that supports the current protocol version. The client does not connect to older versions.

## Check the package

Run `npm test` from a package checkout. Check the [usage guide](usage.md) and [API guide](api.md).
