# API

## Import

Import the default client function or a named helper:

```js
import mcpClient, { createTransport, numberOption } from "@eliware/mcp-client";
```

The package exports `mcpClient`, `createTransport`, `resolveAuthHeaders`, and `numberOption`.
It also exports the TypeScript types `McpClientOptions`, `ConnectedMcpClient`, and `McpTransport`.

## Connect

Call `await mcpClient(options)` to open a connection and initialize the MCP client.
The function returns the official SDK client with lifecycle methods attached.
The promise rejects when the first connection fails. Catch this error in your application.

## Options

All options are optional. The client uses Streamable HTTP when `transport` is not set.

| Option                 | Type                                                        | Default                                                 | Description                                           |
| ---------------------- | ----------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| `url`                  | `string`                                                    | `MCP_URL` or `http://localhost:${MCP_PORT or 1234}/mcp` | HTTP or SSE endpoint.                                 |
| `transport`            | `"http"`, `"sse"`, or `"stdio"`                             | `"http"`                                                | SDK transport to use.                                 |
| `token`                | `string`                                                    | `MCP_TOKEN`                                             | Static bearer token.                                  |
| `tokenProvider`        | `() => string \| Promise<string \| undefined>`              | None                                                    | Token source for each HTTP or SSE connection.         |
| `headers`              | `Record<string, string>`                                    | `{}`                                                    | HTTP or SSE request headers.                          |
| `command`              | `string`                                                    | None                                                    | Executable for stdio. Required for stdio.             |
| `args`                 | `string[]`                                                  | None                                                    | Arguments for the stdio process.                      |
| `env`                  | `Record<string, string>`                                    | None                                                    | Environment values for the stdio process.             |
| `clientInfo`           | `{ name: string; version: string }`                         | Package name and version                                | Client identity sent at initialization.               |
| `capabilities`         | `Record<string, unknown>`                                   | `{ sampling: {} }`                                      | Client capabilities sent at initialization.           |
| `log`                  | Object with optional `debug`, `warn`, and `error` functions | Shared logger                                           | Receives lifecycle and retry messages.                |
| `reconnect`            | `boolean`                                                   | `true`                                                  | Enables automatic retries.                            |
| `reconnectBaseDelay`   | `number`                                                    | `MCP_RECONNECT_BASE_DELAY` or `1000`                    | First retry interval in milliseconds.                 |
| `reconnectMaxDelay`    | `number`                                                    | `MCP_RECONNECT_MAX_DELAY` or `60000`                    | Maximum retry interval in milliseconds.               |
| `maxReconnectAttempts` | `number`                                                    | `Infinity`                                              | Maximum retry count.                                  |
| `forceIPv4`            | `boolean`                                                   | `true` on Windows and `false` on other systems          | Uses IPv4 for HTTP and SSE.                           |
| `ClientClass`          | Class                                                       | Official SDK `Client`                                   | Replaces the SDK client class.                        |
| `TransportClass`       | Class                                                       | None                                                    | Replaces transport selection with a custom transport. |
| `HTTPTransportClass`   | Class                                                       | Official SDK Streamable HTTP class                      | Replaces the HTTP transport class.                    |
| `SSETransportClass`    | Class                                                       | Official SDK SSE class                                  | Replaces the SSE transport class.                     |
| `StdioTransportClass`  | Class                                                       | Official SDK stdio class                                | Replaces the stdio transport class.                   |

The `token` option replaces an `Authorization` value in `headers`.
When set, `tokenProvider` supplies each token. It does not use `token` or `MCP_TOKEN`.
The `forceIPv4` option has no effect on stdio.

## Return value

The return value includes every method from the official MCP SDK `Client`.

| Member                    | Result                                                     |
| ------------------------- | ---------------------------------------------------------- |
| `close()`                 | Closes the active transport and stops automatic retries.   |
| `disconnect()`            | Alias for `close()`.                                       |
| `reconnect()`             | Opens a new connection and returns the initialized client. |
| `mcpConnection.transport` | The active SDK transport.                                  |
| `mcpConnection.close()`   | Alias for `close()`.                                       |

## Helpers

`createTransport(options)` creates an SDK transport without connecting it.
`resolveAuthHeaders(token, headers)` returns headers with a bearer token when `token` has a value.
`numberOption(value, fallback, minimum)` returns a valid number or the fallback value.
The default minimum for `numberOption` is zero.

## TypeScript

Use `McpClientOptions` for options, `ConnectedMcpClient` for the return value, and `McpTransport` for transport names.
Read the [type declarations](../src/index.d.ts) for exact TypeScript types.
