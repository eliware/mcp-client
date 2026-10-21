# MCP client documentation

Use these guides to install the package, connect to an MCP server, and use the client.

## Start here

1. Install the package in a Node.js 26 or later application.
2. Use Streamable HTTP for a remote or local HTTP server. Use stdio for a local server process.
3. Connect with `mcpClient()` and close the returned client when the application finishes.
4. Use a server that supports protocol version `2026-07-28` through `server/discover`.

## Guides

- [Usage](usage.md) covers installation, HTTP, stdio, authentication, logging, and cleanup.
- [API](api.md) lists every public option, its default, and the returned SDK client.
- [Troubleshooting](troubleshooting.md) covers common connection, authentication, and protocol failures.
- [Migration to version 14](migration-v14.md) explains changes from version 12 or earlier.

## Package behavior

The package uses native ECMAScript modules and the official MCP SDK v2 client.
It supports Streamable HTTP and stdio transports.
It supports bearer tokens, custom HTTP headers, asynchronous token providers, and structured connection logs.
It does not provide OAuth flows, token storage, user sessions, or a reconnect wrapper.
Keep OAuth and session behavior in the application that uses this package.
