# Release Notes

## 14.0.0 — 2026-10-21

### Changed

- Add structured connection logs with an injectable `@eliware/log` logger.
- Require protocol version `2026-07-28` through SDK v2 discovery without older handshake support.
- Default to no client capabilities unless the application declares them.
- Verify interoperability with MCP server 2.3.1, Node adapter 2.1.1, and Fastify adapter 2.0.1.
- Connect through Streamable HTTP or stdio.
- Return the initialized SDK client and use its `close()` method.
- Limit the public API to the named `mcpClient` function.
- Remove SDK v1, SSE, reconnect wrappers, helper exports, and package entries for removed features.
- Update examples, API guides, package metadata, and tests for the version 14 package.
- Align repository rules with Eliware Convention 14.0 and current Knit and npm workflows.
- Expand end-user documentation and add migration guidance for version 14.
- Ignore static `Authorization` headers when `tokenProvider` is set.

### Breaking changes

- Import `mcpClient` by name.
- Remove the default export, `disconnect()`, `reconnect()`, and `mcpConnection` properties.
- Remove SSE transport support and all SDK v1 protocol negotiation.
- Use a server that supports the current MCP protocol version.

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
