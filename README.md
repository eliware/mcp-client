# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)
# @eliware/mcp-client [![npm version](https://img.shields.io/npm/v/@eliware/mcp-client.svg)](https://www.npmjs.com/package/@eliware/mcp-client) [![license](https://img.shields.io/github/license/eliware/mcp-client.svg)](LICENSE) [![build status](https://github.com/eliware/mcp-client/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eliware/mcp-client/actions)

A pure-ESM Node.js client for standards-compatible Model Context Protocol (MCP) servers.

It uses the official MCP SDK transports and supports Streamable HTTP (recommended), legacy SSE, and stdio. The client manages connection lifecycle and optional reconnects; authentication, OAuth flows, user sessions, and token persistence remain application responsibilities.

## Features

- Streamable HTTP, SSE, and stdio transports.
- Bearer tokens, custom headers, and async token providers.
- Standard MCP SDK `Client` API (`listTools`, `callTool`, resources, prompts, etc.).
- Bounded exponential reconnect with configurable limits.
- Explicit `close()`, `disconnect()`, and `reconnect()` lifecycle methods.
- Injectable client and transport classes for tests and adapters.
- Pure ESM with TypeScript declarations.

## Requirements

- Node.js 26 or newer
- An MCP server endpoint for live HTTP/SSE use, or a local MCP server command for stdio

## Install

```bash
npm install @eliware/mcp-client
```

Node.js must support native ESM and the MCP SDK requirements.

## Streamable HTTP

Streamable HTTP is the recommended transport for remote MCP servers. The URL should identify the server's MCP endpoint, normally `/mcp`:

```js
import mcpClient from '@eliware/mcp-client';

const client = await mcpClient({
  url: 'https://mcp.example.com/mcp',
  token: process.env.MCP_TOKEN,
});

const { tools } = await client.listTools();
console.log(tools.map(({ name }) => name));
console.log(await client.callTool({
  name: 'echo',
  arguments: { echoText: 'hello' },
}));

await client.close();
```

If `url` is omitted, `MCP_URL` is used. Otherwise the default is `http://localhost:1234/mcp` (or `MCP_PORT` in place of `1234`).

## Authentication

Pass a static bearer token:

```js
const client = await mcpClient({
  url: 'https://mcp.example.com/mcp',
  token: process.env.MCP_TOKEN,
});
```

For rotating credentials, provide an async token provider. It is called whenever the client creates a connection, including reconnects:

```js
const client = await mcpClient({
  url: 'https://mcp.example.com/mcp',
  tokenProvider: async () => getCurrentAccessToken(),
});
```

Additional headers can be supplied with `headers`. When both `token` and an `Authorization` header are provided, the bearer header generated from `token` takes precedence.

This package does not implement OAuth discovery, PKCE, dynamic client registration, consent, refresh-token storage, or user sessions. Applications may use any OAuth2/OIDC library, then pass the resulting access token through `tokenProvider`. This keeps the client provider-neutral and compatible with standards-based MCP servers.

## SSE

Use SSE only for servers that expose the legacy MCP SSE transport:

```js
const client = await mcpClient({
  transport: 'sse',
  url: 'https://mcp.example.com/sse',
});
```

For a server implemented with `@eliware/mcp-server`, the default endpoint is Streamable HTTP at `/mcp`; use `transport: 'http'` unless that server explicitly exposes SSE.

## stdio

stdio launches a local MCP server as a child process. MCP JSON-RPC uses stdin/stdout, so the server must write logs to stderr:

```js
const client = await mcpClient({
  transport: 'stdio',
  command: process.execPath,
  args: ['/path/to/server.mjs', '--stdio'],
  env: { MCP_TOKEN: process.env.MCP_TOKEN ?? '' },
});

console.log(await client.listTools());
await client.close();
```

`command` is required for stdio. `args` and `env` are passed to the child process.

## Reconnect and lifecycle

Reconnect is enabled by default. Configure it as needed:

```js
const client = await mcpClient({
  reconnect: true,
  reconnectBaseDelay: 1000,
  reconnectMaxDelay: 60000,
  maxReconnectAttempts: 10,
});
```

Transport `close` and `error` events schedule reconnects. `close()` and its alias `disconnect()` stop reconnect attempts and close the active transport. `reconnect()` explicitly closes and creates a new connection.

For advanced integrations, `client.mcpConnection.transport` exposes the active SDK transport. Prefer the normal MCP client methods unless direct transport access is required.

## Configuration reference

`mcpClient(options)` accepts:

- `url` — MCP endpoint URL; defaults to `MCP_URL` or `http://localhost:${MCP_PORT || 1234}/mcp`.
- `transport` — `http` (default), `sse`, or `stdio`.
- `token` — static bearer token.
- `tokenProvider` — function returning a token or `undefined`.
- `headers` — additional request headers for HTTP/SSE.
- `command`, `args`, `env` — stdio child-process configuration.
- `clientInfo` — MCP client name/version sent to the server.
- `capabilities` — MCP client capabilities.
- `log` — optional `debug`, `error`, and `warn` functions.
- `reconnect` — enable/disable automatic reconnect; defaults to `true`.
- `reconnectBaseDelay` — initial delay in milliseconds; defaults to `1000`.
- `reconnectMaxDelay` — maximum delay in milliseconds; defaults to `60000`.
- `maxReconnectAttempts` — retry limit; defaults to unlimited.
- `ClientClass`, `TransportClass`, `HTTPTransportClass`, `SSETransportClass`, `StdioTransportClass` — injectable SDK classes for tests/adapters.

## Examples

Focused examples are in `examples/`:

- `http.mjs` — recommended Streamable HTTP transport.
- `sse.mjs` — legacy SSE transport.
- `stdio.mjs` — local child-process server.
- `static-token.mjs` — static bearer token.
- `token-provider.mjs` — rotating/async token provider.
- `custom-headers.mjs` — custom request headers.
- `reconnect.mjs` — reconnect policy.
- `injected-transport.mjs` — dependency-injected transport for adapters/tests.

Run one with:

```bash
MCP_URL=http://localhost:1234/mcp node examples/http.mjs
```

Examples are documentation and are included in the npm package; they are not imported by the library.

## Errors / Troubleshooting

Connection and transport failures are surfaced to the caller and optional logger. Use `close()` or `disconnect()` to stop reconnect attempts and release transports. Keep stdio server logs on stderr, and do not expose bearer tokens, credential-bearing URLs, or sensitive tool data.

## Development

```bash
npm install
npm run lint
npm test
npm run test:gaps
npm run lint
npm run typecheck
npm pack --dry-run
```

The test suite covers all public helpers, transport selection, reconnect behavior, and a real stdio integration using `@eliware/mcp-server` as a development dependency. The package tarball contains only the runtime module, declarations, examples, README, and license.

## Security

Keep MCP tokens, OAuth credentials, private URLs, and child-process environment secrets in secure configuration. Use HTTPS for remote deployments and treat tool arguments/results as potentially sensitive.

## License

MIT © Eli Sterling, eliware.org

## Support

For help, questions, or community chat:

[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)

## Links

- [Home Page](https://eliware.org)
- [GitHub Repo](https://github.com/eliware/mcp-client)
- [GitHub Org](https://github.com/eliware)
- [Discord](https://discord.gg/M6aTR9eTwN)
