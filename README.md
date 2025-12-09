# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/mcp-client [![npm version](https://img.shields.io/npm/v/@eliware/mcp-client.svg)](https://www.npmjs.com/package/@eliware/mcp-client)[![license](https://img.shields.io/github/license/eliware/mcp-client.svg)](LICENSE)[![build status](https://github.com/eliware/mcp-client/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eliware/mcp-client/actions)

> A robust Node.js client for connecting to Model Context Protocol (MCP) servers with automatic reconnect, authentication, and flexible transport support.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [ESM Example](#esm-example)
  - [CommonJS Example](#commonjs-example)
- [API](#api)
- [TypeScript](#typescript)
- [License](#license)

## Features

- Connects to MCP servers with automatic reconnect
- Supports both ESM and CommonJS
- Customizable log, transport, and client classes
- Reads configuration from environment variables or options
- TypeScript type definitions included

## Installation

```bash
npm install @eliware/mcp-client
```

## Usage

### ESM Example

```js
import mcpClient from '@eliware/mcp-client';

(async () => {
  try {
    const client = await mcpClient({
      // token: 'your-mcp-token',
      // baseUrl: 'http://localhost:1234/',
    });
    console.log('MCP Client connected:', !!client);
    // Use the client as needed...
  } catch (err) {
    console.error('Failed to connect MCP Client:', err);
  }
})();
```

### CommonJS Example

```js
const mcpClient = require('@eliware/mcp-client');

(async () => {
  try {
    const client = await mcpClient({
      // token: 'your-mcp-token',
      // baseUrl: 'http://localhost:1234/',
    });
    console.log('MCP Client connected:', !!client);
    // Use the client as needed...
  } catch (err) {
    console.error('Failed to connect MCP Client:', err);
  }
})();
```

## API

### `mcpClient(options?: McpClientOptions): Promise<any>`

Creates and connects an MCP client. Returns a connected client instance. Automatically reconnects on disconnect.

#### Options (McpClientOptions)

- `log` (optional): Custom log (default: @eliware/log)
- `port` (optional): MCP server port (default: 1234)
- `baseUrl` (optional): MCP server URL (default: <http://localhost:1234/>)
- `token` (optional): Authentication token (default: from MCP_TOKEN env)
- `ClientClass` (optional): Custom client class (default: SDK Client)
- `TransportClass` (optional): Custom transport class (default: SDK StreamableHTTPClientTransport)

## TypeScript

Type definitions are included:

```ts
import mcpClient, { McpClientOptions } from '@eliware/mcp-client';

const client = await mcpClient({
  token: 'your-mcp-token',
  baseUrl: 'http://localhost:1234/',
} as McpClientOptions);
```

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)[![eliware.org](https://eliware.org/logos/eliware_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## License

[MIT © 2025 Eli Sterling, eliware.org](LICENSE)

## Links

- [Home Page](https://eliware.org)
- [GitHub](https://github.com/eliware/mcp-client)
- [npm](https://www.npmjs.com/package/@eliware/mcp-client)
- [Discord](https://discord.gg/M6aTR9eTwN)
