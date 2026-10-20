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

Use `headers` for more HTTP headers. These options do not apply to stdio.

## Configure the client

Pass options to `mcpClient(options)`. The [API guide](api.md) lists each option and its default.
Set `clientInfo` to change the client name and version. Set `capabilities` to declare client features.

## Set environment values

The client reads these values when the matching option is not set:

| Variable    | Default | Purpose                                                   |
| ----------- | ------- | --------------------------------------------------------- |
| `MCP_URL`   | None    | Sets the default server endpoint URL.                     |
| `MCP_PORT`  | `1234`  | Sets the port in the default URL when `MCP_URL` is unset. |
| `MCP_TOKEN` | None    | Sets the bearer token when `token` is unset.              |

The `url` option sets the endpoint directly. It prevents use of `MCP_URL` or `MCP_PORT`.
The `token` option replaces `MCP_TOKEN` and any `Authorization` value in `headers`.
When you set `tokenProvider`, its token replaces values from `token` and `MCP_TOKEN`.

## Manage connection errors

Catch errors from `mcpClient()` when the server cannot connect or does not support the required protocol.
Catch errors from client methods when a request fails.
Close a connected client in a `finally` clause.

## Close the client

Call `await client.close()` when the application no longer needs the connection.

## Run an example

Read the [examples index](../examples/README.md) for commands, results, and cleanup steps.
