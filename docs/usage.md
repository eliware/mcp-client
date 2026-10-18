# Usage

## Install

Install the package in a Node.js 26 or later project:

```bash
npm install @eliware/mcp-client
```

The package uses native ECMAScript modules. Import `mcpClient` by name.

## Connect through HTTP

Use the Streamable HTTP endpoint from the server:

```js
import { mcpClient } from "@eliware/mcp-client";

const client = await mcpClient({ url: "https://mcp.example.com/mcp" });
const { tools } = await client.listTools();
console.log(tools.map(({ name }) => name));
await client.close();
```

The default endpoint is `http://localhost:1234/mcp`. Set `url` to use a different endpoint.

## Connect through stdio

Set `transport` to `"stdio"`. Set `command` to the server executable. Set `args` when the server needs arguments.

```js
import { mcpClient } from "@eliware/mcp-client";

const client = await mcpClient({
  transport: "stdio",
  command: "node",
  args: ["server.mjs"],
});
```

Keep MCP protocol messages on stdout. Send server logs to stderr.

## Set authentication

Set `token` to send a static bearer token. The client sends it in the `Authorization` header.
Set `tokenProvider` to return a token for each request. Set `headers` to add HTTP request headers.

The package does not run OAuth discovery, consent, token refresh, or user sessions.
Use an OAuth library in your application. Return its access token from `tokenProvider`.

## Configure the client

Pass options to `mcpClient(options)`. The [API guide](api.md) lists each option and its default.
Set `clientInfo` to change the client name and version. Set `capabilities` to declare client features.

## Set environment values

The client reads these values when the matching option is not set:

| Variable    | Default                     | Purpose                                 |
| ----------- | --------------------------- | --------------------------------------- |
| `MCP_URL`   | `http://localhost:1234/mcp` | Server endpoint URL.                    |
| `MCP_PORT`  | `1234`                      | TCP endpoint number in the default URL. |
| `MCP_TOKEN` | None                        | Fallback bearer token.                  |

The `url` option replaces the `MCP_URL` and `MCP_PORT` values.
The `token` option replaces `MCP_TOKEN`. The token provider supplies a token first.

## Close the client

Call `await client.close()` when the application no longer needs the connection.

## Run an example

Read the [examples index](../examples/README.md) for commands, results, and cleanup steps.
