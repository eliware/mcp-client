# Release Notes

## 1.1.2 — Current changes

This release modernizes the MCP client as a pure-ESM, standards-compatible companion to `@eliware/mcp-server`.

### Added

- Streamable HTTP, legacy SSE, and stdio transport support.
- Static bearer-token and async token-provider authentication.
- Custom request headers.
- Automatic reconnect with configurable delays and attempt limits.
- Explicit `close()`, `disconnect()`, and `reconnect()` lifecycle helpers.
- Injectable client and transport classes for adapters and tests.
- TypeScript declarations.
- Server package dev dependency for real stdio integration testing.
- Focused examples for HTTP, SSE, stdio, tokens, headers, reconnects, and DI.
- Oxlint integration.

### Changed

- Removed CommonJS entrypoints, examples, and tests.
- Refactored the client around the official MCP SDK transports.
- Updated README and API documentation.
- Updated package description, keywords, npm file inclusion, and lockfile.
- Documented provider-neutral OAuth usage through token providers.

### Verification

- Oxlint: 0 warnings/errors.
- Jest: 20 tests passed.
- Coverage: 100% statements, branches, functions, and lines.
- npm package contents verified with `npm pack --dry-run`.
- Real stdio integration tested against `@eliware/mcp-server`.

## Historical tags

- `1.1.1` — previous repository baseline.
