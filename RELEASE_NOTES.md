# Release Notes

## 14.0.0 — 2026-10-21

### Added

- Add structured connection logging through an injectable `@eliware/log` logger.
- Add a migration guide for version 12 and earlier.
- Verify integration with MCP server 2.3.1, Node adapter 2.1.1, and Fastify adapter 2.0.1.

### Changed

- Replace the SDK v1 dependency with the official SDK v2 client and transport packages.
- Require protocol version `2026-07-28` through `server/discover`.
- Default to no client capabilities unless the application declares them.
- Support Streamable HTTP and stdio. Return the initialized SDK client and use its `close()` method.
- Use `tokenProvider` for each HTTP request and ignore static credentials when the application sets it.
- Update package metadata and dependencies for version 14, with `@eliware/log` and `@modelcontextprotocol/client`.
- Update examples, API guides, troubleshooting guidance, and migration documentation.
- Document checkout and published-package setup for each example, with process environment setup for stdio.
- Align repository rules, CI, npm publication, and Knit workflows with Eliware Convention 14.0.

### Breaking changes

- Import `mcpClient` by name.
- Remove the default export, helper exports, `disconnect()`, `reconnect()`, and `mcpConnection` properties.
- Remove SSE, automatic reconnect, and SDK v1 protocol negotiation.
- Require a server that supports protocol version `2026-07-28`.
- Send no `Authorization` header when `tokenProvider` returns an empty string. The client ignores `token`, `MCP_TOKEN`, and `Authorization` in `headers` when the application sets a provider.
- Declare client capabilities explicitly when an application requires them.
- Remove `MCP_RECONNECT_BASE_DELAY` and `MCP_RECONNECT_MAX_DELAY`.

### Migration

- Import `mcpClient` by name and remove imports for deleted helpers.
- Replace SSE and reconnect options with Streamable HTTP or stdio and call the SDK client's `close()` method.
- Set `clientInfo` and `capabilities` through `McpClientOptions` when the application requires other values.
- Use `tokenProvider` without a static `Authorization` header. Return a token for authenticated requests.

## 12.0.0 — 2026-10-13

### Added

- Add guides for use, the API, and fault diagnosis.
- Add examples for HTTP, SSE, stdio, headers, tokens, and reconnects.
- Add repository rules, shared validation, CI, package publication, and Knit workflows.
- Add `@eliware/mcp-server` as a package dependency.
- Add injectable client and transport classes for tests and adapters.
- Add TypeScript declarations and explicit package exports.

### Changed

- Require Node.js 26 or later and native ESM.
- Move source files and declarations under `src/`.
- Use the official MCP SDK for Streamable HTTP, SSE, and stdio transports.
- Split client, lifecycle, reconnect, options, transport, and header logic into focused modules.
- Update examples, package metadata, license details, and dependency versions.
- Apply Eliware Convention 13.0 and shared validation rules.

### Fixed

- Support IPv4 connections on Windows for HTTP and SSE transports.
- Keep SDK methods available through manual and automatic reconnects.
- Close failed initial connections and failed reconnect transports.
- Set transport state when close interrupts a connection.
- Reject reconnect attempts while close is in progress.
- Validate reconnect interval and retry count options.

### Breaking changes

- Require Node.js 26 or later.
- Import the package through `@eliware/mcp-client`. Root file imports no longer work.
- Use the official SDK client methods through the package facade.

### Migration

1. Install version 12.0.0.
2. Use Node.js 26 or later.
3. Replace root file imports with `@eliware/mcp-client`.
4. Read the usage guide and update connection options.
