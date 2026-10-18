# API

## Import

Import the named client function:

```js
import { mcpClient } from "@eliware/mcp-client";
```

The package exports `mcpClient` and the TypeScript type `McpClientOptions`.

## Connect

Call `await mcpClient(options)` to open a connection and initialize the MCP client.
The function returns the official SDK v2 client.
The promise rejects when the first connection fails. Catch this error in your application.

## Options

All options are optional. The client uses Streamable HTTP when `transport` is not set.

| Option          | Type                              | Default                                                 | Description                               |
| --------------- | --------------------------------- | ------------------------------------------------------- | ----------------------------------------- |
| `url`           | `string`                          | `MCP_URL` or `http://localhost:${MCP_PORT or 1234}/mcp` | Streamable HTTP endpoint.                 |
| `transport`     | `"http"` or `"stdio"`             | `"http"`                                                | Selects the connection transport.         |
| `token`         | `string`                          | `MCP_TOKEN`                                             | Sets a static bearer token.               |
| `tokenProvider` | `() => string \| Promise<string>` | None                                                    | Supplies a bearer token for each request. |
| `headers`       | `Record<string, string>`          | `{}`                                                    | Adds HTTP request headers.                |
| `command`       | `string`                          | None                                                    | Sets the local server executable.         |
| `args`          | `string[]`                        | None                                                    | Sets arguments for the local process.     |
| `env`           | `Record<string, string>`          | None                                                    | Sets environment values for the process.  |
| `clientInfo`    | SDK `Implementation`              | Package name and version                                | Sets the client identity.                 |
| `capabilities`  | SDK `ClientCapabilities`          | `{ sampling: {} }`                                      | Sets the client capabilities.             |

The `token` option replaces an `Authorization` value in `headers`.
The client pins MCP protocol version `2026-07-28`. It does not negotiate with older versions.

## Return value

The return value provides the SDK v2 client methods. Call `close()` to end the connection.

## TypeScript

Use `McpClientOptions` for options and the SDK `Client` type for the return value.
Read the [type declarations](../src/index.d.ts) for exact TypeScript types.
