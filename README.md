# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/mcp-client [![npm](https://img.shields.io/npm/v/@eliware/mcp-client)](https://www.npmjs.com/package/@eliware/mcp-client) [![License](https://img.shields.io/github/license/eliware/mcp-client)](https://github.com/eliware/mcp-client/blob/main/LICENSE) [![CI](https://github.com/eliware/mcp-client/actions/workflows/ci.yaml/badge.svg)](https://github.com/eliware/mcp-client/actions/workflows/ci.yaml)

Standards-compatible pure-ESM Model Context Protocol client for Streamable HTTP, SSE, stdio, bearer authentication, OAuth token providers, and resilient reconnects.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Setup](#setup)
- [Usage](#usage)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [API](#api)
- [Packaging](#packaging)
- [Examples](#examples)
- [Support](#support)
- [Links](#links)
- [License](#license)

## Features

- Use Streamable HTTP, legacy SSE, or stdio.
- Set bearer tokens, custom headers, or an async token provider.
- Call the official MCP SDK client methods.
- Set reconnect delays and retry limits.
- Close, disconnect, or reconnect the active client.
- Inject client and transport classes for adapters and tests.
- Import the native ESM package and TypeScript declarations.

## Requirements

- Use Node.js 26 or later.
- Provide an MCP endpoint for HTTP or SSE.
- Provide a local server command for stdio.

## Setup

Install the package:

```bash
npm install @eliware/mcp-client
```

## Usage

Connect to a remote MCP server over Streamable HTTP:

```js
import mcpClient from "@eliware/mcp-client";

const client = await mcpClient({
  url: "https://mcp.example.com/mcp",
  token: process.env.MCP_TOKEN,
});

const { tools } = await client.listTools();
console.log(tools.map(({ name }) => name));
await client.close();
```

The default URL is `http://localhost:1234/mcp`. Set `MCP_URL` or `MCP_PORT` to change it.
Set `MCP_TOKEN` to provide a default bearer token.

Use an async token provider for rotating credentials:

```js
const client = await mcpClient({
  url: "https://mcp.example.com/mcp",
  tokenProvider: async () => getCurrentAccessToken(),
});
```

The token provider runs for each connection, including reconnects. A `token` value takes priority over an `Authorization` value in `headers`.

The client does not run OAuth discovery, PKCE, client registration, consent, token refresh, or user sessions. Use an OAuth2 or OIDC library, then pass its access token to `tokenProvider`.

Use `transport: 'sse'` only with a server that exposes the legacy SSE endpoint. Use `transport: 'stdio'` with a local server command. Keep server logs on stderr.

Set `reconnect`, `reconnectBaseDelay`, `reconnectMaxDelay`, and `maxReconnectAttempts` to control retries. Use `close()` or `disconnect()` to stop retries. Use `reconnect()` to create a new connection.

Read the [documentation index](docs/README.md), [usage](docs/usage.md), [troubleshooting](docs/troubleshooting.md), [specifications](specs/README.md), and [release notes](RELEASE_NOTES.md) for more detail.

## Development

Install locked dependencies:

```bash
npm ci
```

Use Node.js 26 or later and npm 12 or later for repository validation.

## Testing

Run aggregate validation:

```bash
npm test
```

Run lint, format, audit, package, or type checks with `npm run lint`, `npm run format:check`, `npm run audit`, `npm run pack`, or `npm run typecheck`.

## Troubleshooting

Check the server URL and transport type. Check the required server permission. Check that the stdio server writes logs to stderr.

Run `npm test` after a source change. Read [troubleshooting](docs/troubleshooting.md) for common connection failures.

## Security

Keep tokens and OAuth credentials in secure configuration. Use HTTPS for remote servers.
Treat tool arguments and results as sensitive data. Do not log secrets or credential-bearing URLs.

## API

`mcpClient(options)` connects to an MCP server and returns an initialized SDK client. The result also provides `close()`, `disconnect()`, `reconnect()`, and `mcpConnection.transport`.

The options include `url`, `transport`, `token`, `tokenProvider`, `headers`, `command`, `args`, `env`, `clientInfo`, `capabilities`, `log`, reconnect settings, and injectable SDK classes.

Import `McpClientOptions`, `ConnectedMcpClient`, and `McpTransport` from the TypeScript declarations. Read [src/index.d.ts](src/index.d.ts) for full option types.

## Packaging

The npm package includes `src/`, `docs/`, `examples/`, `specs/`, this README, `AGENTS.md`, `LICENSE`, `RELEASE_NOTES.md`, and `.env.example`.

The package does not include tests, fixtures, workflows, or lockfiles. Run `npm run pack` to check package contents.

## Examples

Read the [examples index](examples/README.md) for prerequisites, commands, results, permissions, and cleanup steps.

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)[![eliware.org](https://eliware.org/logos/eliware_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## Links

- [Home Page](https://eliware.org)
- [GitHub Org](https://github.com/eliware)
- [GitHub Repo](https://github.com/eliware/mcp-client)
- [Bug Reports](https://github.com/eliware/mcp-client/issues)
- [npm](https://www.npmjs.com/package/@eliware/mcp-client)
- [Discord](https://discord.gg/M6aTR9eTwN)

## License

[MIT © Eliware](LICENSE)
