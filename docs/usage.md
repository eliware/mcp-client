# Usage

## Connect over HTTP

Set the server URL and call the client:

```js
import mcpClient from "@eliware/mcp-client";

const client = await mcpClient({ url: "https://mcp.example.com/mcp" });
const { tools } = await client.listTools();
console.log(tools.map(({ name }) => name));
await client.close();
```

The default URL is `http://localhost:1234/mcp`. Set `MCP_URL` or `MCP_PORT` to change it.

## Authenticate

Set `token` for a static bearer token. Set `tokenProvider` for a token that can change.
The provider runs each time the client connects, including after a reconnect.
Set `headers` to add request headers. The `token` option takes priority over `Authorization` in `headers`.

## Select a transport

Use the default `http` transport for Streamable HTTP. Set `transport: 'sse'` for a legacy SSE server.
Set `transport: 'stdio'`, `command`, and optional `args` and `env` for a local server process.
Keep server logs on stderr when you use stdio.

## Reconnect

Reconnect is enabled by default. Set `reconnect: false` to disable it.
Set `reconnectBaseDelay`, `reconnectMaxDelay`, and `maxReconnectAttempts` to change the retry policy.
Call `close()` or `disconnect()` to stop retries. Call `reconnect()` to create a new connection.

## Environment settings

| Setting                    | Default                     | Use                                  |
| -------------------------- | --------------------------- | ------------------------------------ |
| `MCP_URL`                  | `http://localhost:1234/mcp` | MCP endpoint URL.                    |
| `MCP_PORT`                 | `1234`                      | Local port in the default URL.       |
| `MCP_TOKEN`                | None                        | Fallback bearer token.               |
| `MCP_RECONNECT_BASE_DELAY` | `1000`                      | First retry delay in milliseconds.   |
| `MCP_RECONNECT_MAX_DELAY`  | `60000`                     | Maximum retry delay in milliseconds. |

Pass options in the `mcpClient` call to override environment settings.
