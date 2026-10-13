# Usage

## Install

Install the package in a Node.js 26 or later project:

```bash
npm install @eliware/mcp-client
```

The package uses native ECMAScript modules. Use `import` to load it.

## Connect over HTTP

Use Streamable HTTP to connect to the server endpoint:

```js
import mcpClient from "@eliware/mcp-client";

const client = await mcpClient({ url: "https://mcp.example.com/mcp" });
const { tools } = await client.listTools();
console.log(tools.map(({ name }) => name));
await client.close();
```

The default URL is `http://localhost:1234/mcp`. Set `url` to use another endpoint.

## Choose a transport

The default transport is Streamable HTTP. Set `transport: "sse"` to use a server with a legacy SSE endpoint.
Set `transport: "stdio"` to start a local server process. Set `command` to its executable path.
Set `args` to pass command arguments. Set `env` to pass child process environment values.
Keep the MCP server protocol on stdout. Send server logs to stderr.

## Set authentication

Set `token` to send a static bearer token. The client sends it in the `Authorization` header.
Set `tokenProvider` to return a token for each connection. The provider also runs after a reconnect.
Set `headers` to send extra HTTP or SSE request headers. The `token` option replaces an `Authorization` value in `headers`.

The package does not perform OAuth discovery, PKCE, client registration, consent, token refresh, or user sessions.
Use an OAuth2 or OIDC library in your application. Pass its access token through `tokenProvider`.

## Configure the client

Pass options to `mcpClient(options)`. The [API guide](api.md) lists each option and its default.
Set `clientInfo` to change the client name and version. Set `capabilities` to declare client capabilities.
Set `log` to provide optional `debug`, `warn`, and `error` functions.

## Set environment values

The client reads these variables when the matching option is not set:

| Variable                   | Default                     | Purpose                              |
| -------------------------- | --------------------------- | ------------------------------------ |
| `MCP_URL`                  | `http://localhost:1234/mcp` | Server endpoint URL.                 |
| `MCP_PORT`                 | `1234`                      | Port in the default URL.             |
| `MCP_TOKEN`                | None                        | Fallback bearer token.               |
| `MCP_RECONNECT_BASE_DELAY` | `1000`                      | First retry delay in milliseconds.   |
| `MCP_RECONNECT_MAX_DELAY`  | `60000`                     | Maximum retry delay in milliseconds. |

The `url`, `token`, `reconnectBaseDelay`, and `reconnectMaxDelay` options take priority over their environment values.
The `tokenProvider` option takes priority over `token` and `MCP_TOKEN`.

## Control reconnects

Reconnect is enabled by default. The client retries after a transport close or error.
Set `reconnect: false` to stop automatic retries. Set `maxReconnectAttempts` to limit retry count.
Set `reconnectBaseDelay` and `reconnectMaxDelay` to set the delay range in milliseconds.
The delay grows after each failed retry. It does not exceed `reconnectMaxDelay`.
Call `close()` or `disconnect()` to close the transport and stop future retries.
Call `reconnect()` to open a new connection after close.

## Close the client

Call `await client.close()` when the application no longer needs the connection.
`disconnect()` has the same effect. `client.mcpConnection.transport` returns the active SDK transport.

## Run an example

Read the [examples index](../examples/README.md) for server needs, commands, results, and cleanup steps.
