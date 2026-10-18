# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/mcp-client [![npm](https://img.shields.io/npm/v/@eliware/mcp-client)](https://www.npmjs.com/package/@eliware/mcp-client) [![License](https://img.shields.io/github/license/eliware/mcp-client)](https://github.com/eliware/mcp-client/blob/main/LICENSE) [![CI](https://github.com/eliware/mcp-client/actions/workflows/ci.yaml/badge.svg)](https://github.com/eliware/mcp-client/actions/workflows/ci.yaml)

Pure ESM MCP client for SDK v2, Streamable HTTP, stdio, and bearer authentication.

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

- Connect through Streamable HTTP or stdio.
- Set bearer tokens, custom headers, or an async token provider.
- Use the official SDK v2 client methods.
- Close the client with `close()`.
- Import the ESM package and TypeScript declarations.

## Requirements

- Use Node.js 26 or later.
- Provide a Streamable HTTP endpoint.
- Provide a local server command for stdio.

## Setup

Install the package:

```bash
npm install @eliware/mcp-client
```

## Usage

Connect to a remote MCP server through Streamable HTTP:

```js
import { mcpClient } from "@eliware/mcp-client";

const client = await mcpClient({ url: "https://mcp.example.com/mcp" });
const { tools } = await client.listTools();
console.log(tools.map(({ name }) => name));
await client.close();
```

Read the [documentation index](docs/README.md), [usage guide](docs/usage.md), [API guide](docs/api.md), [troubleshooting guide](docs/troubleshooting.md), [specifications](specs/README.md), and [release notes](RELEASE_NOTES.md).

## Development

Install locked dependencies with `npm ci`. Use Node.js 26 or later and npm 12 or later.

## Testing

Run `npm test` for aggregate validation. Run `npm run lint`, `npm run format:check`, `npm run audit`, `npm run pack`, or `npm run typecheck` for one check.

## Troubleshooting

Check the endpoint URL, transport, server permissions, and token. For stdio, send server logs to stderr.
Read the [troubleshooting guide](docs/troubleshooting.md) for connection help.

## Security

Keep tokens and OAuth credentials out of source files. Use HTTPS for remote servers.
Keep tool arguments and results private. Do not put secrets or URLs with credentials in records.

## API

Call `mcpClient(options)` to connect. The function returns an initialized SDK v2 client.
Call `close()` when the application no longer needs the connection.
Read the [API guide](docs/api.md) and [TypeScript declarations](src/index.d.ts) for all options and return types.

## Packaging

The npm package includes `src/`, `docs/`, `examples/`, `specs/`, `README.md`, `AGENTS.md`, `LICENSE`, `RELEASE_NOTES.md`, and `.env.example`.

## Examples

Read the [examples index](examples/README.md) for needs, commands, results, permissions, and cleanup.

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
