# Usage

## Install

Install the package in a Node.js 26 or later project:

```bash
npm install @eliware/mcp-client
```

The package uses native ECMAScript modules. Import `mcpClient` by name.

## Connect through Streamable HTTP

Use the Streamable HTTP endpoint from the server:

```js
import { mcpClient } from "@eliware/mcp-client";

const client = await mcpClient({ url: "https://mcp.example.com/mcp" });

try {
  const { tools } = await client.listTools();
  console.log(tools.map(({ name }) => name));
} finally {
  await client.close();
}
```

The default endpoint is `http://localhost:1234/mcp`. Set `url` to use a different endpoint.
The server must support protocol version `2026-07-28` through `server/discover`.
Set `MCP_URL` to change the default endpoint. Set `MCP_PORT` to change the default port when `MCP_URL` is unset.

## Call a tool

Use the tool name and input schema that the server returns from `listTools()`.

```js
const result = await client.callTool({
  name: "lookup",
  arguments: { query: "weather" },
});
console.log(result);
```

Check the server's tool description before you send input. A tool can change data or cause other effects.

## Use other server features

The returned object is the official SDK v2 `Client`. Use its methods to list and read resources or to list and get prompts.
The server may not support every method. Check the server response before you call a method.

```js
const { resources } = await client.listResources();
const resource = await client.readResource({ uri: resources[0].uri });
const { prompts } = await client.listPrompts();
const prompt = await client.getPrompt({ name: prompts[0].name });
```

## Connect through stdio

Set `transport` to `"stdio"`. Set `command` to the server executable. Set `args` when the server needs arguments.

```js
import { mcpClient } from "@eliware/mcp-client";

const client = await mcpClient({
  transport: "stdio",
  command: "node",
  args: ["server.mjs"],
  env: { NODE_ENV: "production" },
});

try {
  console.log(await client.listTools());
} finally {
  await client.close();
}
```

The transport starts the command as a local process.
Keep MCP protocol messages on stdout. Send server logs to stderr.

## Set authentication

Set `token` to send a static bearer token. The client sends it in the `Authorization` header.
Set `tokenProvider` to return a token for each request. Set `headers` to add HTTP request headers.

The package does not run OAuth discovery, consent, token refresh, or user sessions.
Use an OAuth library in your application. Return its access token from `tokenProvider`.
Use `tokenProvider` when the access token can change. The provider runs for HTTP requests.

The token provider can return a string or a promise that resolves to a string.
When it returns a token, the SDK sends that value as a bearer token.
When it returns an empty string, the client sends no `Authorization` header.
The client ignores `token`, `MCP_TOKEN`, and `Authorization` from `headers` when you set `tokenProvider`.

Use `headers` for more HTTP headers. These options do not apply to stdio.

## Configure the client

Pass options to `mcpClient(options)`. The [API guide](api.md) lists each option and its default.
Set `clientInfo` to change the client name and version. Set `capabilities` to declare client features.

## Configure logging

Pass a logger from `@eliware/log` to receive structured connection records.
The client creates a JSON logger at the `info` level when you omit the `logger` option.
Set `level` to `debug` to include connection start records.

```js
import { createLogger } from "@eliware/log";
import { mcpClient } from "@eliware/mcp-client";

const logger = createLogger({ level: "debug", format: "json" });
const client = await mcpClient({ url: "https://mcp.example.com/mcp", logger });
```

The client logs the operation and transport. It does not log URLs, headers, tokens, command arguments, or error messages.

The client logs connection start at `debug` and connection success at `info`.
It logs connection failure at `error` and cleanup failure at `warn`.
The logger supports `error`, `warn`, `info`, `http`, `verbose`, `debug`, and `silly` levels.

## Set environment values

The client reads these values when the matching option is not set:

| Variable    | Default | Required status | Purpose                                                      |
| ----------- | ------- | --------------- | ------------------------------------------------------------ |
| `MCP_URL`   | None    | Optional        | Sets the endpoint URL, such as `https://server.example/mcp`. |
| `MCP_PORT`  | `1234`  | Optional        | Sets the default URL port when `MCP_URL` is unset.           |
| `MCP_TOKEN` | None    | Optional        | Sets a bearer token, such as `your-mcp-token-here`.          |

Set these values in the process environment before you start the application.
The client does not load `.env` files.

The `url` option sets the endpoint directly. It prevents use of `MCP_URL` or `MCP_PORT`.
The `token` option replaces `MCP_TOKEN` and any `Authorization` value in `headers`.
When you set `tokenProvider`, it supplies bearer credentials for each request. The client ignores `token`, `MCP_TOKEN`, and `Authorization` from `headers`.
When the provider returns an empty string, the client sends no `Authorization` header.

## Manage connection errors

Catch errors from `mcpClient()` when the server cannot connect or does not support the required protocol.
Catch errors from client methods when a request fails.
Close a connected client in a `finally` clause.

## Close the client

Call `await client.close()` when the application no longer needs the connection.

## Run an example

Read the [examples index](../examples/README.md) for commands, results, and cleanup steps.
