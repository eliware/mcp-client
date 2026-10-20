# API

## Import

Import the named client function:

```js
import { mcpClient } from "@eliware/mcp-client";
```

The package exports `mcpClient` and the TypeScript type `McpClientOptions`.

## Connect

Call `await mcpClient(options)` to open a connection and initialize the MCP client.
The function returns the official SDK v2 `Client` instance.
The promise rejects when connection or protocol negotiation fails. Catch this error in your application.

## Options

All options are optional. The client uses Streamable HTTP when `transport` is not set.

| Option          | Type                              | Default                                                 | Description                                          |
| --------------- | --------------------------------- | ------------------------------------------------------- | ---------------------------------------------------- |
| `url`           | `string`                          | `MCP_URL` or `http://localhost:${MCP_PORT or 1234}/mcp` | Streamable HTTP endpoint.                            |
| `transport`     | `"http"` or `"stdio"`             | `"http"`                                                | Selects the connection transport.                    |
| `token`         | `string`                          | `MCP_TOKEN`                                             | Sets a static bearer token for HTTP.                 |
| `tokenProvider` | `() => string \| Promise<string>` | None                                                    | Supplies a bearer token for each HTTP request.       |
| `headers`       | `Record<string, string>`          | `{}`                                                    | Adds HTTP request headers.                           |
| `command`       | `string`                          | None                                                    | Sets the local server executable for stdio.          |
| `args`          | `string[]`                        | None                                                    | Sets arguments for the local process.                |
| `env`           | `Record<string, string>`          | None                                                    | Sets environment values for the local process.       |
| `clientInfo`    | SDK `Implementation`              | Package name and version                                | Sets the client identity.                            |
| `capabilities`  | SDK `ClientCapabilities`          | `{}`                                                    | Declares capabilities that the application supports. |

## Transport and authentication options

Set `url` for HTTP connections.
Set `command` for stdio connections. The client rejects stdio options without a command.
Set `token` to replace an `Authorization` value in `headers` with a bearer value.
Set `tokenProvider` to supply the bearer value for HTTP requests.
When you set `tokenProvider`, its token replaces `token`, `MCP_TOKEN`, and any `Authorization` value in `headers`.

## Protocol support

The client probes `server/discover` and requires protocol version `2026-07-28`.

## Return value

The return value provides the SDK v2 client methods.
Use methods such as `listTools()` and `callTool()` to interact with a server.
Call `close()` to end the connection and release its transport resources.

## Errors

The promise rejects if the client cannot connect or negotiate the required protocol.
Client methods reject when the server or transport reports a request error.
Catch these errors in the application.
Close the client in a `finally` clause after the connection opens.

## TypeScript

Use `McpClientOptions` for options and the SDK `Client` type for the return value.
Read the [type declarations](../src/index.d.ts) for exact TypeScript types.
