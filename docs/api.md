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
| `logger`        | `LoggerWithConfiguredLevels`      | JSON logger at `info` level                             | Receives structured connection records.              |

## Transport and authentication options

Set `url` for HTTP connections.
Set `command` for stdio connections. The client rejects stdio options without a command.
Set `token` to replace an `Authorization` value in `headers` with a bearer value.

When you set `tokenProvider`, it supplies bearer credentials for each request. The client ignores `token`, `MCP_TOKEN`, and `Authorization` from `headers`.
When the provider returns an empty string, the client sends no `Authorization` header.

## Logging

Pass a logger from `@eliware/log` with the `logger` option. The client creates a JSON logger at the `info` level when you omit this option.
The client emits `debug` and `info` records when a connection starts and succeeds.
The client emits an `error` record when a connection fails. It emits a `warn` record when transport cleanup fails.

Each record includes the operation and transport. The client does not include URLs, headers, tokens, command arguments, or error messages.
The logger supports `error`, `warn`, `info`, `http`, `verbose`, `debug`, and `silly` levels. Set the logger level to control which records appear.

```js
import { createLogger } from "@eliware/log";
import { mcpClient } from "@eliware/mcp-client";

const logger = createLogger({ level: "debug", format: "json" });
const client = await mcpClient({ url: "https://mcp.example.com/mcp", logger });
```

## Protocol support

The client probes `server/discover` and requires protocol version `2026-07-28`.

## Return value

The return value is the initialized SDK v2 `Client` instance.
Use methods such as `listTools()`, `callTool()`, `listResources()`, `readResource()`, `listPrompts()`, and `getPrompt()` to interact with a server.
The server may not support every method.
Call `close()` to end the connection and release its transport resources.

## Connection lifecycle

Await `mcpClient()` before you call client methods.
The promise rejects if setup, connection, or protocol negotiation fails.
After `mcpClient()` resolves, call `close()` when the application no longer uses the client.
Use `try` and `finally` to close the client when an operation fails.

```js
const client = await mcpClient({ url: "https://mcp.example.com/mcp" });

try {
  const { tools } = await client.listTools();
  console.log(tools);
} finally {
  await client.close();
}
```

## Errors

The promise rejects if the client cannot connect or negotiate the required protocol.
Client methods reject when the server or transport reports a request error.
Catch these errors in the application.
Close the client in a `finally` clause after the connection opens.

## TypeScript

The package includes TypeScript declarations.
Import `McpClientOptions` from this package and import `Client` from `@modelcontextprotocol/client` for explicit types.
The [type declarations](../src/index.d.ts) define the package API.

```ts
import { mcpClient } from "@eliware/mcp-client";
import type { McpClientOptions } from "@eliware/mcp-client";

const options: McpClientOptions = { url: "https://mcp.example.com/mcp" };
const client = await mcpClient(options);
```
