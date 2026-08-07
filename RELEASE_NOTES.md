# Release Notes

## 1.1.4 — 2026-08-07

- Standardized validation scripts, TypeScript checking, CI, and package metadata.
- Updated `@eliware/common` to 1.1.7 and `@eliware/mcp-server` to 1.1.8.
- Expanded requirements, troubleshooting, development, and security documentation.

## 1.1.3 — August 7, 2026

### Changed

- Updated `@eliware/mcp-server` from `^1.1.5` to `^1.1.6`.
- Regenerated the npm lockfile.
- Added manual GitHub Actions workflow dispatch support.

### Verification

- Jest: 20 tests passed.
- Coverage: 100% statements, branches, functions, and lines.
- Oxlint: 0 warnings/errors.
- npm audit: 0 vulnerabilities.

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
