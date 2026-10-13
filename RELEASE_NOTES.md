# Release Notes

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
- Apply Eliware Convention 12 and shared validation rules.

### Fixed

- Support IPv4 connections on Windows for HTTP and SSE transports.
- Keep SDK methods available through manual and automatic reconnects.
- Close failed initial connections and failed reconnect transports.
- Keep transport state clear when close interrupts a connection.
- Reject reconnect attempts while close is in progress.
- Validate reconnect delay and attempt options.

### Breaking changes

- Require Node.js 26 or later.
- Import the package through `@eliware/mcp-client`. Old root file imports no longer work.
- Use the official SDK client methods through the package facade.

### Migration

1. Install version 12.0.0.
2. Use Node.js 26 or later.
3. Replace old root file imports with `@eliware/mcp-client`.
4. Review the usage guide and update connection options.
