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

Connect through Streamable HTTP or stdio. Use bearer tokens, custom HTTP headers, or token providers.

## Requirements

Use Node.js 26 or later.

## Setup

Install `@eliware/mcp-client` with `npm install @eliware/mcp-client`.

## Usage

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

Read the [documentation index](docs/README.md), [specifications](specs/README.md), and [release notes](RELEASE_NOTES.md).

## Development

Run `npm ci` to install the locked dependencies.
Read the [examples index](examples/README.md) for maintained examples.

## Testing

Run `npm test` for aggregate validation.
Run `npm run lint`, `npm run audit`, `npm run format`, `npm run format:check`, `npm run pack`, or `npm run typecheck` for one check.

## Troubleshooting

Read the [troubleshooting guide](docs/troubleshooting.md) for connection help.

## Security

Keep access tokens and private server data out of source files and logs.

## API

Import `mcpClient` from `@eliware/mcp-client`. The function returns an initialized MCP SDK client.
Read the [API guide](docs/api.md) and [TypeScript declarations](src/index.d.ts) for options and return types.

## Packaging

The package includes `src/`, `docs/`, `README.md`, `AGENTS.md`, `LICENSE`, `RELEASE_NOTES.md`, `examples/`, `specs/`, and `.env.example`.
Use numeric `MAJOR.MINOR.PATCH` versions and a `v<version>` tag for each release.
Run `npm run pack` before package checks. Follow the approved Eliware Operations publication procedure.

## Examples

Read the [examples index](examples/README.md) for commands, results, permissions, and cleanup.

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
